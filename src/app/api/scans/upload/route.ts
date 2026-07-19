import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getApiScanContext } from "@/lib/scan-api";
import {
  SCAN_ALLOWED_CONTENT_TYPES,
  SCAN_MAX_BYTES,
  scanUploadConfigured,
} from "@/lib/scan-storage";

type UploadPayload = {
  scanId: string;
  schoolId: string;
  creatorId: string;
};

export async function POST(request: Request) {
  if (!scanUploadConfigured()) {
    return NextResponse.json(
      { error: "Secure photo storage is not connected." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const context = await getApiScanContext(request);
        if (!context) throw new Error("Unauthorized.");

        let payload: { scanId?: string } = {};
        try {
          payload = JSON.parse(clientPayload || "{}");
        } catch {
          throw new Error("Invalid upload request.");
        }

        const scan = payload.scanId
          ? await context.db.scanSource.findFirst({
              where: {
                id: payload.scanId,
                schoolId: context.school.id,
                creatorId: context.user.id,
                status: { in: ["CREATED", "UPLOADING"] },
              },
            })
          : null;

        if (!scan || !scan.blobPathname || scan.blobPathname !== pathname) {
          throw new Error("Scan upload is not authorized.");
        }

        await context.db.scanSource.update({
          where: { id: scan.id },
          data: { status: "UPLOADING", safeError: null },
        });

        return {
          allowedContentTypes: [...SCAN_ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: SCAN_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            scanId: scan.id,
            schoolId: scan.schoolId,
            creatorId: scan.creatorId,
          } satisfies UploadPayload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}") as UploadPayload;
        if (!payload.scanId || !payload.schoolId || !payload.creatorId) {
          throw new Error("Invalid scan callback.");
        }

        const context = await getApiScanContext(request);
        const db = context?.db ?? (await import("@/lib/db")).prisma;
        await db.scanSource.updateMany({
          where: {
            id: payload.scanId,
            schoolId: payload.schoolId,
            creatorId: payload.creatorId,
            blobPathname: blob.pathname,
          },
          data: {
            status: "STORED",
            contentType: blob.contentType,
            storedAt: new Date(),
            safeError: null,
          },
        });
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error && /Unauthorized/i.test(error.message)
        ? "Unauthorized."
        : "Secure upload could not be started.";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized." ? 401 : 400 },
    );
  }
}
