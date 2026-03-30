import { getDb } from "@/lib/db";
import { getOwnedSchool } from "@/lib/owned-school";

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

const fallbackClassrooms = [
  {
    id: "primary-5-lavender",
    name: "Primary 5 Lavender",
    teacherName: "Mrs. Class Teacher",
    studentCount: 20,
    activeReports: 20,
    students: [
      "Student 1",
      "Student 2",
      "Student 3",
      "Student 4",
      "Student 5",
      "Student 6",
      "Student 7",
      "Student 8",
    ],
  },
  {
    id: "primary-5-rose",
    name: "Primary 5 Rose",
    teacherName: "Mrs. Rose Teacher",
    studentCount: 0,
    activeReports: 0,
    students: [],
  },
  {
    id: "primary-4-iris",
    name: "Primary 4 Iris",
    teacherName: "Mr. Iris Teacher",
    studentCount: 0,
    activeReports: 0,
    students: [],
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

export async function getClassroomsList() {
  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) return fallbackClassrooms;

    const classrooms = await db.classroom.findMany({
      where: {
        schoolId: ownedSchool.id,
      },
      include: {
        students: {
          select: { id: true, fullName: true },
          orderBy: [{ fullName: "asc" }],
        },
        reportCards: {
          select: { id: true },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    if (!classrooms.length) return fallbackClassrooms;

    return classrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      teacherName: classroom.teacherName ?? null,
      studentCount: classroom.students.length,
      activeReports: classroom.reportCards.length,
      students: classroom.students.map((student) => student.fullName),
    }));
  } catch {
    return fallbackClassrooms;
  }
}

export async function getClassroomDetail(classId: string) {
  const fallback = fallbackClassrooms.find(
    (classroom) => classroom.id === classId || slugify(classroom.name) === classId,
  );

  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return fallback
        ? {
            id: fallback.id,
            name: fallback.name,
            teacherName: fallback.teacherName ?? "",
            displayOrder: 0,
            studentCount: fallback.studentCount,
            activeReports: fallback.activeReports,
            students: fallbackStudents
              .filter((student) => student.classroomName === fallback.name)
              .map((student) => ({
                id: student.id,
                fullName: student.fullName,
              })),
            subjects: fallbackSubjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
            })),
          }
        : null;
    }

    const classroom = await db.classroom.findFirst({
      where: {
        schoolId: ownedSchool.id,
        OR: [{ id: classId }, { name: classId }],
      },
      include: {
        students: {
          orderBy: [{ fullName: "asc" }],
        },
        reportCards: true,
        classSubjects: {
          include: {
            subject: true,
          },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
    });

    if (!classroom) {
      return null;
    }

    return {
      id: classroom.id,
      name: classroom.name,
      teacherName: classroom.teacherName ?? "",
      displayOrder: classroom.displayOrder,
      studentCount: classroom.students.length,
      activeReports: classroom.reportCards.length,
      students: classroom.students.map((student) => ({
        id: slugify(student.fullName),
        fullName: student.fullName,
      })),
      subjects: classroom.classSubjects.map((item) => ({
        id: item.subject.id,
        name: item.subject.name,
      })),
    };
  } catch {
    return fallback
      ? {
          id: fallback.id,
          name: fallback.name,
          teacherName: fallback.teacherName ?? "",
          displayOrder: 0,
          studentCount: fallback.studentCount,
          activeReports: fallback.activeReports,
          students: fallbackStudents
            .filter((student) => student.classroomName === fallback.name)
            .map((student) => ({
              id: student.id,
              fullName: student.fullName,
            })),
          subjects: fallbackSubjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
          })),
        }
      : null;
  }
}

