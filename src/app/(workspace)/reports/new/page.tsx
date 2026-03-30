import { NewReportFlow } from "@/components/reports/NewReportFlow";
import { NewReportFlowProvider } from "@/components/reports/NewReportFlowContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { getClassroomsList } from "@/lib/school-data";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const classrooms = await getClassroomsList();
  const resolvedSearchParams = await searchParams;
  const initialMode = resolvedSearchParams?.mode === "scan" ? "scan" : "manual";

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="New report"
        description="Start from a clean sheet or scan a card image."
        action={{ label: "Classes", href: "/classes" }}
        secondaryAction={{ label: "Reports", href: "/reports" }}
      />

      <NewReportFlowProvider
        initialMode={initialMode}
        initialClassroomId={classrooms[0]?.id ?? ""}
      >
        <NewReportFlow
          initialMode={initialMode}
          classrooms={classrooms.map((classroom) => ({
            id: classroom.id,
            name: classroom.name,
            studentCount: classroom.studentCount,
            activeReports: classroom.activeReports,
          }))}
        />
      </NewReportFlowProvider>
    </div>
  );
}
