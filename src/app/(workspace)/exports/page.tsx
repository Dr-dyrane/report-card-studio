import Link from "next/link";

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
        <SectionCard title="Class files">
          <div className="grid gap-3">
            {exportsData.classes.length ? (
              exportsData.classes.map((classroom) => (
                <div
                  key={classroom.id}
                  className="frost-panel-soft rounded-[24px] px-4 py-4 sm:px-5 sm:py-5"
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-action rounded-[24px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
                No class files are ready yet.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Ready files">
          <div className="grid gap-3">
            {[
              ["Student PDFs", `${exportsData.studentPdfs.length} print-ready sheets`],
              ["Class Excel", `${exportsData.classes.length} workbook exports`],
              ["Class CSV", `${exportsData.classes.length} raw data exports`],
            ].map(([title, note], index) => (
              <div
                key={title}
                className={`rounded-[22px] px-4 py-4 ${
                  index === 0 ? "soft-action-tint" : "surface-pocket"
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

      <SectionCard title="Student PDF exports">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {exportsData.studentPdfs.length ? (
            exportsData.studentPdfs.map((file) => (
              <Link
                key={file.id}
                href={file.href}
                className="surface-pocket surface-hover block rounded-[22px] px-4 py-4 transition"
              >
                <p className="font-semibold text-[color:var(--text-strong)]">
                  {file.studentName}
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {file.classroomName}
                </p>
                <p className="mt-4 text-sm font-medium text-[color:var(--accent-strong)]">
                  Open PDF
                </p>
              </Link>
            ))
          ) : (
            <div className="soft-action rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
              No published student sheets are ready for PDF yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Recent export flow">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["1. Review", "Open the student preview and confirm totals before print."],
            ["2. Export", "Use Excel or CSV for class files, or the print view for PDFs."],
            ["3. Archive", "Published and exported sheets stay ready for later access."],
          ].map(([title, note]) => (
            <div key={title} className="surface-pocket rounded-[22px] px-4 py-4">
              <p className="font-semibold text-[color:var(--text-strong)]">{title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{note}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
