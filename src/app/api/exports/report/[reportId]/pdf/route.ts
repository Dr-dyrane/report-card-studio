import { NextResponse } from "next/server";

import { renderReportCardPdf } from "@/lib/pdf/report-card-pdf";
import { getReportCardByRouteKey } from "@/lib/report-data";

function cleanFilePart(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const report = await getReportCardByRouteKey(reportId);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const pdfBuffer = await renderReportCardPdf(report);
  const filename = `${cleanFilePart(`${report.student.fullName}-${report.term.name}-report-card`)}.pdf`;

  return new NextResponse(pdfBuffer as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
