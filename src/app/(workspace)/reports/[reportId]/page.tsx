import { ReportEntryEditor } from "@/components/reports/ReportEntryEditor";
import { PageHeader } from "@/components/ui/PageHeader";
import { getReportCardByRouteKey, getReportNeighbors } from "@/lib/report-data";

export default async function ReportEntryPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const [report, neighbors] = await Promise.all([
    getReportCardByRouteKey(reportId),
    getReportNeighbors(reportId),
  ]);

  if (!report) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow="Report entry"
          title="Report"
          description="Not found"
          action={{ label: "New", href: "/reports/new" }}
        />
      </div>
    );
  }

  const quickMeta = [
    ["Status", report.status === "LOCKED" ? "archived" : report.status.toLowerCase()],
    ["Position", report.position ?? "--"],
    ["Students", String(report.classSize ?? "--")],
    ["Teacher", report.classroom.teacherName ?? "Class teacher"],
  ];

  const summary = [
    ["A1", String(report.assessment1Total)],
    ["A2", String(report.assessment2Total)],
    ["Exam", String(report.examTotal)],
    ["Total", String(report.grandTotal)],
  ];

  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader
        eyebrow="Report entry"
        title={report.student.fullName}
        description={[report.classroom.name, report.term.name].filter(Boolean).join(" · ")}
      />

      <section className="frost-panel-strong rounded-[28px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-pocket rounded-[24px] px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {quickMeta.map(([label, value]) => (
                <div
                  key={label}
                  className="soft-action rounded-[18px] px-3 py-3 sm:rounded-full sm:px-4 sm:py-2"
                >
                  <span className="text-sm text-[color:var(--text-muted)]">{label}</span>
                  <span className="ml-2 font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="surface-pocket mt-3 rounded-[22px] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[color:var(--text-muted)]">Grand total</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-[color:var(--text-strong)]">
                    {report.grandTotal}
                  </p>
                </div>
                <div className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold">
                  {report.grandMax} max
                </div>
              </div>
            </div>
          </div>

          <div className="surface-pocket rounded-[24px] px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summary.map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[20px] px-4 py-4 text-center shadow-[var(--shadow-frost)] ${
                    index === 3 ? "soft-action-tint" : "soft-action"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReportEntryEditor
        reportCardId={report.id}
        reportId={reportId}
        rows={report.previewRows.map((row) => ({
          id: row.id,
          subject: row.subject.name,
          a1: row.a1Score?.toString() ?? "",
          a2: row.a2Score?.toString() ?? "",
          exam: row.examScore?.toString() ?? "",
          total: row.totalScore,
          a1Max: row.subject.a1Max,
          a2Max: row.subject.a2Max,
          examMax: row.subject.examMax,
        }))}
        teacherComment={report.teacherComment ?? ""}
        teacherName={report.classroom.teacherName ?? "Class teacher"}
        position={report.position ?? "--"}
        initialAssessment1Total={report.assessment1Total}
        initialAssessment2Total={report.assessment2Total}
        initialExamTotal={report.examTotal}
        initialGrandTotal={report.grandTotal}
        previousReport={neighbors.previous}
        nextReport={neighbors.next}
        reportStatus={report.status}
      />
    </div>
  );
}
