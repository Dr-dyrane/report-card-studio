import { db } from "@/lib/db";

const fallbackReportCards = [
  {
    id: "student-12",
    status: "DRAFT",
    grandTotal: 678,
    position: "21st",
    student: { fullName: "Student 12" },
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
      subject: { name: "Mathematics", displayOrder: 1 },
    },
    {
      id: "grammar",
      a1Score: 12,
      a2Score: 14,
      examScore: 11,
      totalScore: 37,
      subject: { name: "Grammar", displayOrder: 2 },
    },
    {
      id: "composition",
      a1Score: null,
      a2Score: null,
      examScore: 15,
      totalScore: 15,
      subject: { name: "Composition", displayOrder: 3 },
    },
    {
      id: "comprehension",
      a1Score: null,
      a2Score: null,
      examScore: 10,
      totalScore: 10,
      subject: { name: "Comprehension", displayOrder: 4 },
    },
    {
      id: "social-studies",
      a1Score: 2,
      a2Score: 8,
      examScore: 32,
      totalScore: 42,
      subject: { name: "Social Studies", displayOrder: 5 },
    },
    {
      id: "science",
      a1Score: 5,
      a2Score: 6,
      examScore: 18,
      totalScore: 29,
      subject: { name: "Science", displayOrder: 6 },
    },
    {
      id: "computer",
      a1Score: 6,
      a2Score: 6,
      examScore: 48,
      totalScore: 60,
      subject: { name: "Computer", displayOrder: 7 },
    },
    {
      id: "history",
      a1Score: 5,
      a2Score: 6,
      examScore: 30,
      totalScore: 41,
      subject: { name: "History", displayOrder: 8 },
    },
    {
      id: "fine-art",
      a1Score: null,
      a2Score: null,
      examScore: 15,
      totalScore: 15,
      subject: { name: "Fine Art", displayOrder: 9 },
    },
  ],
};

function slugToStudentName(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getReportCards() {
  try {
    const reportCards = await db.reportCard.findMany({
      include: {
        student: true,
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
    const reportCard = await db.reportCard.findFirst({
      where: {
        OR: [{ id: routeKey }, { student: { fullName: candidateName } }],
      },
      include: {
        student: true,
        classroom: true,
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
        ? fallbackReportCard
        : null;
    }

    const scores = [...reportCard.scores].sort(
      (left, right) => left.subject.displayOrder - right.subject.displayOrder,
    );

    return {
      ...reportCard,
      scores,
    };
  } catch {
    return routeKey === "student-12" || candidateName === "Student 12"
      ? fallbackReportCard
      : null;
  }
}
