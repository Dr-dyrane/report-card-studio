import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Exports"
        description="PDF, Excel, CSV."
        action="PDF"
        secondaryAction="Excel"
      />

      <SectionCard title="Files">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Student PDF", "Print ready"],
            ["Class Excel", "Spreadsheet"],
            ["Class CSV", "Raw data"],
          ].map(([title, note]) => (
            <div
              key={title}
              className="frost-panel-soft rounded-[24px] px-5 py-5"
            >
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                {title}
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {note}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
