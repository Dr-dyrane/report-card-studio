import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const label = studentId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student profile"
        title={label}
        description="Primary 5 Lavender."
        action="New report"
        secondaryAction="Export"
      />

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Identity card">
          <dl className="space-y-3 text-sm text-[color:var(--text-base)]">
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--text-muted)]">Class</dt>
              <dd>Primary 5 Lavender</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--text-muted)]">Session</dt>
              <dd>2024/2025</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--text-muted)]">Term</dt>
              <dd>Second Term</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--text-muted)]">Status</dt>
              <dd>Active</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Current term snapshot">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Grand total", "733"],
              ["Position", "12th"],
              ["Status", "Published"],
            ].map(([labelText, value]) => (
              <div
                key={labelText}
                className="rounded-[22px] border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] px-4 py-4"
              >
                <p className="text-sm text-[color:var(--text-muted)]">{labelText}</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[color:var(--text-muted)]">
            Comment: She&apos;s active in the class.
          </p>
        </SectionCard>
      </section>

      <SectionCard title="Report history">
        <div className="overflow-hidden rounded-[22px] border border-[color:var(--border-soft)]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-[color:var(--highlight)] text-left text-sm text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Term</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--surface)] text-sm">
              <tr>
                <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                  Second Term
                </td>
                <td className="px-4 py-4 text-right font-semibold text-[color:var(--text-strong)]">
                  733
                </td>
                <td className="px-4 py-4 text-right">12th</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                    Published
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href="/reports/student-12"
                    className="font-semibold text-[color:var(--accent-strong)]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