export async function getStudentsList() {
  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) return fallbackStudents;

    const students = await db.student.findMany({
      where: {
        schoolId: ownedSchool.id,
      },
      include: {
        classroom: true,
        reportCards: {
          where: {
            status: {
              not: "LOCKED",
            },
          },
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
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) return fallbackSubjects;

    const subjects = await db.subject.findMany({
      where: {
        schoolId: ownedSchool.id,
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    if (!subjects.length) return fallbackSubjects;

    return subjects.map((subject) => ({
      id: subject.id,
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

export async function getSubjectDetail(subjectId: string) {
  const fallback = fallbackSubjects.find(
    (subject) => subject.id === subjectId || slugify(subject.name) === subjectId,
  );

  const buildFallbackSubject = () =>
    fallback
      ? {
          id: fallback.id,
          name: fallback.name,
          category: fallback.category,
          assessmentMode: (
            fallback.modeLabel === "Exam only"
              ? "EXAM_ONLY"
              : "CONTINUOUS_AND_EXAM"
          ) as "EXAM_ONLY" | "CONTINUOUS_AND_EXAM",
          a1Max: fallback.modeLabel === "Exam only" ? null : 20,
          a2Max: fallback.modeLabel === "Exam only" ? null : 20,
          examMax: fallback.modeLabel === "Exam only" ? 30 : 60,
          displayOrder: 1,
          isActive: fallback.activeLabel === "Yes",
          classrooms: fallbackClassrooms.map((classroom) => ({
            id: classroom.id,
            name: classroom.name,
          })),
        }
      : null;

  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return buildFallbackSubject();
    }

    const subject = await db.subject.findFirst({
      where: {
        schoolId: ownedSchool.id,
        OR: [{ id: subjectId }, { name: subjectId }],
      },
      include: {
        classSubjects: {
          include: {
            classroom: true,
          },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
    });

    if (!subject) {
      return null;
    }

    return {
      id: subject.id,
      name: subject.name,
      category: subject.category ?? "",
      assessmentMode: subject.assessmentMode,
      a1Max: subject.a1Max,
      a2Max: subject.a2Max,
      examMax: subject.examMax,
      displayOrder: subject.displayOrder,
      isActive: subject.isActive,
      classrooms: subject.classSubjects.map((item) => ({
        id: item.classroom.id,
        name: item.classroom.name,
      })),
    };
  } catch {
    return buildFallbackSubject();
  }
}

export async function getStudentProfileByRouteKey(routeKey: string) {
  const candidateName = routeKey
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
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
        schoolId: ownedSchool.id,
        fullName: candidateName,
      },
      include: {
        classroom: true,
        reportCards: {
          where: {
            status: {
              not: "LOCKED",
            },
          },
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

export async function getStudentEditorDetail(routeKey: string) {
  const candidateName = routeKey
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return null;
    }

    const [student, classrooms] = await Promise.all([
      db.student.findFirst({
        where: {
          schoolId: ownedSchool.id,
          fullName: candidateName,
        },
        include: {
          reportCards: {
            select: { id: true },
          },
        },
      }),
      db.classroom.findMany({
        where: { schoolId: ownedSchool.id },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
    ]);

    if (!student) {
      return null;
    }

    return {
      id: student.id,
      fullName: student.fullName,
      classroomId: student.classroomId,
      isActive: student.isActive,
      classrooms,
      reportCount: student.reportCards.length,
    };
  } catch {
    return null;
  }
}

const fallbackAnalyticsSnapshot = {
  metrics: {
    classAverage: 664,
    topTotal: 825,
    lowestTotal: 530,
    publishedReports: 20,
  },
  subjectPerformance: [
    { subject: "Computer", value: 84, highlight: true, low: false },
    { subject: "Mathematics", value: 78, highlight: false, low: false },
    { subject: "Grammar", value: 76, highlight: false, low: false },
    { subject: "Social Studies", value: 69, highlight: false, low: false },
    { subject: "Science", value: 58, highlight: false, low: false },
    { subject: "Comprehension", value: 34, highlight: false, low: true },
  ],
  distribution: [
    { label: "Strong", value: 8 },
    { label: "Steady", value: 14 },
    { label: "Attention", value: 8 },
  ],
  trendPoints: [590, 612, 628, 651, 664, 678, 690],
};

export async function getAnalyticsSnapshot() {
  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return fallbackAnalyticsSnapshot;
    }

    const reportCards = await db.reportCard.findMany({
      where: {
        classroom: {
          schoolId: ownedSchool.id,
        },
        status: {
          not: "LOCKED",
        },
      },
      include: {
        scores: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ grandTotal: "desc" }, { updatedAt: "desc" }],
    });

    if (!reportCards.length) {
      return fallbackAnalyticsSnapshot;
    }

    const totals = reportCards.map((report) => report.grandTotal);
    const classAverage = Math.round(
      totals.reduce((sum, value) => sum + value, 0) / totals.length,
    );
    const topTotal = Math.max(...totals);
    const lowestTotal = Math.min(...totals);
    const publishedReports = reportCards.filter(
      (report) => report.status === "PUBLISHED",
    ).length;

    const subjectMap = new Map<
      string,
      {
        subject: string;
        total: number;
        count: number;
      }
    >();

    reportCards.forEach((report) => {
      report.scores.forEach((score) => {
        const current = subjectMap.get(score.subjectId) ?? {
          subject: score.subject.name,
          total: 0,
          count: 0,
        };

        current.total += score.totalScore;
        current.count += 1;
        subjectMap.set(score.subjectId, current);
      });
    });

    const subjectPerformance = [...subjectMap.values()]
      .map((subject) => ({
        subject: subject.subject,
        value: Math.round(subject.total / Math.max(subject.count, 1)),
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6)
      .map((subject, index, all) => ({
        ...subject,
        highlight: index === 0,
        low: index === all.length - 1,
      }));

    const distribution = [
      {
        label: "Strong",
        value: reportCards.filter((report) => report.grandTotal >= 700).length,
      },
      {
        label: "Steady",
        value: reportCards.filter(
          (report) => report.grandTotal >= 600 && report.grandTotal < 700,
        ).length,
      },
      {
        label: "Attention",
        value: reportCards.filter((report) => report.grandTotal < 600).length,
      },
    ];

    const trendPoints = [...totals]
      .sort((left, right) => left - right)
      .slice(-7);

    return {
      metrics: {
        classAverage,
        topTotal,
        lowestTotal,
        publishedReports,
      },
      subjectPerformance: subjectPerformance.length
        ? subjectPerformance
        : fallbackAnalyticsSnapshot.subjectPerformance,
      distribution,
      trendPoints: trendPoints.length >= 2
        ? trendPoints
        : fallbackAnalyticsSnapshot.trendPoints,
    };
  } catch {
    return fallbackAnalyticsSnapshot;
  }
}
