import { getReportCardByRouteKey } from "@/lib/report-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ReportPreviewPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportCardByRouteKey(reportId);

  if (!report) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow="Report preview"
          title="Preview"
          description="Not found"
          action="Back"
        />
        <SectionCard title="Missing">
          <div className="frost-panel-soft rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
            This preview is not available yet.
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Report preview"
        title="Preview"
        description="Ready for print"
        action="Export"
        secondaryAction="Back"
      />

      <SectionCard title="Report card">
        <div className="frost-panel-strong rounded-[26px] px-4 py-4 sm:px-6 sm:py-6">
          <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] bg-white/55 px-4 py-5 shadow-[var(--shadow-frost)] sm:px-6 sm:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                School name
              </p>
              <h2 className="mt-3 font-display text-3xl leading-[0.98] text-[color:var(--text-strong)] sm:text-4xl">
                {report.classroom.name} Report Card
              </h2>
              <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                {report.term.name} · {report.term.session.name}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Student", report.student.fullName],
                  ["Class", report.classroom.name],
                  ["Position", report.position ?? "--"],
                  ["Grand total", `${report.grandTotal} / ${report.grandMax}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[18px] bg-[color:rgba(246,247,244,0.8)] px-4 py-4"
                  >
                    <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {[
                ["1st Assessment", String(report.assessment1Total)],
                ["2nd Assessment", String(report.assessment2Total)],
                ["Exam", String(report.examTotal)],
                ["Grand Total", String(report.grandTotal)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[22px] px-4 py-4 shadow-[var(--shadow-frost)] ${
                    index === 3
                      ? "bg-[color:rgba(231,240,255,0.88)]"
                      : "frost-panel-soft"
                  }`}
                >
                  <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] bg-white/70 shadow-[var(--shadow-frost)]">
            <div className="hidden sm:block">
              <table className="min-w-full border-separate border-spacing-0">
                <thead className="bg-white/50 text-left text-sm text-[color:var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 text-right font-medium">A1</th>
                    <th className="px-4 py-3 text-right font-medium">A2</th>
                    <th className="px-4 py-3 text-right font-medium">Exam</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {report.scores.map((row) => (
                    <tr key={row.id} className="odd:bg-white/10">
                      <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                        {row.subject.name}
                      </td>
                      <td className="px-4 py-4 text-right">{row.a1Score ?? "--"}</td>
                      <td className="px-4 py-4 text-right">{row.a2Score ?? "--"}</td>
                      <td className="px-4 py-4 text-right">{row.examScore ?? "--"}</td>
                      <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                        {row.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2 p-3 sm:hidden">
              {report.scores.map((row) => (
                <div key={row.id} className="rounded-[20px] bg-white/80 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {row.subject.name}
                    </p>
                    <span className="rounded-full bg-[color:rgba(231,240,255,0.88)] px-3 py-1 text-sm font-semibold text-[color:var(--text-strong)]">
                      {row.totalScore}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-[color:var(--text-muted)]">A1</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                        {row.a1Score ?? "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[color:var(--text-muted)]">A2</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                        {row.a2Score ?? "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[color:var(--text-muted)]">Exam</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                        {row.examScore ?? "--"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
