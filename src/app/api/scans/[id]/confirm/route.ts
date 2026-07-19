import { head } from "@vercel/blob";
import { NextResponse } from "next/server";

import { getApiScanContext, safeScanError } from "@/lib/scan-api";
import {
  isAllowedScanContentType,
  SCAN_MAX_BYTES,
  scanStorageConfigured,
} from "@/lib/scan-storage";

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
  const scan = await authContext.db.scanSource.findFirst({
    where: {
      id,
      schoolId: authContext.school.id,
      creatorId: authContext.user.id,
    },
  });
  if (!scan?.blobPathname) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  try {
    const metadata = await head(scan.blobPathname);
    if (
      metadata.pathname !== scan.blobPathname ||
      metadata.size <= 0 ||
      metadata.size > SCAN_MAX_BYTES ||
      !isAllowedScanContentType(metadata.contentType)
    ) {
      return NextResponse.json(
        { error: "The stored image failed validation." },
        { status: 415 },
      );
    }

    await authContext.db.scanSource.update({
      where: { id: scan.id },
      data: {
        status: "STORED",
        byteSize: metadata.size,
        contentType: metadata.contentType,
        storedAt: scan.storedAt ?? new Date(),
        safeError: null,
      },
    });

    return NextResponse.json({ scanId: scan.id, status: "STORED" });
  } catch (error) {
    return NextResponse.json({ error: safeScanError(error) }, { status: 502 });
  }
}
