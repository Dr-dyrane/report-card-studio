export type GrandSheetSubject = {
  key: string;
  label: string;
  shortLabel: string;
  max: number;
};

export type GrandSheetRowInput = {
  id: string;
  name: string;
  admissionNumber: string;
  scores: Record<string, string>;
  firstTest: string;
  secondTest: string;
};

export const GRAND_SHEET_SUBJECTS: GrandSheetSubject[] = [
  { key: "mathematics", label: "Mathematics", shortLabel: "Maths", max: 60 },
  { key: "grammar", label: "Grammar", shortLabel: "Grammar", max: 60 },
  { key: "composition", label: "Composition", shortLabel: "Compo.", max: 20 },
  { key: "comprehension", label: "Comprehension", shortLabel: "Compre.", max: 20 },
  { key: "spelling", label: "Spelling & Dictation", shortLabel: "Spell.", max: 30 },
  { key: "oralReading", label: "Oral Reading", shortLabel: "Oral", max: 20 },
  { key: "writing", label: "Writing", shortLabel: "Writing", max: 20 },
  { key: "socialStudies", label: "Social Studies", shortLabel: "Social", max: 40 },
  { key: "science", label: "Science", shortLabel: "Science", max: 30 },
  { key: "healthEducation", label: "Health Education", shortLabel: "Health", max: 40 },
  { key: "religion", label: "Religion", shortLabel: "Religion", max: 20 },
  { key: "verbal", label: "Verbal Reasoning", shortLabel: "Verbal", max: 20 },
  {
    key: "quantitative",
    label: "Quantitative Reasoning",
    shortLabel: "Quant.",
    max: 20,
  },
  { key: "computer", label: "Computer", shortLabel: "Computer", max: 30 },
  { key: "poetry", label: "Poetry", shortLabel: "Poetry", max: 20 },
  { key: "history", label: "History", shortLabel: "History", max: 30 },
  { key: "civic", label: "Civic Education", shortLabel: "Civic", max: 30 },
  { key: "creativeArt", label: "Creative Art", shortLabel: "C. Art", max: 30 },
];

export function grandSheetRemark(percentage: number) {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 70) return "Very Good";
  if (percentage >= 60) return "Good";
  if (percentage >= 50) return "Credit";
  if (percentage >= 40) return "Pass";
  return "Needs Improvement";
}

export function normalizeGrandSheetName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
