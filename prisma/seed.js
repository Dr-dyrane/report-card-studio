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

const studentDetailedScores = {
  "Student 2": {
    Mathematics: { a1: 18, a2: 16, exam: 43, total: 77 },
    Grammar: { a1: 20, a2: 16, exam: 44, total: 80 },
    Composition: { a1: null, a2: null, exam: 18, total: 18 },
    Comprehension: { a1: null, a2: null, exam: 20, total: 20 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 30, total: 30 },
    "Social Studies": { a1: 8, a2: 10, exam: 46, total: 64 },
    Science: { a1: 10, a2: 8, exam: 24, total: 42 },
    Computer: { a1: 10, a2: 10, exam: 48, total: 68 },
    History: { a1: 8, a2: 6, exam: 30, total: 44 },
    "Fine Art": { a1: null, a2: null, exam: 15, total: 15 },
    "Citizenship Education": { a1: 8, a2: 10, exam: 18, total: 36 },
  },
  "Student 3": {
    Mathematics: { a1: 18, a2: 10, exam: 32, total: 60 },
    Grammar: { a1: 20, a2: 10, exam: 30, total: 60 },
    Composition: { a1: null, a2: null, exam: 20, total: 20 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 23, total: 23 },
    "Social Studies": { a1: 8, a2: 10, exam: 38, total: 56 },
    Science: { a1: 6, a2: 6, exam: 24, total: 36 },
    Computer: { a1: 8, a2: 8, exam: 48, total: 64 },
    History: { a1: 6, a2: 6, exam: 24, total: 36 },
    "Fine Art": { a1: null, a2: null, exam: 17, total: 17 },
    "Citizenship Education": { a1: 10, a2: 10, exam: 16, total: 36 },
  },
  "Student 4": {
    Mathematics: { a1: 14, a2: 10, exam: 32, total: 56 },
    Grammar: { a1: 14, a2: 14, exam: 32, total: 60 },
    Composition: { a1: 20, a2: 16, exam: 42, total: 78 },
    Comprehension: { a1: null, a2: null, exam: 16, total: 16 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 29, total: 29 },
    "Social Studies": { a1: 8, a2: 10, exam: 42, total: 60 },
    Science: { a1: 6, a2: 8, exam: 26, total: 40 },
    Computer: { a1: 10, a2: 10, exam: 48, total: 68 },
    History: { a1: 5, a2: 6, exam: 22, total: 33 },
    "Fine Art": { a1: null, a2: null, exam: 19, total: 19 },
    "Citizenship Education": { a1: 8, a2: 10, exam: 12, total: 30 },
  },
  "Student 5": {
    Mathematics: { a1: 12, a2: 14, exam: 33, total: 59 },
    Grammar: { a1: 18, a2: 10, exam: 23, total: 51 },
    Composition: { a1: null, a2: null, exam: 17, total: 17 },
    Comprehension: { a1: null, a2: null, exam: 16, total: 16 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 30, total: 30 },
    "Social Studies": { a1: 6, a2: 10, exam: 42, total: 58 },
    Science: { a1: 8, a2: 8, exam: 26, total: 42 },
    Computer: { a1: 10, a2: 10, exam: 40, total: 60 },
    History: { a1: 5, a2: 6, exam: 28, total: 39 },
    "Fine Art": { a1: null, a2: null, exam: 18, total: 18 },
    "Citizenship Education": { a1: 10, a2: 10, exam: 18, total: 38 },
  },
  "Student 6": {
    Mathematics: { a1: 18, a2: 10, exam: 38, total: 66 },
    Grammar: { a1: 16, a2: 14, exam: 38, total: 68 },
    Composition: { a1: null, a2: null, exam: 16, total: 16 },
    Comprehension: { a1: null, a2: null, exam: 18, total: 18 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 28, total: 28 },
    "Social Studies": { a1: 5, a2: 10, exam: 50, total: 65 },
    Science: { a1: 5, a2: 8, exam: 22, total: 35 },
    Computer: { a1: 5, a2: 5, exam: 30, total: 40 },
    History: { a1: 5, a2: 6, exam: 24, total: 35 },
    "Fine Art": { a1: null, a2: null, exam: 20, total: 20 },
    "Citizenship Education": { a1: 5, a2: 8, exam: 26, total: 39 },
  },
  "Student 7": {
    Mathematics: { a1: 14, a2: 10, exam: 35, total: 59 },
    Grammar: { a1: 20, a2: 14, exam: 32, total: 66 },
    Composition: { a1: null, a2: null, exam: 18, total: 18 },
    Comprehension: { a1: null, a2: null, exam: 14, total: 14 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 29, total: 29 },
    "Social Studies": { a1: 8, a2: 10, exam: 36, total: 54 },
    Science: { a1: 5, a2: 10, exam: 24, total: 39 },
    Computer: { a1: 8, a2: 8, exam: 38, total: 54 },
    History: { a1: 5, a2: 2, exam: 30, total: 37 },
    "Fine Art": { a1: null, a2: null, exam: 19, total: 19 },
    "Citizenship Education": { a1: 10, a2: 8, exam: 16, total: 34 },
  },
  "Student 8": {
    Mathematics: { a1: 16, a2: 10, exam: 31, total: 57 },
    Grammar: { a1: 10, a2: 12, exam: 35, total: 57 },
    Composition: { a1: null, a2: null, exam: 19, total: 19 },
    Comprehension: { a1: null, a2: null, exam: 16, total: 16 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 29, total: 29 },
    "Social Studies": { a1: 5, a2: 10, exam: 34, total: 49 },
    Science: { a1: 6, a2: 10, exam: 20, total: 36 },
    Computer: { a1: 10, a2: 10, exam: 38, total: 58 },
    History: { a1: 6, a2: 6, exam: 20, total: 32 },
    "Fine Art": { a1: null, a2: null, exam: 21, total: 21 },
    "Citizenship Education": { a1: 6, a2: 10, exam: 20, total: 36 },
  },
  "Student 9": {
    Mathematics: { a1: 7, a2: 10, exam: 30, total: 47 },
    Grammar: { a1: 12, a2: 10, exam: 30, total: 52 },
    Composition: { a1: null, a2: null, exam: 17, total: 17 },
    Comprehension: { a1: null, a2: null, exam: 16, total: 16 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 30, total: 30 },
    "Social Studies": { a1: 2, a2: 6, exam: 46, total: 54 },
    Science: { a1: 2, a2: 8, exam: 30, total: 40 },
    Computer: { a1: 10, a2: 10, exam: 48, total: 68 },
    History: { a1: 2, a2: 6, exam: 26, total: 34 },
    "Fine Art": { a1: null, a2: null, exam: 15, total: 15 },
    "Citizenship Education": { a1: 8, a2: 10, exam: 15, total: 33 },
  },
  "Student 10": {
    Mathematics: { a1: 10, a2: 10, exam: 39, total: 59 },
    Grammar: { a1: 20, a2: 18, exam: 38, total: 76 },
    Composition: { a1: null, a2: null, exam: 15, total: 15 },
    Comprehension: { a1: null, a2: null, exam: 14, total: 14 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 16, total: 16 },
    "Social Studies": { a1: 10, a2: 5, exam: 40, total: 55 },
    Science: { a1: 8, a2: 2, exam: 22, total: 32 },
    Computer: { a1: 8, a2: 8, exam: 30, total: 46 },
    History: { a1: 6, a2: 5, exam: 26, total: 37 },
    "Fine Art": { a1: null, a2: null, exam: 15, total: 15 },
    "Citizenship Education": { a1: 8, a2: 6, exam: 18, total: 32 },
  },
  "Student 11": {
    Mathematics: { a1: 14, a2: 19, exam: 34, total: 67 },
    Grammar: { a1: 16, a2: 10, exam: 33, total: 59 },
    Composition: { a1: null, a2: null, exam: 18, total: 18 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 26, total: 26 },
    "Social Studies": { a1: 6, a2: 10, exam: 34, total: 50 },
    Science: { a1: 5, a2: 8, exam: 22, total: 35 },
    Computer: { a1: 8, a2: 8, exam: 34, total: 50 },
    History: { a1: 5, a2: 8, exam: 24, total: 37 },
    "Fine Art": { a1: null, a2: null, exam: 19, total: 19 },
    "Citizenship Education": { a1: 8, a2: 10, exam: 14, total: 32 },
  },
  "Student 12": {
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
  },
  "Student 13": {
    Mathematics: { a1: 10, a2: 6, exam: 24, total: 40 },
    Grammar: { a1: 16, a2: 12, exam: 36, total: 64 },
    Composition: { a1: null, a2: null, exam: 15, total: 15 },
    Comprehension: { a1: null, a2: null, exam: 6, total: 6 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 30, total: 30 },
    "Social Studies": { a1: 8, a2: 8, exam: 38, total: 54 },
    Science: { a1: 5, a2: 6, exam: 18, total: 29 },
    Computer: { a1: 10, a2: 10, exam: 36, total: 56 },
    History: { a1: 5, a2: 2, exam: 24, total: 31 },
    "Fine Art": { a1: null, a2: null, exam: 16, total: 16 },
    "Citizenship Education": { a1: 8, a2: 8, exam: 10, total: 26 },
  },
  "Student 14": {
    Mathematics: { a1: 10, a2: 10, exam: 30, total: 50 },
    Grammar: { a1: 20, a2: 18, exam: 33, total: 71 },
    Composition: { a1: null, a2: null, exam: 17, total: 17 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 24, total: 24 },
    "Social Studies": { a1: 8, a2: 8, exam: 34, total: 50 },
    Science: { a1: 5, a2: 10, exam: 10, total: 25 },
    Computer: { a1: 8, a2: 8, exam: 38, total: 54 },
    History: { a1: 5, a2: 2, exam: 22, total: 29 },
    "Fine Art": { a1: null, a2: null, exam: 13, total: 13 },
    "Citizenship Education": { a1: 8, a2: 8, exam: 20, total: 36 },
  },
  "Student 15": {
    Mathematics: { a1: 12, a2: 11, exam: 18, total: 41 },
    Grammar: { a1: 10, a2: 20, exam: 33, total: 63 },
    Composition: { a1: null, a2: null, exam: 13, total: 13 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 20, total: 20 },
    "Social Studies": { a1: 10, a2: 8, exam: 34, total: 52 },
    Science: { a1: 6, a2: 6, exam: 15, total: 27 },
    Computer: { a1: 10, a2: 10, exam: 34, total: 54 },
    History: { a1: 10, a2: 6, exam: 24, total: 40 },
    "Fine Art": { a1: null, a2: null, exam: 16, total: 16 },
    "Citizenship Education": { a1: 10, a2: 10, exam: 6, total: 26 },
  },
  "Student 16": {
    Mathematics: { a1: 10, a2: 10, exam: 38, total: 58 },
    Grammar: { a1: 12, a2: 4, exam: 36, total: 52 },
    Composition: { a1: null, a2: null, exam: 15, total: 15 },
    Comprehension: { a1: null, a2: null, exam: 6, total: 6 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 10, total: 10 },
    "Social Studies": { a1: 5, a2: 10, exam: 36, total: 51 },
    Science: { a1: 2, a2: 8, exam: 24, total: 34 },
    Computer: { a1: 8, a2: 8, exam: 34, total: 50 },
    History: { a1: 6, a2: 6, exam: 24, total: 36 },
    "Fine Art": { a1: null, a2: null, exam: 16, total: 16 },
    "Citizenship Education": { a1: 8, a2: 8, exam: 16, total: 32 },
  },
  "Student 17": {
    Mathematics: { a1: 13, a2: 14, exam: 34, total: 61 },
    Grammar: { a1: 18, a2: 10, exam: 34, total: 62 },
    Composition: { a1: null, a2: null, exam: 17, total: 17 },
    Comprehension: { a1: null, a2: null, exam: 7, total: 7 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 7, total: 7 },
    "Social Studies": { a1: 6, a2: 8, exam: 28, total: 42 },
    Science: { a1: 1, a2: 5, exam: 20, total: 26 },
    Computer: { a1: 10, a2: 10, exam: 30, total: 50 },
    History: { a1: 5, a2: 8, exam: 22, total: 35 },
    "Fine Art": { a1: null, a2: null, exam: 16, total: 16 },
    "Citizenship Education": { a1: 8, a2: 6, exam: 10, total: 24 },
  },
  "Student 18": {
    Mathematics: { a1: 10, a2: 12, exam: 30, total: 52 },
    Grammar: { a1: 12, a2: 10, exam: 12, total: 34 },
    Composition: { a1: null, a2: null, exam: 15, total: 15 },
    Comprehension: { a1: null, a2: null, exam: 6, total: 6 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 6, total: 6 },
    "Social Studies": { a1: 8, a2: 8, exam: 40, total: 56 },
    Science: { a1: 9, a2: 6, exam: 22, total: 37 },
    Computer: { a1: 8, a2: 8, exam: 30, total: 46 },
    History: { a1: 2, a2: 6, exam: 30, total: 38 },
    "Fine Art": { a1: null, a2: null, exam: 17, total: 17 },
    "Citizenship Education": { a1: 5, a2: 8, exam: 16, total: 29 },
  },
  "Student 19": {
    Mathematics: { a1: 16, a2: 10, exam: 30, total: 56 },
    Grammar: { a1: 16, a2: 12, exam: 21, total: 49 },
    Composition: { a1: null, a2: null, exam: 18, total: 18 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 26, total: 26 },
    "Social Studies": { a1: 6, a2: 8, exam: 38, total: 52 },
    Science: { a1: 2, a2: 6, exam: 20, total: 28 },
    Computer: { a1: 8, a2: 8, exam: 34, total: 50 },
    History: { a1: 2, a2: 5, exam: 30, total: 37 },
    "Fine Art": { a1: null, a2: null, exam: 21, total: 21 },
    "Citizenship Education": { a1: 8, a2: 6, exam: 15, total: 29 },
  },
  "Student 20": {
    Mathematics: { a1: 10, a2: 4, exam: 35, total: 49 },
    Grammar: { a1: 12, a2: 6, exam: 23, total: 41 },
    Composition: { a1: null, a2: null, exam: 10, total: 10 },
    Comprehension: { a1: null, a2: null, exam: 10, total: 10 },
    "Spelling/Dictation": { a1: null, a2: null, exam: 5, total: 5 },
    "Social Studies": { a1: 8, a2: 5, exam: 16, total: 29 },
    Science: { a1: 8, a2: 8, exam: 18, total: 34 },
    Computer: { a1: 8, a2: 8, exam: 36, total: 52 },
    History: { a1: 8, a2: 6, exam: 24, total: 38 },
    "Fine Art": { a1: null, a2: null, exam: 20, total: 20 },
    "Citizenship Education": { a1: 5, a2: 8, exam: 18, total: 31 },
  },
};

async function main() {
  await prisma.reportScore.deleteMany();
  await prisma.reportCard.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.school.deleteMany();

  const school = await prisma.school.create({
    data: { name: "Report Card Studio Demo School" },
  });

  const session = await prisma.academicSession.create({
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
      const score = studentDetailedScores[student.fullName]?.[subject.name] ?? null;

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
