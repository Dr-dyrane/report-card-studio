import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getExportsCenterData } from "@/lib/export-data";

export default async function ExportsPage() {
  const exportsData = await getExportsCenterData();

  const kpis = [
    {
      label: "Student PDFs",
      value: String(exportsData.studentPdfs.length),
      toneClass: "mood-surface-focus",
    },
    {
      label: "Class Excel",
      value: String(exportsData.classes.length),
      toneClass: "mood-surface-success",
    },
    {
      label: "Class CSV",
      value: String(exportsData.classes.length),
      toneClass: "",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Exports"
        description={
          [exportsData.activeTermName, exportsData.activeSessionName]
            .filter(Boolean)
            .join(" / ") || "Current workspace files"
        }
        action={{ label: "Reports", href: "/reports" }}
      />

      <section className="grid grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`frost-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 ${kpi.toneClass}`}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{kpi.label}</p>
            <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)] sm:text-2xl md:text-3xl">
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Class files" tone="focus">
          <MobileBladeList
            items={exportsData.classes.map((classroom) => ({
              id: classroom.id,
              title: classroom.name,
              subtitle: `${classroom.readyReports} ready reports in the active term`,
              eyebrow: "Class export",
              quickValue: String(classroom.readyReports),
              quickHint: exportsData.preferredClassExport,
              summary:
                exportsData.preferredClassExport === "CSV" ? "CSV first" : "Excel first",
              meta: [
                { label: "Ready reports", value: String(classroom.readyReports) },
                { label: "Excel", value: "Available" },
                { label: "CSV", value: "Available" },
                { label: "Class", value: classroom.name },
              ],
              actions:
                exportsData.preferredClassExport === "CSV"
                  ? [
                      { label: "Download CSV", href: classroom.csvHref, tone: "accent" as const },
                      { label: "Download Excel", href: classroom.excelHref },
                      { label: "Open class", href: `/classes/${classroom.id}` },
                    ]
                  : [
                      {
                        label: "Download Excel",
                        href: classroom.excelHref,
                        tone: "accent" as const,
                      },
                      { label: "Download CSV", href: classroom.csvHref },
                      { label: "Open class", href: `/classes/${classroom.id}` },
                    ],
            }))}
            emptyMessage="No class files are ready yet."
          />

          <div className="grid gap-3">
            {exportsData.classes.length ? (
              exportsData.classes.map((classroom) => (
                <div
                  key={classroom.id}
                  className="frost-panel-soft hidden rounded-[24px] px-4 py-4 sm:block sm:px-5 sm:py-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[color:var(--text-strong)]">
                        {classroom.name}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                        {classroom.readyReports} ready reports in the active term
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {exportsData.preferredClassExport === "CSV" ? (
                        <>
                          <a
                            href={classroom.csvHref}
                            className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
                          >
                            CSV
                          </a>
                          <a
                            href={classroom.excelHref}
                            className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                          >
                            Excel
                          </a>
                        </>
                      ) : (
                        <>
                          <a
                            href={classroom.excelHref}
                            className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
                          >
                            Excel
                          </a>
                          <a
                            href={classroom.csvHref}
                            className="soft-action rounded-full px-4 py-2 text-sm font-medium"
                          >
                            CSV
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state rounded-[24px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No class files are ready yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Student exports"
          tone="success"
          action={
            exportsData.studentPdfs.length ? (
              <Link
                href="/exports"
                aria-label="Reset exports view"
                className="soft-action inline-flex h-10 w-10 items-center justify-center rounded-full"
              >
                <ArrowPathIcon className="h-4.5 w-4.5 stroke-[1.9]" />
              </Link>
            ) : null
          }
        >
          <MobileBladeList
            items={exportsData.studentPdfs.map((file) => ({
              id: file.id,
              title: file.studentName,
              subtitle: file.classroomName,
              eyebrow: "Student export",
              quickValue: exportsData.preferredStudentExport === "PREVIEW" ? "View" : "PDF",
              quickHint: "ready",
              summary:
                exportsData.preferredStudentExport === "PREVIEW"
                  ? `Preview first / ${file.classroomName}`
                  : `PDF first / ${file.classroomName}`,
              meta: [
                { label: "Student", value: file.studentName },
                { label: "Class", value: file.classroomName },
                {
                  label: "Default",
                  value:
                    exportsData.preferredStudentExport === "PREVIEW" ? "Preview" : "PDF",
                },
                { label: "Status", value: "Ready" },
              ],
              actions:
                exportsData.preferredStudentExport === "PREVIEW"
                  ? [
                      {
                        label: "Open preview",
                        href: `/reports/${file.id}/preview`,
                        tone: "accent" as const,
                      },
                      { label: "Open PDF", href: file.href },
                      { label: "Open report", href: `/reports/${file.id}` },
                    ]
                  : [
                      { label: "Open PDF", href: file.href, tone: "accent" as const },
                      { label: "Open preview", href: `/reports/${file.id}/preview` },
                      { label: "Open report", href: `/reports/${file.id}` },
                    ],
            }))}
            emptyMessage="No published student sheets are ready yet."
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {exportsData.studentPdfs.length ? (
              exportsData.studentPdfs.map((file) => (
                <Link
                  key={file.id}
                  href={
                    exportsData.preferredStudentExport === "PREVIEW"
                      ? `/reports/${file.id}/preview`
                      : file.href
                  }
                  className="surface-pocket surface-hover hidden rounded-[22px] px-4 py-4 transition sm:block"
                >
                  <p className="font-semibold text-[color:var(--text-strong)]">
                    {file.studentName}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {file.classroomName}
                  </p>
                  <p className="mt-4 text-sm font-medium text-[color:var(--accent-strong)]">
                    {exportsData.preferredStudentExport === "PREVIEW"
                      ? "Open preview"
                      : "Open PDF"}
                  </p>
                </Link>
              ))
            ) : (
              <div className="empty-state rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No published student sheets are ready yet.
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
