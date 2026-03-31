import Link from "next/link";

import { MobileBladeList } from "@/components/mobile/MobileBladeList";
import { getClassroomsList, getSubjectsList } from "@/lib/school-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string;
    category?: string;
    mode?: string;
    class?: string;
    active?: string;
  }>;
}) {
  const [subjects, classrooms, resolvedSearchParams] = await Promise.all([
    getSubjectsList(),
    getClassroomsList(),
    searchParams,
  ]);

  const search = (resolvedSearchParams?.search ?? "").trim().toLowerCase();
  const category = resolvedSearchParams?.category ?? "";
  const mode = resolvedSearchParams?.mode ?? "";
  const selectedClass = resolvedSearchParams?.class ?? "";
  const active = resolvedSearchParams?.active ?? "";

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      !search ||
      subject.name.toLowerCase().includes(search) ||
      subject.category.toLowerCase().includes(search);
    const matchesCategory = !category || subject.category === category;
    const matchesMode = !mode || subject.assessmentMode === mode;
    const matchesClass =
      !selectedClass ||
      subject.classroomNames.some((name) => slugify(name) === selectedClass);
    const matchesActive =
      !active ||
      (active === "active" && subject.isActive) ||
      (active === "inactive" && !subject.isActive);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMode &&
      matchesClass &&
      matchesActive
    );
  });

  const categories = [...new Set(subjects.map((subject) => subject.category))].sort();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        eyebrow="Subjects"
        title="Subjects"
        description="Scoring rules and order"
        action={{ label: "Add", href: "/subjects/new" }}
        secondaryAction={{ label: "Reset", href: "/subjects" }}
      />

      <SectionCard title="Subject catalog">
        <form className="mb-4 grid gap-2 sm:mb-5 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto]">
          <input
            type="text"
            name="search"
            defaultValue={resolvedSearchParams?.search ?? ""}
            placeholder="Search subjects"
            className="surface-input rounded-full px-4 py-2.5 text-sm text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
          <select
            name="category"
            defaultValue={category}
            className="surface-input rounded-full px-4 py-2.5 text-sm text-[color:var(--text-strong)] outline-none"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="mode"
            defaultValue={mode}
            className="surface-input rounded-full px-4 py-2.5 text-sm text-[color:var(--text-strong)] outline-none"
          >
            <option value="">All modes</option>
            <option value="CONTINUOUS_AND_EXAM">A1 + A2 + Exam</option>
            <option value="EXAM_ONLY">Exam only</option>
          </select>
          <select
            name="class"
            defaultValue={selectedClass}
            className="surface-input rounded-full px-4 py-2.5 text-sm text-[color:var(--text-strong)] outline-none"
          >
            <option value="">All classes</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={slugify(classroom.name)}>
                {classroom.name}
              </option>
            ))}
          </select>
          <select
            name="active"
            defaultValue={active}
            className="surface-input rounded-full px-4 py-2.5 text-sm text-[color:var(--text-strong)] outline-none"
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="soft-action-tint rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            Apply
          </button>
        </form>

        <div className="mb-4 flex flex-wrap gap-2 text-sm text-[color:var(--text-muted)]">
          <span className="soft-action rounded-full px-4 py-2">
            {filteredSubjects.length} visible
          </span>
          {selectedClass ? (
            <span className="soft-action rounded-full px-4 py-2">
              {classrooms.find((classroom) => slugify(classroom.name) === selectedClass)?.name}
            </span>
          ) : null}
        </div>

        <MobileBladeList
          items={filteredSubjects.map((subject) => ({
            id: subject.id,
            title: subject.name,
            subtitle: subject.category,
            eyebrow: "Subject",
            badge: {
              label: subject.activeLabel,
              tone: subject.isActive ? "success" : "default",
            },
            quickValue: subject.modeLabel,
            quickHint: subject.maxLabel,
            summary:
              "Review scoring mode, maxes, and class coverage before opening the subject editor.",
            meta: [
              { label: "Category", value: subject.category },
              { label: "Mode", value: subject.modeLabel },
              {
                label: "Classes",
                value: subject.classroomNames.length
                  ? String(subject.classroomNames.length)
                  : "--",
              },
              { label: "Max", value: subject.maxLabel },
            ],
            actions: [
              { label: "Open subject", href: `/subjects/${subject.id}`, tone: "accent" },
            ],
          }))}
          emptyMessage="No subjects match the current filters."
        />

        <div className="frost-panel-soft hidden overflow-hidden rounded-[22px] sm:block">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="table-head text-left text-sm text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Mode</th>
                <th className="px-4 py-3 font-medium">Classes</th>
                <th className="px-4 py-3 font-medium">Max scores</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--surface)] text-sm">
              {filteredSubjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "var(--table-row-odd)" : undefined,
                  }}
                >
                  <td className="px-4 py-4 font-semibold text-[color:var(--text-strong)]">
                    {subject.name}
                  </td>
                  <td className="px-4 py-4 text-[color:var(--text-muted)]">
                    {subject.category}
                  </td>
                  <td className="px-4 py-4">{subject.modeLabel}</td>
                  <td className="px-4 py-4 text-[color:var(--text-muted)]">
                    {subject.classroomNames.length
                      ? subject.classroomNames.join(", ")
                      : "Not assigned"}
                  </td>
                  <td className="px-4 py-4 font-medium text-[color:var(--text-strong)]">
                    {subject.maxLabel}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[color:var(--success-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]">
                      {subject.activeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="soft-action inline-flex rounded-full px-3 py-1.5 font-medium"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredSubjects.length ? (
            <div className="soft-action m-4 rounded-[22px] px-4 py-4 text-sm text-[color:var(--text-muted)]">
              No subjects match the current filters.
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            href="/subjects/new"
            className="soft-action-tint rounded-full px-4 py-2 text-sm font-semibold"
          >
            New subject
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
