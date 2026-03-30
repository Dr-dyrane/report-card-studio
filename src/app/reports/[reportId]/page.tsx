import Link from "next/link";

import { getReportCardByRouteKey } from "@/lib/report-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function ReportEntryPage({
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
          eyebrow="Report entry"
          title="Report"
          description="Not found"
          action="New"
        />
        <SectionCard title="Missing">
          <div className="frost-panel-soft rounded-[24px] px-4 py-5 text-sm text-[color:var(--text-muted)]">
            This report is not available yet.
          </div>
        </SectionCard>
      </div>
    );
  }

  const summary = [
    ["A1", String(report.assessment1Total)],
    ["A2", String(report.assessment2Total)],
    ["Exam", String(report.examTotal)],
    ["Total", String(report.grandTotal)],
  ];

  const quickMeta = [
    ["Status", report.status.toLowerCase()],
    ["Position", report.position ?? "--"],
    ["Class", String(report.classSize ?? "--")],
    ["Source", "Image"],
  ];

  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader
        eyebrow="Report entry"
        title={report.student.fullName}
        description={`${report.classroom.name} · ${report.term.name}`}
        action="Publish"
        secondaryAction="Save"
      />

      <section className="grid gap-3 xl:grid-cols-[1.16fr_0.84fr]">
        <div className="frost-panel-soft rounded-[26px] px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {quickMeta.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] bg-white/60 px-3 py-3 shadow-[var(--shadow-frost)] sm:rounded-full sm:px-4 sm:py-2"
              >
                <span className="text-sm text-[color:var(--text-muted)]">{label}</span>
                <span className="ml-2 font-semibold text-[color:var(--text-strong)]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-[22px] bg-white/55 px-4 py-4 shadow-[var(--shadow-frost)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[color:var(--text-muted)]">Grand total</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
                  {report.grandTotal}
                </p>
              </div>
              <div className="rounded-full bg-[color:rgba(231,240,255,0.88)] px-4 py-2 text-sm font-semibold text-[color:var(--text-strong)] shadow-[var(--shadow-frost)]">
                {report.grandMax} max
              </div>
            </div>
          </div>
        </div>

        <div className="frost-panel-soft rounded-[26px] px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summary.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[20px] bg-white/55 px-4 py-4 text-center shadow-[var(--shadow-frost)]"
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
      </section>

      <div className="grid gap-3 sm:gap-6 xl:grid-cols-[1.25fr_0.42fr]">
        <SectionCard title="Scores">
          <div className="space-y-3 sm:hidden">
            {report.scores.map((row) => (
              <div
                key={row.id}
                className="frost-panel-soft rounded-[24px] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {row.subject.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      Subject total updates automatically
                    </p>
                  </div>
                  <span className="inline-flex min-w-14 items-center justify-center rounded-full bg-[color:rgba(231,240,255,0.88)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text-strong)] shadow-[var(--shadow-frost)]">
                    {row.totalScore}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["A1", row.a1Score?.toString() ?? "--"],
                    ["A2", row.a2Score?.toString() ?? "--"],
                    ["Exam", row.examScore?.toString() ?? "--"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[18px] bg-white/55 px-3 py-3 text-center shadow-[var(--shadow-frost)]"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                        {label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="frost-panel-soft hidden overflow-hidden rounded-[24px] sm:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-white/40 text-left text-sm text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 text-right font-medium">A1</th>
                  <th className="px-4 py-3 text-right font-medium">A2</th>
                  <th className="px-4 py-3 text-right font-medium">Exam</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="bg-[color:var(--surface)] text-sm">
                {report.scores.map((row) => (
                  <tr
                    key={row.id}
                    className="odd:bg-white/10 transition hover:bg-[color:rgba(231,240,255,0.56)]"
                  >
                    <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                      {row.subject.name}
                    </td>
                    <td className="px-4 py-4 text-right">{row.a1Score ?? "--"}</td>
                    <td className="px-4 py-4 text-right">{row.a2Score ?? "--"}</td>
                    <td className="px-4 py-4 text-right">{row.examScore ?? "--"}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-[color:rgba(231,240,255,0.82)] px-3 py-1 font-semibold text-[color:var(--text-strong)] shadow-[var(--shadow-frost)]">
                        {row.totalScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-[1fr_auto]">
            <div className="frost-panel-soft rounded-[22px] px-4 py-4 sm:rounded-[24px] sm:px-5 sm:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Comment
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {report.teacherComment ?? "No comment yet."}
              </p>
            </div>

            <div className="frost-panel-soft rounded-[22px] px-4 py-4 sm:rounded-[24px] sm:px-5 sm:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Teacher
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {report.classroom.teacherName ?? "Class teacher"}
              </p>
            </div>
          </div>

          <div className="frost-panel mt-4 rounded-[24px] px-4 py-4 sm:mt-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm text-[color:var(--text-muted)]">Ready to review.</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button className="frost-pill rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--text-base)]">
                  Save
                </button>
                <Link
                  href={`/reports/${reportId}/preview`}
                  className="frost-pill rounded-full px-4 py-2 text-center text-sm font-semibold text-[color:var(--text-base)]"
                >
                  Preview
                </Link>
                <button className="col-span-2 rounded-full bg-[color:var(--text-strong)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-frost)] sm:col-span-1">
                  Publish
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Summary">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:sticky xl:top-28 xl:grid-cols-1">
            {[
              ["A1 total", String(report.assessment1Total)],
              ["A2 total", String(report.assessment2Total)],
              ["Exam total", String(report.examTotal)],
              ["Grand total", String(report.grandTotal)],
              ["Position", report.position ?? "--"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`rounded-[20px] px-4 py-4 shadow-[var(--shadow-frost)] sm:rounded-[22px] ${
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

            <div className="rounded-[22px] bg-[color:rgba(232,246,238,0.84)] px-4 py-4 text-sm leading-6 text-[color:var(--success)] shadow-[var(--shadow-frost)]">
              All clear.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
