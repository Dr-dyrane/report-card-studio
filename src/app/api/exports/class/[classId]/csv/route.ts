import { NextResponse } from "next/server";

import { requireServerSession } from "@/lib/auth-session";
import { datasetToCsv, getClassExportDataset } from "@/lib/export-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  await requireServerSession();
  const { classId } = await params;
  const dataset = await getClassExportDataset(classId);

  if (!dataset) {
    return NextResponse.json({ error: "Export not available." }, { status: 404 });
  }

  return new NextResponse(datasetToCsv(dataset), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset.filenameBase}.csv"`,
    },
  });
}
