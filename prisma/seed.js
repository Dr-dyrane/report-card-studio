/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, AssessmentMode, ReportStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const subjectInputs = [
  ["Mathematics", "Core", AssessmentMode.CONTINUOUS_AND_EXAM, 20, 20, 60, 1],
  ["Grammar", "Language", AssessmentMode.CONTINUOUS_AND_EXAM, 20, 20, 60, 2],
  ["Composition", "Language", AssessmentMode.EXAM_ONLY, null, null, 30, 3],
  ["Comprehension", "Language", AssessmentMode.EXAM_ONLY, null, null, 20, 4],
  ["Spelling/Dictation", "Language", AssessmentMode.EXAM_ONLY, null, null, 30, 5],
  ["Social Studies", "Core", AssessmentMode.CONTINUOUS_AND_EXAM, 10, 10, 50, 6],
  ["Science", "Core", AssessmentMode.CONTINUOUS_AND_EXAM, 10, 10, 30, 7],
  ["Computer", "Technology", AssessmentMode.CONTINUOUS_AND_EXAM, 10, 10, 50, 8],
  ["History", "Humanities", AssessmentMode.CONTINUOUS_AND_EXAM, 10, 10, 40, 9],
  ["Fine Art", "Arts", AssessmentMode.EXAM_ONLY, null, null, 30, 10],
  ["Citizenship Education", "Humanities", AssessmentMode.CONTINUOUS_AND_EXAM, 10, 10, 30, 11],
];

const studentNames = Array.from({ length: 20 }, (_, index) => `Student ${index + 1}`);

const studentReportSummaries = {
  "Student 1": {
    status: ReportStatus.PUBLISHED,
    position: "11th",
    grandTotal: 730,
    assessment1Total: 119,
    assessment2Total: 120,
    examTotal: 491,
    teacherComment: "Steady work across subjects.",
  },
  "Student 2": {
    status: ReportStatus.PUBLISHED,
    position: "1st",
    grandTotal: 825,
    assessment1Total: 143,
    assessment2Total: 131,
    examTotal: 537,
    teacherComment: "Excellent work this term.",
  },
  "Student 3": {
    status: ReportStatus.PUBLISHED,
    position: "12th",
    grandTotal: 733,
    assessment1Total: 134,
    assessment2Total: 113,
    examTotal: 486,
    teacherComment: "She talks too much in the class.",
  },
  "Student 4": {
    status: ReportStatus.PUBLISHED,
    position: "13th",
    grandTotal: 721,
    assessment1Total: 109,
    assessment2Total: 120,
    examTotal: 492,
    teacherComment: "She is eager to learn.",
  },
  "Student 5": {
    status: ReportStatus.PUBLISHED,
    position: "14th",
    grandTotal: 719,
    assessment1Total: 116,
    assessment2Total: 123,
    examTotal: 480,
    teacherComment: "She is eager to learn.",
  },
  "Student 6": {
    status: ReportStatus.PUBLISHED,
    position: "15th",
    grandTotal: 705,
    assessment1Total: 104,
    assessment2Total: 109,
    examTotal: 492,
    teacherComment: "She is eager to learn and hardworking.",
  },
  "Student 7": {
    status: ReportStatus.PUBLISHED,
    position: "16th",
    grandTotal: 694,
    assessment1Total: 123,
    assessment2Total: 92,
    examTotal: 479,
    teacherComment: "She willing to learn.",
  },
  "Student 8": {
    status: ReportStatus.PUBLISHED,
    position: "17th",
    grandTotal: 682,
    assessment1Total: 116,
    assessment2Total: 111,
    examTotal: 455,
    teacherComment: "She is quiet and eager to learn.",
  },
  "Student 9": {
    status: ReportStatus.PUBLISHED,
    position: "18th",
    grandTotal: 664,
    assessment1Total: 91,
    assessment2Total: 104,
    examTotal: 469,
    teacherComment: "He is ready to learn.",
  },
  "Student 10": {
    status: ReportStatus.PUBLISHED,
    position: "19th",
    grandTotal: 666,
    assessment1Total: 117,
    assessment2Total: 111,
    examTotal: 438,
    teacherComment: "She is ready to learn.",
  },
  "Student 11": {
    status: ReportStatus.PUBLISHED,
    position: "20th",
    grandTotal: 659,
    assessment1Total: 119,
    assessment2Total: 111,
    examTotal: 429,
    teacherComment: "She is eager to learn.",
  },
  "Student 12": {
    status: ReportStatus.PUBLISHED,
    position: "21st",
    grandTotal: 678,
    assessment1Total: 134,
    assessment2Total: 113,
    examTotal: 486,
    teacherComment: "She's active in the class.",
  },
  "Student 13": {
    status: ReportStatus.PUBLISHED,
    position: "22nd",
    grandTotal: 642,
    assessment1Total: 110,
    assessment2Total: 97,
    examTotal: 435,
    teacherComment: "She is eager to learn.",
  },
  "Student 14": {
    status: ReportStatus.PUBLISHED,
    position: "23rd",
    grandTotal: 631,
    assessment1Total: 109,
    assessment2Total: 105,
    examTotal: 417,
    teacherComment: "She is ready to learn.",
  },
  "Student 15": {
    status: ReportStatus.PUBLISHED,
    position: "24th",
    grandTotal: 625,
    assessment1Total: 107,
    assessment2Total: 122,
    examTotal: 396,
    teacherComment: "She is eager to learn.",
  },
  "Student 16": {
    status: ReportStatus.PUBLISHED,
    position: "25th",
    grandTotal: 639,
    assessment1Total: 109,
    assessment2Total: 107,
    examTotal: 423,
    teacherComment: "She is willing to learn.",
  },
  "Student 17": {
    status: ReportStatus.PUBLISHED,
    position: "27th",
    grandTotal: 599,
    assessment1Total: 97,
    assessment2Total: 88,
    examTotal: 414,
    teacherComment: "He is eager to learn but very playful in the class.",
  },
  "Student 18": {
    status: ReportStatus.PUBLISHED,
    position: "26th",
    grandTotal: 619,
    assessment1Total: 108,
    assessment2Total: 105,
    examTotal: 396,
    teacherComment: "She is willing to learn.",
  },
  "Student 19": {
    status: ReportStatus.PUBLISHED,
    position: "28th",
    grandTotal: 585,
    assessment1Total: 91,
    assessment2Total: 91,
    examTotal: 403,
    teacherComment: "She is eager to learn.",
  },
  "Student 20": {
    status: ReportStatus.PUBLISHED,
    position: "30th",
    grandTotal: 530,
    assessment1Total: 97,
    assessment2Total: 84,
    examTotal: 349,
    teacherComment: "She is trying her best now.",
  },
};

