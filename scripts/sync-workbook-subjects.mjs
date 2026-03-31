import fs from "node:fs";
import path from "node:path";

import xlsx from "xlsx";

function loadEnvFile(filePath, { overwrite = false } = {}) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || (!overwrite && process.env[key])) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.trim();
  }
}

const workspaceRoot = path.resolve(import.meta.dirname, "..");
loadEnvFile(path.join(workspaceRoot, ".env.local"), { overwrite: true });
loadEnvFile(path.join(workspaceRoot, ".env"));

const { PrismaClient } = await import("@prisma/client");

const workbookPath =
  process.argv[2] || path.resolve(workspaceRoot, "..", "Converted_Report_Card.xlsx");
const classroomName = process.argv[3] || "Primary 5 Lavender";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function inferCategory(subjectName) {
  const categories = [
    { names: ["Mathematics", "Social Studies"], category: "Core" },
    {
      names: [
        "Grammar",
        "Composition",
        "Comprehension",
        "Spelling/Dictation",
        "Oral Reading",
        "Writing",
        "Poetry",
        "French",
        "Nigerian Language",
      ],
      category: "Language",
    },
    {
      names: ["Science", "Health Education", "Agricultural Science"],
      category: "Science",
    },
    {
      names: ["History", "Geography", "Religious Studies", "Moral Instruction", "Citizenship Education"],
      category: "Humanities",
    },
    {
      names: ["Verbal Aptitude", "Vocational Aptitude", "Quantitative Aptitude"],
      category: "Aptitude",
    },
    { names: ["Computer"], category: "Technology" },
    { names: ["Fine Art", "Home Economics"], category: "Arts" },
  ];

  return categories.find((entry) => entry.names.includes(subjectName))?.category ?? "General";
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readWorkbookSubjects(filePath) {
  const workbook = xlsx.readFile(filePath, { cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

  const subjects = [];

  for (let index = 6; index < rows.length; index += 1) {
    const row = rows[index] ?? [];
    const subjectName = normalize(row[0]);
    if (!subjectName) continue;
    if (subjectName === "Subject") continue;

    const maxTotal = parseNumber(row[7]);
    const studentTotal = parseNumber(row[8]);
    const hasWorksheetShape = row.length >= 8;
    if (!hasWorksheetShape) continue;

    const loweredSubjectName = subjectName.toLowerCase();
    if (loweredSubjectName.startsWith("total ")) continue;
    if (loweredSubjectName === "grand total") continue;
    if (["Comment", "Teacher Comment", "Head Teacher Comment"].includes(subjectName)) continue;

    subjects.push({
      name: subjectName,
      a1Max: parseNumber(row[1]),
      a2Max: parseNumber(row[3]),
      examMax: parseNumber(row[5]),
      maxTotal,
      studentTotal,
    });
  }

  const uniqueSubjects = [];
  const seen = new Set();
  for (const subject of subjects) {
    if (seen.has(subject.name)) continue;
    seen.add(subject.name);
    uniqueSubjects.push({
      name: subject.name,
      category: inferCategory(subject.name),
      assessmentMode:
        subject.a1Max !== null || subject.a2Max !== null
          ? "CONTINUOUS_AND_EXAM"
          : "EXAM_ONLY",
      a1Max: subject.a1Max,
      a2Max: subject.a2Max,
      examMax: subject.examMax,
    });
  }

  return uniqueSubjects;
}

const prisma = new PrismaClient();

async function main() {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook not found: ${workbookPath}`);
  }

  const workbookSubjects = readWorkbookSubjects(workbookPath);
  const school = await prisma.school.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!school) {
    throw new Error("No school found in the database.");
  }

  const classroom = await prisma.classroom.findFirst({
    where: {
      schoolId: school.id,
      name: classroomName,
    },
    include: {
      classSubjects: {
        include: {
          subject: true,
        },
        orderBy: [{ displayOrder: "asc" }],
      },
      reportCards: {
        include: {
          scores: {
            select: {
              subjectId: true,
            },
          },
        },
      },
    },
  });

  if (!classroom) {
    throw new Error(`Classroom not found: ${classroomName}`);
  }

  const existingSubjectMap = new Map(
    (
      await prisma.subject.findMany({
        where: { schoolId: school.id },
      })
    ).map((subject) => [subject.name, subject]),
  );

  const existingClassSubjectNames = new Set(
    classroom.classSubjects.map((item) => item.subject.name),
  );

  const missingFromDb = workbookSubjects.filter((subject) => !existingSubjectMap.has(subject.name));
  const missingFromClass = workbookSubjects.filter(
    (subject) => !existingClassSubjectNames.has(subject.name),
  );

  console.log(`Workbook subjects: ${workbookSubjects.length}`);
  console.log(`DB subjects: ${existingSubjectMap.size}`);
  console.log(`Class subjects before sync: ${classroom.classSubjects.length}`);
  console.log(
    `Missing subject definitions: ${missingFromDb.map((subject) => subject.name).join(", ") || "none"}`,
  );
  console.log(
    `Missing classroom bindings: ${missingFromClass.map((subject) => subject.name).join(", ") || "none"}`,
  );

  for (const [index, workbookSubject] of workbookSubjects.entries()) {
    const subject =
      existingSubjectMap.get(workbookSubject.name) ??
      (await prisma.subject.create({
        data: {
          schoolId: school.id,
          name: workbookSubject.name,
          category: workbookSubject.category,
          assessmentMode: workbookSubject.assessmentMode,
          a1Max: workbookSubject.a1Max,
          a2Max: workbookSubject.a2Max,
          examMax: workbookSubject.examMax,
          displayOrder: index + 1,
          isActive: true,
        },
      }));

    existingSubjectMap.set(subject.name, subject);

    if (!existingClassSubjectNames.has(subject.name)) {
      await prisma.classSubject.create({
        data: {
          classroomId: classroom.id,
          subjectId: subject.id,
          displayOrder: index + 1,
        },
      });
      existingClassSubjectNames.add(subject.name);
    } else {
      await prisma.classSubject.updateMany({
        where: {
          classroomId: classroom.id,
          subjectId: subject.id,
        },
        data: {
          displayOrder: index + 1,
        },
      });
    }

    await prisma.subject.update({
      where: { id: subject.id },
      data: {
        category: workbookSubject.category,
        assessmentMode: workbookSubject.assessmentMode,
        a1Max: workbookSubject.a1Max,
        a2Max: workbookSubject.a2Max,
        examMax: workbookSubject.examMax,
        displayOrder: index + 1,
        isActive: true,
      },
    });
  }

  const finalSubjects = workbookSubjects.map((subject) => existingSubjectMap.get(subject.name)).filter(Boolean);

  let createdReportScores = 0;
  for (const reportCard of classroom.reportCards) {
    const existingScoreSubjectIds = new Set(reportCard.scores.map((score) => score.subjectId));
    for (const subject of finalSubjects) {
      if (!subject || existingScoreSubjectIds.has(subject.id)) continue;
      await prisma.reportScore.create({
        data: {
          reportCardId: reportCard.id,
          subjectId: subject.id,
          totalScore: 0,
        },
      });
      createdReportScores += 1;
    }
  }

  console.log(`Report score rows created: ${createdReportScores}`);

  const refreshedClassroom = await prisma.classroom.findUnique({
    where: { id: classroom.id },
    include: {
      classSubjects: {
        include: { subject: true },
        orderBy: [{ displayOrder: "asc" }],
      },
    },
  });

  console.log(
    `Class subjects after sync (${refreshedClassroom?.classSubjects.length ?? 0}): ${
      refreshedClassroom?.classSubjects.map((item) => item.subject.name).join(", ") ?? ""
    }`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
