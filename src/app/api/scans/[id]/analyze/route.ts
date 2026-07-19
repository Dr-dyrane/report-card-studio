import { get } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { POST as analyzeGrandSheetImage } from "@/app/api/vision/grand-sheet/route";
import { POST as analyzeReportCardImage } from "@/app/api/vision/report-card/route";
import { getApiScanContext, safeScanError } from "@/lib/scan-api";
import {
  isAllowedScanContentType,
  SCAN_MAX_BYTES,
  scanMagicMatches,
  scanStorageConfigured,
} from "@/lib/scan-storage";

const PROMPT_VERSION = "scan-source-v1";

export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authContext = await getApiScanContext(request);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!scanStorageConfigured()) {
    return NextResponse.json(
      { error: "Secure photo storage is not connected." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    studentName?: string;
    className?: string;
  };
  const scan = await authContext.db.scanSource.findFirst({
    where: {
      id,
      schoolId: authContext.school.id,
      creatorId: authContext.user.id,
    },
  });

  if (!scan?.blobPathname || scan.status === "CREATED" || scan.status === "UPLOADING") {
    return NextResponse.json(
      { error: "Wait until the photo is saved securely." },
      { status: 409 },
    );
  }

  const recentAttempts = await authContext.db.scanAttempt.count({
    where: {
      scanSource: {
        schoolId: authContext.school.id,
        creatorId: authContext.user.id,
      },
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentAttempts >= 10) {
    return NextResponse.json(
      { error: "Scan limit reached. Please try again later." },
      { status: 429 },
    );
  }

  const attempt = await authContext.db.$transaction(async (db) => {
    const startedAt = new Date();
    const claim = await db.scanSource.updateMany({
      where: {
        id: scan.id,
        status: { in: ["STORED", "READY", "NEEDS_REVIEW", "FAILED"] },
      },
      data: {
        status: "PROCESSING",
        processingStartedAt: startedAt,
        safeError: null,
      },
    });

    if (claim.count !== 1) return null;

    const latestAttempt = await db.scanAttempt.aggregate({
      where: { scanSourceId: scan.id },
      _max: { attemptNumber: true },
    });

    return db.scanAttempt.create({
      data: {
        scanSourceId: scan.id,
        attemptNumber: (latestAttempt._max.attemptNumber ?? 0) + 1,
        status: "PROCESSING",
        promptVersion: PROMPT_VERSION,
        startedAt,
      },
    });
  });

  if (!attempt) {
    return NextResponse.json(
      { error: "This photo is already being read. Please wait." },
      { status: 409 },
    );
  }

  try {
    const stored = await get(scan.blobPathname, {
      access: "private",
      useCache: false,
    });
    if (!stored || stored.statusCode !== 200) {
      throw new Error("Stored scan is unavailable.");
    }
    if (
      !isAllowedScanContentType(stored.blob.contentType) ||
      stored.blob.size <= 0 ||
      stored.blob.size > SCAN_MAX_BYTES
    ) {
      throw new Error("Stored scan type is invalid.");
    }

    const buffer = Buffer.from(await new Response(stored.stream).arrayBuffer());
    if (!scanMagicMatches(stored.blob.contentType, buffer.subarray(0, 16))) {
      throw new Error("Stored scan content does not match its image type.");
    }

    const imageDataUrl = `data:${stored.blob.contentType};base64,${buffer.toString("base64")}`;
    const internalRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({
        imageDataUrl,
        studentName: body.studentName,
        className: body.className,
      }),
    });
    const response =
      scan.kind === "GRAND_SHEET"
        ? await analyzeGrandSheetImage(internalRequest)
        : await analyzeReportCardImage(internalRequest);
    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok || typeof payload.error === "string") {
      throw new Error("Vision extraction failed.");
    }

    const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];
    const finalStatus = warnings.length ? "NEEDS_REVIEW" : "READY";
    const now = new Date();
    const structuredResult = JSON.parse(
      JSON.stringify(payload),
    ) as Prisma.InputJsonValue;
    const warningJson = JSON.parse(
      JSON.stringify(warnings),
    ) as Prisma.InputJsonValue;

    await authContext.db.$transaction([
      authContext.db.scanAttempt.update({
        where: { id: attempt.id },
        data: {
          status: finalStatus,
          model:
            process.env.OPENAI_VISION_MODEL ||
            process.env.OPENAI_MODEL ||
            "gpt-4o-mini",
          structuredResult,
          warnings: warningJson,
          completedAt: now,
        },
      }),
      authContext.db.scanSource.update({
        where: { id: scan.id },
        data: {
          status: finalStatus,
          completedAt: now,
          safeError: null,
        },
      }),
    ]);

    return NextResponse.json({ ...payload, scanId: scan.id, scanStatus: finalStatus });
  } catch (error) {
    const safeError = safeScanError(error);
    const now = new Date();
    await authContext.db.$transaction([
      authContext.db.scanAttempt.update({
        where: { id: attempt.id },
        data: { status: "FAILED", safeError, completedAt: now },
      }),
      authContext.db.scanSource.update({
        where: { id: scan.id },
        data: { status: "FAILED", safeError, completedAt: now },
      }),
    ]);
    return NextResponse.json({ error: safeError, scanId: scan.id }, { status: 502 });
  }
}
