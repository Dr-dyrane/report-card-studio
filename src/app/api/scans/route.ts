import { NextResponse } from "next/server";

import { getApiScanContext } from "@/lib/scan-api";
import {
  isAllowedScanContentType,
  SCAN_MAX_BYTES,
  scanExtension,
  scanUploadConfigured,
} from "@/lib/scan-storage";

export async function POST(request: Request) {
  const context = await getApiScanContext(request);
  if (!context) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!scanUploadConfigured()) {
    return NextResponse.json(
      {
        error:
          "Secure photo storage is not connected. Add the private Blob store before scanning.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    kind?: "REPORT_CARD" | "GRAND_SHEET";
    originalFilename?: string;
    contentType?: string;
    byteSize?: number;
    classroomId?: string;
    termId?: string;
    reportCardId?: string;
  };

  if (body.kind !== "REPORT_CARD" && body.kind !== "GRAND_SHEET") {
    return NextResponse.json({ error: "Invalid scan kind." }, { status: 400 });
  }
  if (
    !body.contentType ||
    !isAllowedScanContentType(body.contentType) ||
    !scanExtension(body.contentType)
  ) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, or WebP image. HEIC is not supported yet." },
      { status: 415 },
    );
  }
  if (
    !Number.isInteger(body.byteSize) ||
    Number(body.byteSize) <= 0 ||
    Number(body.byteSize) > SCAN_MAX_BYTES
  ) {
    return NextResponse.json(
      { error: "The photo must be no larger than 25 MB." },
      { status: 413 },
    );
  }

  const { db, school, user } = context;
  const [classroom, term, reportCard] = await Promise.all([
    body.classroomId
      ? db.classroom.findFirst({
          where: { id: body.classroomId, schoolId: school.id },
          select: { id: true },
        })
      : null,
    body.termId
      ? db.term.findFirst({
          where: { id: body.termId, session: { schoolId: school.id } },
          select: { id: true },
        })
      : null,
    body.reportCardId
      ? db.reportCard.findFirst({
          where: { id: body.reportCardId, classroom: { schoolId: school.id } },
          select: { id: true },
        })
      : null,
  ]);

  if (
    (body.classroomId && !classroom) ||
    (body.termId && !term) ||
    (body.reportCardId && !reportCard)
  ) {
    return NextResponse.json(
      { error: "The selected scan context is not available." },
      { status: 404 },
    );
  }

  const scan = await db.scanSource.create({
    data: {
      kind: body.kind,
      schoolId: school.id,
      creatorId: user.id,
      classroomId: classroom?.id,
      termId: term?.id,
      reportCardId: reportCard?.id,
      originalFilename: body.originalFilename?.slice(0, 240),
      contentType: body.contentType,
      byteSize: body.byteSize,
    },
    select: { id: true },
  });

  const pathname = `scans/${school.id}/${scan.id}/original.${scanExtension(body.contentType)}`;
  await db.scanSource.update({
    where: { id: scan.id },
    data: { blobPathname: pathname },
  });

  return NextResponse.json({ scanId: scan.id, pathname });
}
