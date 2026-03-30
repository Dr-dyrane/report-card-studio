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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Report preview"
        title="Preview"
        description="Ready for print."
        action="Export"
        secondaryAction="Back"
      />

      <SectionCard title="Report card">
        <div className="frost-panel-strong rounded-[24px] px-6 py-6">
          <div className="pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              School name
            </p>
            <h2 className="mt-3 font-display text-4xl text-[color:var(--text-strong)]">
              Primary 5 Lavender Report Card
            </h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              Second Term · 2024/2025
            </p>
          </div>

          <div className="grid gap-4 py-5 sm:grid-cols-2">
            <div className="space-y-2 text-sm text-[color:var(--text-base)]">
              <p>
                <span className="text-[color:var(--text-muted)]">Student:</span>{" "}
                Student 12
              </p>
              <p>
                <span className="text-[color:var(--text-muted)]">Class:</span>{" "}
                Primary 5 Lavender
              </p>
            </div>
            <div className="space-y-2 text-sm text-[color:var(--text-base)]">
              <p>
                <span className="text-[color:var(--text-muted)]">Position:</span>{" "}
                21st
              </p>
              <p>
                <span className="text-[color:var(--text-muted)]">Grand total:</span>{" "}
                678 / 1000
              </p>
            </div>
          </div>

          <div className="frost-panel-soft mt-5 overflow-hidden rounded-[20px]">
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

          <div className="frost-panel-soft mt-5 grid gap-4 rounded-[20px] px-4 py-4 sm:grid-cols-4">
            {[
              ["1st Assessment", "134"],
              ["2nd Assessment", "113"],
              ["Exam", "486"],
              ["Grand Total", "678"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
