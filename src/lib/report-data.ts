import { getDb } from "@/lib/db";
import { getOwnedSchool } from "@/lib/owned-school";

const fallbackReportCards = [
  {
    id: "student-12",
    status: "DRAFT",
    grandTotal: 678,
    position: "21st",
    student: { fullName: "Student 12" },
    classroom: { name: "Primary 5 Lavender" },
  },
];

const fallbackReportCard = {
  id: "student-12",
  status: "DRAFT",
  position: "21st",
  classSize: 30,
  grandTotal: 678,
  grandMax: 1000,
  assessment1Total: 134,
  assessment2Total: 113,
  examTotal: 486,
  teacherComment: "She's active in the class.",
  headTeacherComment: "",
  student: { fullName: "Student 12" },
  classroom: { name: "Primary 5 Lavender", teacherName: "Mrs. Class Teacher" },
  term: { name: "Second Term", session: { name: "2024/2025" } },
  scores: [
    {
      id: "mathematics",
      a1Score: 12,
      a2Score: 16,
      examScore: 31,
      totalScore: 59,
      subject: { name: "Mathematics", displayOrder: 1, a1Max: 20, a2Max: 20, examMax: 60 },
    },
    {
      id: "grammar",
      a1Score: 12,
      a2Score: 14,
      examScore: 11,
      totalScore: 37,
      subject: { name: "Grammar", displayOrder: 2, a1Max: 20, a2Max: 20, examMax: 60 },
    },
    {
      id: "composition",
      a1Score: null,
      a2Score: null,
      examScore: 15,
      totalScore: 15,
      subject: { name: "Composition", displayOrder: 3, a1Max: null, a2Max: null, examMax: 30 },
    },
    {
      id: "comprehension",
      a1Score: null,
      a2Score: null,
      examScore: 10,
      totalScore: 10,
      subject: { name: "Comprehension", displayOrder: 4, a1Max: null, a2Max: null, examMax: 20 },
    },
    {
      id: "social-studies",
      a1Score: 2,
      a2Score: 8,
      examScore: 32,
      totalScore: 42,
      subject: { name: "Social Studies", displayOrder: 5, a1Max: 10, a2Max: 10, examMax: 50 },
    },
    {
      id: "science",
      a1Score: 5,
      a2Score: 6,
      examScore: 18,
      totalScore: 29,
      subject: { name: "Science", displayOrder: 6, a1Max: 10, a2Max: 10, examMax: 30 },
    },
    {
      id: "computer",
      a1Score: 6,
      a2Score: 6,
      examScore: 48,
      totalScore: 60,
      subject: { name: "Computer", displayOrder: 7, a1Max: 10, a2Max: 10, examMax: 50 },
    },
    {
      id: "history",
      a1Score: 5,
      a2Score: 6,
      examScore: 30,
      totalScore: 41,
      subject: { name: "History", displayOrder: 8, a1Max: 10, a2Max: 10, examMax: 40 },
    },
    {
      id: "fine-art",
      a1Score: null,
      a2Score: null,
      examScore: 15,
      totalScore: 15,
      subject: { name: "Fine Art", displayOrder: 9, a1Max: null, a2Max: null, examMax: 30 },
    },
  ],
};

const fallbackPreviewRows = [...fallbackReportCard.scores]
  .sort((left, right) => left.subject.displayOrder - right.subject.displayOrder)
  .map((row) => ({
    id: row.id,
    subject: row.subject,
    a1Score: row.a1Score,
    a2Score: row.a2Score,
    examScore: row.examScore,
    totalScore: row.totalScore,
  }));

