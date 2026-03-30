import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

const previewRows = [
  ["Mathematics", "12", "16", "31", "59"],
  ["Grammar", "12", "14", "11", "37"],
  ["Composition", "--", "--", "15", "15"],
  ["Comprehension", "--", "--", "10", "10"],
  ["Social Studies", "2", "8", "32", "42"],
  ["Science", "5", "6", "18", "29"],
  ["Computer", "6", "6", "48", "60"],
  ["History", "5", "6", "30", "41"],
  ["Fine Art", "--", "--", "15", "15"],
];

export default function ReportPreviewPage() {
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
                Primary 5 Lavender Report Card
              </h2>
              <p className="mt-3 text-sm text-[color:var(--text-muted)]">
                Second Term · 2024/2025
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Student", "Student 12"],
                  ["Class", "Primary 5 Lavender"],
                  ["Position", "21st"],
                  ["Grand total", "678 / 1000"],
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
                ["1st Assessment", "134"],
                ["2nd Assessment", "113"],
                ["Exam", "486"],
                ["Grand Total", "678"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[22px] px-4 py-4 shadow-[var(--shadow-frost)] ${
                    index === 3 ? "bg-[color:rgba(231,240,255,0.88)]" : "frost-panel-soft"
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
                  {previewRows.map(([subject, a1, a2, exam, total]) => (
                    <tr key={subject} className="odd:bg-white/10">
                      <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                        {subject}
                      </td>
                      <td className="px-4 py-4 text-right">{a1}</td>
                      <td className="px-4 py-4 text-right">{a2}</td>
                      <td className="px-4 py-4 text-right">{exam}</td>
                      <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                        {total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2 p-3 sm:hidden">
              {previewRows.map(([subject, a1, a2, exam, total]) => (
                <div key={subject} className="rounded-[20px] bg-white/80 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-[color:var(--text-strong)]">
                      {subject}
                    </p>
                    <span className="rounded-full bg-[color:rgba(231,240,255,0.88)] px-3 py-1 text-sm font-semibold text-[color:var(--text-strong)]">
                      {total}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-[color:var(--text-muted)]">A1</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">{a1}</p>
                    </div>
                    <div>
                      <p className="text-[color:var(--text-muted)]">A2</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">{a2}</p>
                    </div>
                    <div>
                      <p className="text-[color:var(--text-muted)]">Exam</p>
                      <p className="mt-1 font-medium text-[color:var(--text-strong)]">{exam}</p>
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
