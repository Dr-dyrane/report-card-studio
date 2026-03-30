import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default function WorkspaceNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Missing" title="Not found" description="Unavailable." />
      <SectionCard title="Next">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/students"
            className="soft-action-tint inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Students
          </Link>
          <Link
            href="/reports"
            className="soft-action inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
          >
            Reports
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
