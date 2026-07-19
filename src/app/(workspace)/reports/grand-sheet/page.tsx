import Link from "next/link";

import { GrandSheetEditor } from "@/components/reports/GrandSheetEditor";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GrandSheetPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports · Working draft"
        title="Grand sheet"
        description="Review and correct Primary 3 Grey in one place before anything is added to the database."
        secondaryAction={{ label: "Back to reports", href: "/reports" }}
      />
      <GrandSheetEditor />
      <div className="flex justify-end">
        <Link
          href="/reports"
          className="soft-action rounded-full px-4 py-2 text-sm font-medium"
        >
          Back to reports
        </Link>
      </div>
    </div>
  );
}
