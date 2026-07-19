import { NextResponse } from "next/server";

import { getApiScanContext } from "@/lib/scan-api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authContext = await getApiScanContext(request);
  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const scan = await authContext.db.scanSource.findFirst({
    where: {
      id,
      schoolId: authContext.school.id,
      creatorId: authContext.user.id,
    },
    select: {
      id: true,
      kind: true,
      status: true,
      originalFilename: true,
      contentType: true,
      byteSize: true,
      safeError: true,
      storedAt: true,
      updatedAt: true,
      attempts: {
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: {
          status: true,
          structuredResult: true,
          warnings: true,
          safeError: true,
        },
      },
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  return NextResponse.json({
    ...scan,
    latestAttempt: scan.attempts[0] ?? null,
    attempts: undefined,
  });
}
