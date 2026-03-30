import { getReportCardByRouteKey } from "@/lib/report-data";
import { ReportPreviewActions } from "@/components/reports/ReportPreviewActions";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ReportPreviewPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReportCardByRouteKey(reportId);
  const hasSubjectScores = !!report?.scores.some(
    (row) => row.a1Score !== null || row.a2Score !== null || row.examScore !== null,
  );

  if (!report) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow="Report preview"
          title="Preview"
          description="Not found"
        />

        <section className="frost-panel rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)] sm:px-6">
          This preview is not available yet.
        </section>
      </div>
    );
  }

  return (
    <div className="report-preview-page space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Report preview"
        title="Preview"
        description="Ready for print"
      />
      <ReportPreviewActions />

      <article className="report-print-card frost-panel rounded-[26px] px-4 py-4 sm:px-6 sm:py-6">
        <header className="mb-4 flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Report card
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="grid gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                School name
              </p>
              <h2 className="mt-3 font-display text-3xl leading-[0.98] text-[color:var(--text-strong)] sm:text-4xl">
                {report.classroom.name} Report Card
              </h2>
              <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                {report.term.name} · {report.term.session.name}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Student", report.student.fullName],
                ["Class", report.classroom.name],
                ["Position", report.position ?? "--"],
                ["Grand total", `${report.grandTotal} / ${report.grandMax}`],
              ].map(([label, value]) => (
                <div key={label} className="surface-pocket rounded-[20px] px-4 py-4">
                  <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              ["1st Assessment", String(report.assessment1Total)],
              ["2nd Assessment", String(report.assessment2Total)],
              ["Exam", String(report.examTotal)],
              ["Grand Total", String(report.grandTotal)],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`rounded-[20px] px-4 py-4 ${
                  index === 3 ? "soft-action-tint" : "surface-pocket"
                }`}
              >
                <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </aside>
        </div>

        <section className="mt-5">
          {hasSubjectScores ? (
            <>
              <div className="hidden overflow-hidden rounded-[22px] bg-white/72 sm:block">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="bg-white/50 text-left text-sm text-[color:var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 text-right font-medium">A1 Max</th>
                      <th className="px-4 py-3 text-right font-medium">A1 Score</th>
                      <th className="px-4 py-3 text-right font-medium">A2 Max</th>
                      <th className="px-4 py-3 text-right font-medium">A2 Score</th>
                      <th className="px-4 py-3 text-right font-medium">Exam Max</th>
                      <th className="px-4 py-3 text-right font-medium">Exam Score</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-sm">
                    {report.scores.map((row) => (
                      <tr key={row.id} className="odd:bg-white/10">
                        <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                          {row.subject.name}
                        </td>
                        <td className="px-4 py-4 text-right text-[color:var(--text-muted)]">
                          {row.subject.a1Max ?? "--"}
                        </td>
                        <td className="px-4 py-4 text-right">{row.a1Score ?? "--"}</td>
                        <td className="px-4 py-4 text-right text-[color:var(--text-muted)]">
                          {row.subject.a2Max ?? "--"}
                        </td>
                        <td className="px-4 py-4 text-right">{row.a2Score ?? "--"}</td>
                        <td className="px-4 py-4 text-right text-[color:var(--text-muted)]">
                          {row.subject.examMax ?? "--"}
                        </td>
                        <td className="px-4 py-4 text-right">{row.examScore ?? "--"}</td>
                        <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                          {row.totalScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 sm:hidden">
                {report.scores.map((row) => (
                  <div key={row.id} className="surface-pocket rounded-[20px] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[color:var(--text-strong)]">
                        {row.subject.name}
                      </p>
                      <span className="soft-action-tint rounded-full px-3 py-1 text-sm font-semibold">
                        {row.totalScore}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-[color:var(--text-muted)]">
                          A1 {row.subject.a1Max ? `· ${row.subject.a1Max}` : ""}
                        </p>
                        <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                          {row.a1Score ?? "--"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[color:var(--text-muted)]">
                          A2 {row.subject.a2Max ? `· ${row.subject.a2Max}` : ""}
                        </p>
                        <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                          {row.a2Score ?? "--"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[color:var(--text-muted)]">
                          Exam {row.subject.examMax ? `· ${row.subject.examMax}` : ""}
                        </p>
                        <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                          {row.examScore ?? "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="surface-pocket rounded-[22px] px-5 py-6 sm:px-6 sm:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Subject rows
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[color:var(--text-strong)]">
                This preview only has the saved term totals so far
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                The overall assessment and grand totals were imported, but the
                subject-by-subject scores for this student have not been synced into the
                database yet. Once those row values are captured, this preview will match
                the spreadsheet layout fully.
              </p>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
