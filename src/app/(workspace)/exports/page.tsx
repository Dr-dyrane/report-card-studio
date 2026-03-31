import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { getExportsCenterData } from "@/lib/export-data";

export default async function ExportsPage() {
  const exportsData = await getExportsCenterData();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Exports"
        title="Exports"
        description={
          [exportsData.activeTermName, exportsData.activeSessionName]
            .filter(Boolean)
            .join(" · ") || "Current workspace files"
        }
        action={{ label: "Reports", href: "/reports" }}
        secondaryAction={{ label: "Students", href: "/students" }}
      />

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
                exportsData.preferredClassExport === "CSV"
                  ? "CSV first"
                  : "Excel first",
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
                      { label: "Download Excel", href: classroom.excelHref, tone: "accent" as const },
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

        <SectionCard title="Ready files" tone="success">
          <div className="grid gap-3">
            {[
              ["Student exports", `${exportsData.studentPdfs.length} ready`],
              ["Class Excel", `${exportsData.classes.length} workbook files`],
              ["Class CSV", `${exportsData.classes.length} raw files`],
            ].map(([title, note], index) => (
              <div
                key={title}
                className={`rounded-[22px] px-4 py-4 ${
                  index === 0
                    ? "mood-surface-focus"
                    : index === 1
                      ? "mood-surface-success"
                      : "surface-pocket"
                }`}
              >
                <p className="text-sm text-[color:var(--text-muted)]">{title}</p>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Student exports" tone="focus">
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
                ? "Preview first"
                : "PDF first",
            meta: [
              { label: "Student", value: file.studentName },
              { label: "Class", value: file.classroomName },
              {
                label: "Default",
                value: exportsData.preferredStudentExport === "PREVIEW" ? "Preview" : "PDF",
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
                  {exportsData.preferredStudentExport === "PREVIEW" ? "Open preview" : "Open PDF"}
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
    </div>
  );
}
