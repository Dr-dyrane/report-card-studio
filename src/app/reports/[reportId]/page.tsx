import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const rows = [
  { subject: "Mathematics", a1: "12", a2: "16", exam: "31", total: "59" },
  { subject: "Grammar", a1: "12", a2: "14", exam: "11", total: "37" },
  { subject: "Composition", a1: "--", a2: "--", exam: "15", total: "15" },
  { subject: "Comprehension", a1: "--", a2: "--", exam: "10", total: "10" },
  {
    subject: "Spelling/Dictation",
    a1: "--",
    a2: "--",
    exam: "22",
    total: "22",
  },
  { subject: "Social Studies", a1: "2", a2: "8", exam: "32", total: "42" },
  { subject: "Science", a1: "5", a2: "6", exam: "18", total: "29" },
  {
    subject: "Citizenship Education",
    a1: "10",
    a2: "10",
    exam: "20",
    total: "40",
  },
  { subject: "Fine Art", a1: "--", a2: "--", exam: "15", total: "15" },
];

const summary = [
  ["A1", "134"],
  ["A2", "113"],
  ["Exam", "486"],
  ["Total", "678"],
];

export default async function ReportEntryPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader
        eyebrow="Report entry"
        title="Student 12"
        description="Primary 5 Lavender · Second Term"
        action="Publish"
        secondaryAction="Save"
      />

      <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="frost-panel-soft rounded-[26px] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[
              ["Status", "Draft"],
              ["Position", "21st"],
              ["Grand", "678"],
              ["Class", "30"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-full bg-white/60 px-3 py-2 text-sm shadow-[var(--shadow-frost)] sm:px-4"
              >
                <span className="text-[color:var(--text-muted)]">{label}</span>
                <span className="ml-2 font-semibold text-[color:var(--text-strong)]">
                  {value}
                </span>
              </div>
            ))}
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
          <div className="-mx-1 space-y-2 sm:hidden">
            {rows.map((row) => (
              <div
                key={row.subject}
                className="frost-panel-soft rounded-[24px] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {row.subject}
                  </p>
                  <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-[color:rgba(231,240,255,0.82)] px-3 py-1 text-sm font-semibold text-[color:var(--text-strong)] shadow-[var(--shadow-frost)]">
                    {row.total}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[color:var(--text-muted)]">A1</p>
                    <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                      {row.a1}
                    </p>
                  </div>
                  <div>
                    <p className="text-[color:var(--text-muted)]">A2</p>
                    <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                      {row.a2}
                    </p>
                  </div>
                  <div>
                    <p className="text-[color:var(--text-muted)]">Exam</p>
                    <p className="mt-1 font-medium text-[color:var(--text-strong)]">
                      {row.exam}
                    </p>
                  </div>
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
                {rows.map((row) => (
                  <tr
                    key={row.subject}
                    className="odd:bg-white/10 transition hover:bg-[color:rgba(231,240,255,0.56)]"
                  >
                    <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                      {row.subject}
                    </td>
                    <td className="px-4 py-4 text-right">{row.a1}</td>
                    <td className="px-4 py-4 text-right">{row.a2}</td>
                    <td className="px-4 py-4 text-right">{row.exam}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-[color:rgba(231,240,255,0.82)] px-3 py-1 font-semibold text-[color:var(--text-strong)] shadow-[var(--shadow-frost)]">
                        {row.total}
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
                She&apos;s active in the class.
              </p>
            </div>

            <div className="frost-panel-soft rounded-[22px] px-4 py-4 sm:rounded-[24px] sm:px-5 sm:py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Teacher
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                Mrs. Class Teacher
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
                  className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white shadow-[var(--shadow-frost)]"
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
              ["A1 total", "134"],
              ["A2 total", "113"],
              ["Exam total", "486"],
              ["Grand total", "678"],
              ["Position", "21st"],
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