function slugToStudentName(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function studentNameToRouteKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function buildPreviewRows(
  reportScores: Array<{
    id: string;
    a1Score: number | null;
    a2Score: number | null;
    examScore: number | null;
    totalScore: number;
    subject: {
      id: string;
      name: string;
      displayOrder: number;
      a1Max: number | null;
      a2Max: number | null;
      examMax: number | null;
    };
  }>,
  classSubjects: Array<{
    subject: {
      id: string;
      name: string;
      displayOrder: number;
      a1Max: number | null;
      a2Max: number | null;
      examMax: number | null;
    };
  }>,
) {
  const scoreMap = new Map(reportScores.map((row) => [row.subject.id, row]));

  return classSubjects
    .map(({ subject }) => {
      const score = scoreMap.get(subject.id);

      return {
        id: score?.id ?? `missing-${subject.id}`,
        subject,
        a1Score: score?.a1Score ?? null,
        a2Score: score?.a2Score ?? null,
        examScore: score?.examScore ?? null,
        totalScore: score?.totalScore ?? 0,
      };
    })
    .sort((left, right) => left.subject.displayOrder - right.subject.displayOrder);
}

export async function getReportCards() {
  return getReportCardsWithOptions();
}

export async function getReportCardsWithOptions(options?: {
  archived?: boolean;
  includeArchived?: boolean;
}) {
  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return fallbackReportCards;
    }

    const reportCards = await db.reportCard.findMany({
      where: {
        classroom: {
          schoolId: ownedSchool.id,
        },
        ...(options?.includeArchived
          ? {}
          : options?.archived
            ? {
                status: "LOCKED" as const,
              }
            : {
                status: {
                  not: "LOCKED" as const,
                },
              }),
      },
      include: {
        student: true,
        classroom: true,
      },
      orderBy: [{ grandTotal: "desc" }, { updatedAt: "desc" }],
    });

    return reportCards.length ? reportCards : fallbackReportCards;
  } catch {
    return fallbackReportCards;
  }
}

export async function getReportCardByRouteKey(routeKey: string) {
  const candidateName = slugToStudentName(routeKey);

  try {
    const ownedSchool = await getOwnedSchool();
    const db = await getDb();
    if (!db || !ownedSchool) {
      return routeKey === "student-12" || candidateName === "Student 12"
        ? {
            ...fallbackReportCard,
            previewRows: fallbackPreviewRows,
          }
        : null;
    }

    const reportCard = await db.reportCard.findFirst({
      where: {
        classroom: {
          schoolId: ownedSchool.id,
        },
        OR: [{ id: routeKey }, { student: { fullName: candidateName } }],
      },
      include: {
        student: true,
        classroom: {
          include: {
            classSubjects: {
              include: {
                subject: true,
              },
              orderBy: [{ displayOrder: "asc" }],
            },
          },
        },
        term: {
          include: {
            session: true,
          },
        },
        scores: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!reportCard) {
      return routeKey === "student-12" || candidateName === "Student 12"
        ? {
            ...fallbackReportCard,
            previewRows: fallbackPreviewRows,
          }
        : null;
    }

    const scores = [...reportCard.scores].sort(
      (left, right) => left.subject.displayOrder - right.subject.displayOrder,
    );
    const previewRows = buildPreviewRows(scores, reportCard.classroom.classSubjects);

    return {
      ...reportCard,
      scores,
      previewRows,
    };
  } catch {
    return routeKey === "student-12" || candidateName === "Student 12"
      ? {
          ...fallbackReportCard,
          previewRows: fallbackPreviewRows,
        }
      : null;
  }
}

export async function getReportNeighbors(routeKey: string) {
  const reportCards = await getReportCardsWithOptions({ includeArchived: true });
  const currentIndex = reportCards.findIndex(
    (report) =>
      studentNameToRouteKey(report.student.fullName) === routeKey || report.id === routeKey,
  );

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  const previousReport = reportCards[currentIndex - 1];
  const nextReport = reportCards[currentIndex + 1];

  return {
    previous: previousReport
      ? {
          href: `/reports/${studentNameToRouteKey(previousReport.student.fullName)}`,
          label: previousReport.student.fullName,
        }
      : null,
    next: nextReport
      ? {
          href: `/reports/${studentNameToRouteKey(nextReport.student.fullName)}`,
          label: nextReport.student.fullName,
        }
      : null,
  };
}
