import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Analytics"
        description="Class, student, subject."
        action="Open"
        secondaryAction="Compare"
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Class performance">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Class average", "664"],
              ["Top total", "825"],
              ["Lowest total", "530"],
              ["Published reports", "20"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="frost-panel-soft rounded-[22px] px-4 py-4"
              >
                <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Trends">
          <div className="space-y-4">
            {[
              "Computer leads the class.",
              "Comprehension and Oral Reading need work.",
              "Live data is next.",
            ].map((item) => (
              <div
                key={item}
                className="frost-panel-soft rounded-[22px] px-4 py-4 text-sm leading-6 text-[color:var(--text-base)]"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
