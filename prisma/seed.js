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

  const student12 = students.find((student) => student.fullName === "Student 12");

  const reportCard = await prisma.reportCard.create({
    data: {
      studentId: student12.id,
      classroomId: classroom.id,
      termId: term.id,
      status: ReportStatus.DRAFT,
      position: "21st",
      classSize: 30,
      grandTotal: 678,
      grandMax: 1000,
      assessment1Total: 134,
      assessment2Total: 113,
      examTotal: 486,
      teacherComment: "She's active in the class.",
    },
  });

  for (const subject of subjects) {
    const score = student12Scores[subject.name];
    if (!score) continue;

    await prisma.reportScore.create({
      data: {
        reportCardId: reportCard.id,
        subjectId: subject.id,
        a1Score: score.a1,
        a2Score: score.a2,
        examScore: score.exam,
        totalScore: score.total,
      },
    });
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