const student12Scores = {
  Mathematics: { a1: 12, a2: 16, exam: 31, total: 59 },
  Grammar: { a1: 12, a2: 14, exam: 11, total: 37 },
  Composition: { a1: null, a2: null, exam: 15, total: 15 },
  Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
  "Spelling/Dictation": { a1: null, a2: null, exam: 22, total: 22 },
  "Social Studies": { a1: 2, a2: 8, exam: 32, total: 42 },
  Science: { a1: 5, a2: 6, exam: 18, total: 29 },
  Computer: { a1: 6, a2: 6, exam: 48, total: 60 },
  History: { a1: 5, a2: 6, exam: 30, total: 41 },
  "Fine Art": { a1: null, a2: null, exam: 15, total: 15 },
  "Citizenship Education": { a1: 10, a2: 10, exam: 20, total: 40 },
};

async function main() {
  await prisma.reportScore.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.term.deleteMany();
  await prisma.session.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.school.deleteMany();

  const school = await prisma.school.create({
    data: { name: "Report Card Studio Demo School" },
  });

  const session = await prisma.session.create({
    data: {
      name: "2024/2025",
      isActive: true,
      schoolId: school.id,
    },
  });

  const term = await prisma.term.create({
    data: {
      name: "Second Term",
      sequence: 2,
      isActive: true,
      sessionId: session.id,
      nextTermBegins: "2026-05-05",
    },
  });

  const classroom = await prisma.classroom.create({
    data: {
      name: "Primary 5 Lavender",
      level: "Primary 5",
      teacherName: "Mrs. Class Teacher",
      displayOrder: 1,
      schoolId: school.id,
    },
  });

  const subjects = [];
  for (const [name, category, mode, a1Max, a2Max, examMax, displayOrder] of subjectInputs) {
    const subject = await prisma.subject.create({
      data: {
        name,
        category,
        assessmentMode: mode,
        a1Max,
        a2Max,
        examMax,
        displayOrder,
        schoolId: school.id,
      },
    });

    subjects.push(subject);

    await prisma.classSubject.create({
      data: {
        classroomId: classroom.id,
        subjectId: subject.id,
        displayOrder,
      },
    });
  }

  const students = [];
  for (const fullName of studentNames) {
    const student = await prisma.student.create({
      data: {
        fullName,
        schoolId: school.id,
        classroomId: classroom.id,
      },
    });
    students.push(student);
  }

  for (const student of students) {
    const summary = studentReportSummaries[student.fullName];
    if (!summary) continue;

    const reportCard = await prisma.reportCard.create({
      data: {
        studentId: student.id,
        classroomId: classroom.id,
        termId: term.id,
        status: summary.status,
        position: summary.position,
        classSize: 30,
        grandTotal: summary.grandTotal,
        grandMax: 1000,
        assessment1Total: summary.assessment1Total,
        assessment2Total: summary.assessment2Total,
        examTotal: summary.examTotal,
        teacherComment: summary.teacherComment,
      },
    });

    for (const subject of subjects) {
      const score = student.fullName === "Student 12" ? student12Scores[subject.name] : null;

      await prisma.reportScore.create({
        data: {
          reportCardId: reportCard.id,
          subjectId: subject.id,
          a1Score: score?.a1 ?? null,
          a2Score: score?.a2 ?? null,
          examScore: score?.exam ?? null,
          totalScore: score?.total ?? 0,
        },
      });
    }
  }

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
