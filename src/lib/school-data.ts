import { getDb } from "@/lib/db";

const fallbackStudents = [
  {
    id: "student-2",
    fullName: "Student 2",
    classroomName: "Primary 5 Lavender",
    grandTotal: 825,
    position: "2nd",
    status: "Published",
    reportHref: "/reports/student-2",
    previewHref: "/reports/student-2/preview",
  },
  {
    id: "student-3",
    fullName: "Student 3",
    classroomName: "Primary 5 Lavender",
    grandTotal: 733,
    position: "12th",
    status: "Published",
    reportHref: "/reports/student-3",
    previewHref: "/reports/student-3/preview",
  },
  {
    id: "student-4",
    fullName: "Student 4",
    classroomName: "Primary 5 Lavender",
    grandTotal: 721,
    position: "13th",
    status: "Published",
    reportHref: "/reports/student-4",
    previewHref: "/reports/student-4/preview",
  },
  {
    id: "student-20",
    fullName: "Student 20",
    classroomName: "Primary 5 Lavender",
    grandTotal: 530,
    position: "30th",
    status: "Published",
    reportHref: "/reports/student-20",
    previewHref: "/reports/student-20/preview",
  },
];

const fallbackSubjects = [
  {
    id: "mathematics",
    name: "Mathematics",
    category: "Core",
    modeLabel: "A1 + A2 + Exam",
    maxLabel: "20 / 20 / 60",
    activeLabel: "Yes",
  },
  {
    id: "grammar",
    name: "Grammar",
    category: "Language",
    modeLabel: "A1 + A2 + Exam",
    maxLabel: "20 / 20 / 60",
    activeLabel: "Yes",
  },
  {
    id: "composition",
    name: "Composition",
    category: "Language",
    modeLabel: "Exam only",
    maxLabel: "30",
    activeLabel: "Yes",
  },
  {
    id: "social-studies",
    name: "Social Studies",
    category: "Core",
    modeLabel: "A1 + A2 + Exam",
    maxLabel: "10 / 10 / 50",
    activeLabel: "Yes",
  },
  {
    id: "quantitative-aptitude",
    name: "Quantitative Aptitude",
    category: "Aptitude",
    modeLabel: "A1 + A2 + Exam",
    maxLabel: "5 / 5 / 40",
    activeLabel: "Yes",
  },
  {
    id: "fine-art",
    name: "Fine Art",
    category: "Arts",
    modeLabel: "Exam only",
    maxLabel: "30",
    activeLabel: "Yes",
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export async function getStudentsList() {
  try {
    const db = await getDb();
    if (!db) return fallbackStudents;

    const students = await db.student.findMany({
      include: {
        classroom: true,
        reportCards: {
          orderBy: [{ updatedAt: "desc" }],
          take: 1,
        },
      },
      orderBy: [{ fullName: "asc" }],
    });

    if (!students.length) return fallbackStudents;

    return students
      .map((student) => {
      const latestReport = student.reportCards[0];

      return {
        id: slugify(student.fullName),
        fullName: student.fullName,
        classroomName: student.classroom.name,
        grandTotal: latestReport?.grandTotal ?? 0,
        position: latestReport?.position ?? "--",
        status: latestReport
          ? `${latestReport.status.slice(0, 1)}${latestReport.status.slice(1).toLowerCase()}`
          : "Draft",
        reportHref: `/reports/${slugify(student.fullName)}`,
        previewHref: `/reports/${slugify(student.fullName)}/preview`,
      };
      })
      .sort((a, b) => {
        if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
        return a.fullName.localeCompare(b.fullName);
      });
  } catch {
    return fallbackStudents;
  }
}

export async function getSubjectsList() {
  try {
    const db = await getDb();
    if (!db) return fallbackSubjects;

    const subjects = await db.subject.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    if (!subjects.length) return fallbackSubjects;

    return subjects.map((subject) => ({
      id: slugify(subject.name),
      name: subject.name,
      category: subject.category ?? "General",
      modeLabel:
        subject.assessmentMode === "EXAM_ONLY"
          ? "Exam only"
          : "A1 + A2 + Exam",
      maxLabel:
        subject.assessmentMode === "EXAM_ONLY"
          ? `${subject.examMax ?? "--"}`
          : `${subject.a1Max ?? "--"} / ${subject.a2Max ?? "--"} / ${subject.examMax ?? "--"}`,
      activeLabel: subject.isActive ? "Yes" : "No",
    }));
  } catch {
    return fallbackSubjects;
  }
}

export async function getStudentProfileByRouteKey(routeKey: string) {
  const candidateName = routeKey
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  try {
    const db = await getDb();
    if (!db) {
      if (candidateName !== "Student 3") {
        return null;
      }

      return {
        fullName: "Student 3",
        classroomName: "Primary 5 Lavender",
        sessionName: "2024/2025",
        termName: "Second Term",
        status: "Active",
        currentReport: {
          total: 733,
          position: "12th",
          status: "Published",
          teacherComment: "She's active in the class.",
          href: "/reports/student-3",
        },
        reportHistory: [
          {
            termName: "Second Term",
            total: 733,
            position: "12th",
            status: "Published",
            href: "/reports/student-3",
          },
        ],
      };
    }

    const student = await db.student.findFirst({
      where: {
        fullName: candidateName,
      },
      include: {
        classroom: true,
        reportCards: {
          include: {
            term: {
              include: {
                session: true,
              },
            },
          },
          orderBy: [{ term: { sequence: "desc" } }, { updatedAt: "desc" }],
        },
      },
    });

    if (!student) {
      return null;
    }

    const currentReport = student.reportCards[0];
    const reportSlug = slugify(student.fullName);

    return {
      fullName: student.fullName,
      classroomName: student.classroom.name,
      sessionName: currentReport?.term.session.name ?? "2024/2025",
      termName: currentReport?.term.name ?? "Second Term",
      status: student.isActive ? "Active" : "Inactive",
      currentReport: currentReport
        ? {
            total: currentReport.grandTotal,
            position: currentReport.position ?? "--",
            status: `${currentReport.status.slice(0, 1)}${currentReport.status.slice(1).toLowerCase()}`,
            teacherComment: currentReport.teacherComment ?? "No comment yet.",
            href: `/reports/${reportSlug}`,
          }
        : null,
      reportHistory: student.reportCards.map((report) => ({
        termName: report.term.name,
        total: report.grandTotal,
        position: report.position ?? "--",
        status: `${report.status.slice(0, 1)}${report.status.slice(1).toLowerCase()}`,
        href: `/reports/${reportSlug}`,
      })),
    };
  } catch {
    return null;
  }
}
