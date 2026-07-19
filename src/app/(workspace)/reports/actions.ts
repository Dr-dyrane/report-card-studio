"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import {
  GRAND_SHEET_SUBJECTS,
  grandSheetRemark,
  normalizeGrandSheetName,
  type GrandSheetRowInput,
} from "@/lib/grand-sheet";
import { requireOwnedSchool } from "@/lib/owned-school";

type ScoreUpdateInput = {
  id: string;
  a1: string;
  a2: string;
  exam: string;
};

function parseScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugToStudentName(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSubjectName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function inferTermSequence(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("first")) return 1;
  if (normalized.includes("second")) return 2;
  if (normalized.includes("third")) return 3;
  return 1;
}

function formatOrdinal(value: number) {
  const remainderTen = value % 10;
  const remainderHundred = value % 100;

  if (remainderTen === 1 && remainderHundred !== 11) return `${value}st`;
  if (remainderTen === 2 && remainderHundred !== 12) return `${value}nd`;
  if (remainderTen === 3 && remainderHundred !== 13) return `${value}rd`;
  return `${value}th`;
}

async function recomputeClassroomTermRanking(classroomId: string, termId: string) {
  const db = await getDb();
  if (!db) return;

  const classSize = await db.student.count({
    where: {
      classroomId,
      isActive: true,
    },
  });

  const reportCards = await db.reportCard.findMany({
    where: {
      classroomId,
      termId,
      status: {
        not: "LOCKED",
      },
      student: {
        isActive: true,
      },
    },
    orderBy: [{ grandTotal: "desc" }, { updatedAt: "asc" }],
    select: { id: true, grandTotal: true },
  });

  await Promise.all(
    reportCards.map((report, index) => {
      const previousMatchingIndex = reportCards.findIndex(
        (candidate) => candidate.grandTotal === report.grandTotal,
      );

      return db.reportCard.update({
        where: { id: report.id },
        data: {
          classSize,
          position: formatOrdinal(
            (previousMatchingIndex === -1 ? index : previousMatchingIndex) + 1,
          ),
        },
      });
    }),
  );
}

export async function updateReportScores(input: {
  reportCardId: string;
  routeKey: string;
  teacherComment: string;
  teacherName: string;
  assessment1Total?: number;
  assessment2Total?: number;
  scores: ScoreUpdateInput[];
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false };
  }

  const reportCard = await db.reportCard.findFirst({
    where: {
      id: input.reportCardId,
      classroom: {
        schoolId: ownedSchool.id,
      },
    },
    select: {
      id: true,
      classroomId: true,
      termId: true,
    },
  });

  if (!reportCard) {
    return { ok: false };
  }

  for (const score of input.scores) {
    if (score.id.startsWith("missing-")) {
      continue;
    }

    const a1Score = parseScore(score.a1);
    const a2Score = parseScore(score.a2);
    const examScore = parseScore(score.exam);
    const totalScore = (a1Score ?? 0) + (a2Score ?? 0) + (examScore ?? 0);

    await db.reportScore.update({
      where: { id: score.id },
      data: {
        a1Score,
        a2Score,
        examScore,
        totalScore,
      },
    });
  }

  const reportScores = await db.reportScore.findMany({
    where: {
      reportCardId: input.reportCardId,
    },
  });

  const detailedAssessment1Total = reportScores.reduce(
    (sum, score) => sum + (score.a1Score ?? 0),
    0,
  );
  const detailedAssessment2Total = reportScores.reduce(
    (sum, score) => sum + (score.a2Score ?? 0),
    0,
  );
  const assessment1Total =
    input.assessment1Total ?? detailedAssessment1Total;
  const assessment2Total =
    input.assessment2Total ?? detailedAssessment2Total;
  const examTotal = reportScores.reduce((sum, score) => sum + (score.examScore ?? 0), 0);
  const grandTotal = assessment1Total + assessment2Total + examTotal;

  await db.reportCard.update({
    where: { id: input.reportCardId },
    data: {
      teacherComment: input.teacherComment,
      assessment1Total,
      assessment2Total,
      examTotal,
      grandTotal,
    },
  });

  await db.classroom.update({
    where: { id: reportCard.classroomId },
    data: {
      teacherName: input.teacherName,
    },
  });

  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);

  revalidatePath("/reports");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/students");
  revalidatePath(`/students/${input.routeKey}`);
  revalidatePath("/analytics");

  return {
    ok: true,
    summary: {
      assessment1Total,
      assessment2Total,
      examTotal,
      grandTotal,
    },
  };
}

export async function publishReportCard(input: {
  reportCardId: string;
  routeKey: string;
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false };
  }

  const reportCard = await db.reportCard.findFirst({
    where: {
      id: input.reportCardId,
      classroom: {
        schoolId: ownedSchool.id,
      },
    },
    select: { id: true, classroomId: true, termId: true },
  });

  if (!reportCard) {
    return { ok: false };
  }

  await db.reportCard.update({
    where: { id: reportCard.id },
    data: {
      status: "PUBLISHED",
    },
  });

  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);

  revalidatePath("/reports");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/students");
  revalidatePath(`/students/${input.routeKey}`);
  revalidatePath("/analytics");

  return { ok: true };
}

export async function removeReportCard(input: {
  reportCardId: string;
  routeKey: string;
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const reportCard = await db.reportCard.findFirst({
    where: {
      id: input.reportCardId,
      classroom: {
        schoolId: ownedSchool.id,
      },
    },
    include: {
      scores: true,
    },
  });

  if (!reportCard) {
    return { ok: false, message: "Report not found." };
  }

  const hasEnteredScores = reportCard.scores.some(
    (score) =>
      score.a1Score !== null || score.a2Score !== null || score.examScore !== null,
  );

  if (reportCard.status === "PUBLISHED" || hasEnteredScores) {
    await db.reportCard.update({
      where: { id: reportCard.id },
      data: {
        status: "LOCKED",
        position: null,
      },
    });
    await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);
    revalidatePath("/reports");
    revalidatePath("/students");
    revalidatePath(`/reports/${input.routeKey}`);
    revalidatePath(`/reports/${input.routeKey}/preview`);
    revalidatePath("/analytics");
    return { ok: true, mode: "archived" as const, message: "Report archived." };
  }

  await db.reportCard.delete({
    where: { id: reportCard.id },
  });
  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);
  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/analytics");
  return { ok: true, mode: "deleted" as const, message: "Report deleted." };
}

export async function restoreReportCard(input: {
  reportCardId: string;
  routeKey: string;
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const reportCard = await db.reportCard.findFirst({
    where: {
      id: input.reportCardId,
      classroom: {
        schoolId: ownedSchool.id,
      },
    },
    select: {
      id: true,
      classroomId: true,
      termId: true,
      status: true,
    },
  });

  if (!reportCard) {
    return { ok: false, message: "Report not found." };
  }

  if (reportCard.status !== "LOCKED") {
    return { ok: true, message: "Report is already active." };
  }

  await db.reportCard.update({
    where: { id: reportCard.id },
    data: {
      status: "DRAFT",
    },
  });

  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/analytics");

  return { ok: true, message: "Report restored." };
}

export async function deleteArchivedReportCard(input: {
  reportCardId: string;
  routeKey: string;
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const reportCard = await db.reportCard.findFirst({
    where: {
      id: input.reportCardId,
      status: "LOCKED",
      classroom: {
        schoolId: ownedSchool.id,
      },
    },
    select: {
      id: true,
      classroomId: true,
      termId: true,
    },
  });

  if (!reportCard) {
    return { ok: false, message: "Archived report not found." };
  }

  await db.reportCard.delete({
    where: { id: reportCard.id },
  });

  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/analytics");

  return { ok: true, message: "Archived report deleted permanently." };
}

export async function createOrOpenReportCard(input: { studentRouteKey: string }) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const studentName = slugToStudentName(input.studentRouteKey);
  const student = await db.student.findFirst({
    where: {
      schoolId: ownedSchool.id,
      fullName: studentName,
    },
    include: {
      classroom: {
        include: {
          students: {
            where: {
              isActive: true,
            },
          },
          classSubjects: {
            include: {
              subject: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      },
    },
  });

  if (!student) {
    return { ok: false, message: "Student not found." };
  }

  const term =
    (await db.term.findFirst({
      where: { isActive: true, session: { schoolId: ownedSchool.id } },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    })) ??
    (await db.term.findFirst({
      where: { session: { schoolId: ownedSchool.id } },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    }));

  if (!term) {
    return { ok: false, message: "No active term available." };
  }

  let reportCard = await db.reportCard.findUnique({
    where: {
      studentId_termId: {
        studentId: student.id,
        termId: term.id,
      },
    },
  });

  if (!reportCard) {
    reportCard = await db.reportCard.create({
      data: {
        studentId: student.id,
        classroomId: student.classroomId,
        termId: term.id,
        status: "DRAFT",
        classSize: student.classroom.students.length,
        grandMax: 1000,
      },
    });

    for (const classSubject of student.classroom.classSubjects) {
      await db.reportScore.create({
        data: {
          reportCardId: reportCard.id,
          subjectId: classSubject.subjectId,
          totalScore: 0,
        },
      });
    }
  }

  await recomputeClassroomTermRanking(student.classroomId, term.id);

  const href = `/reports/${input.studentRouteKey}`;

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(href);

  return { ok: true, href, reportCardId: reportCard.id };
}

export async function createStudentReportCard(input: {
  fullName: string;
  classroomId: string;
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  if (!fullName) {
    return { ok: false, message: "Student name is required." };
  }

  const classroom = await db.classroom.findUnique({
    where: { id: input.classroomId },
    include: {
      school: true,
      students: {
        where: {
          isActive: true,
        },
      },
      classSubjects: {
        include: {
          subject: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!classroom || classroom.schoolId !== ownedSchool.id) {
    return { ok: false, message: "Class not found." };
  }

  const term =
    (await db.term.findFirst({
      where: { isActive: true, session: { schoolId: ownedSchool.id } },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    })) ??
    (await db.term.findFirst({
      where: { session: { schoolId: ownedSchool.id } },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    }));

  if (!term) {
    return { ok: false, message: "No active term available." };
  }

  let student = await db.student.findFirst({
    where: {
      classroomId: classroom.id,
      fullName,
    },
  });

  let studentWasCreated = false;

  if (!student) {
    student = await db.student.create({
      data: {
        fullName,
        classroomId: classroom.id,
        schoolId: classroom.schoolId,
      },
    });
    studentWasCreated = true;
  }

  let reportCard = await db.reportCard.findUnique({
    where: {
      studentId_termId: {
        studentId: student.id,
        termId: term.id,
      },
    },
  });

  let reportWasCreated = false;

  if (!reportCard) {
    reportCard = await db.reportCard.create({
      data: {
        studentId: student.id,
        classroomId: classroom.id,
        termId: term.id,
        status: "DRAFT",
        classSize: classroom.students.length + (studentWasCreated ? 1 : 0),
        grandMax: 1000,
      },
    });
    reportWasCreated = true;

    for (const classSubject of classroom.classSubjects) {
      await db.reportScore.create({
        data: {
          reportCardId: reportCard.id,
          subjectId: classSubject.subjectId,
          totalScore: 0,
        },
      });
    }
  }

  await recomputeClassroomTermRanking(classroom.id, term.id);

  const href = `/reports/${reportCard.id}`;
  const studentHref = `/students/${slugify(student.fullName)}`;

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(studentHref);
  revalidatePath(href);

  return {
    ok: true,
    href,
    reportCardId: reportCard.id,
    studentId: student.id,
    classroomName: classroom.name,
    message:
      studentWasCreated || reportWasCreated
        ? "Student sheet ready."
        : "Student already has a sheet for this term. Opening it now.",
  };
}

export async function createOrOpenReportAndRedirect(formData: FormData) {
  const fullName = `${formData.get("fullName") || ""}`.trim();
  const classroomId = `${formData.get("classroomId") || ""}`.trim();

  if (!fullName || !classroomId) {
    redirect("/reports/new");
  }

  const result = await createStudentReportCard({ fullName, classroomId });

  if (!result.ok || !result.href) {
    redirect("/reports/new");
  }

  redirect(result.href);
}

export async function applyScannedReportPrefill(input: {
  fullName: string;
  classroomId: string;
  extraction: {
    studentName?: string | null;
    className?: string | null;
    summary?: {
      assessment1Total?: number;
      assessment2Total?: number;
      examTotal?: number;
      grandTotal?: number;
      grandMax?: number;
    };
    scores?: Array<{
      subject: string;
      a1Score?: number | null;
      a2Score?: number | null;
      examScore?: number | null;
      totalScore?: number | null;
    }>;
    teacherComment?: string;
    position?: string | null;
  };
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const created = await createStudentReportCard({
    fullName: input.fullName,
    classroomId: input.classroomId,
  });

  if (!created.ok || !created.reportCardId || !created.href) {
    return { ok: false, message: "Unable to open report sheet." };
  }

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const reportCard = await db.reportCard.findUnique({
    where: { id: created.reportCardId },
    include: {
      scores: {
        include: {
          subject: true,
        },
      },
      classroom: {
        select: {
          schoolId: true,
        },
      },
    },
  });

  if (!reportCard || reportCard.classroom.schoolId !== ownedSchool.id) {
    return { ok: false, message: "Report sheet not found." };
  }

  const incomingScores = input.extraction.scores ?? [];

  for (const reportScore of reportCard.scores) {
    const match = incomingScores.find(
      (score) =>
        normalizeSubjectName(score.subject) ===
        normalizeSubjectName(reportScore.subject.name),
    );

    if (!match) continue;

    const a1Score = match.a1Score ?? null;
    const a2Score = match.a2Score ?? null;
    const examScore = match.examScore ?? null;
    const totalScore =
      match.totalScore ?? (a1Score ?? 0) + (a2Score ?? 0) + (examScore ?? 0);

    await db.reportScore.update({
      where: { id: reportScore.id },
      data: {
        a1Score,
        a2Score,
        examScore,
        totalScore,
      },
    });
  }

  const refreshedScores = await db.reportScore.findMany({
    where: { reportCardId: reportCard.id },
  });

  const assessment1Total = refreshedScores.reduce(
    (sum, score) => sum + (score.a1Score ?? 0),
    0,
  );
  const assessment2Total = refreshedScores.reduce(
    (sum, score) => sum + (score.a2Score ?? 0),
    0,
  );
  const examTotal = refreshedScores.reduce(
    (sum, score) => sum + (score.examScore ?? 0),
    0,
  );
  const grandTotal = refreshedScores.reduce((sum, score) => sum + score.totalScore, 0);

  await db.reportCard.update({
    where: { id: reportCard.id },
    data: {
      status: "DRAFT",
      position: input.extraction.position ?? undefined,
      grandMax: input.extraction.summary?.grandMax ?? reportCard.grandMax,
      assessment1Total,
      assessment2Total,
      examTotal,
      grandTotal,
      teacherComment:
        input.extraction.teacherComment ?? reportCard.teacherComment ?? undefined,
    },
  });

  await recomputeClassroomTermRanking(reportCard.classroomId, reportCard.termId);

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(created.href);
  revalidatePath(`${created.href}/preview`);
  revalidatePath(`/students/${slugify(input.fullName)}`);
  revalidatePath("/analytics");

  return { ok: true, href: created.href };
}

export async function prepareScanWorkspace(input: {
  className?: string | null;
  academicSessionName?: string | null;
  termName?: string | null;
  subjectNames?: string[];
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();

  const db = await getDb();
  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const className = input.className?.trim();
  if (!className) {
    return { ok: false, message: "Scan did not provide a class yet." };
  }

  const sessionName = input.academicSessionName?.trim() || "Academic Session";
  const termName = input.termName?.trim() || "First Term";
  const subjectNames = Array.from(
    new Set((input.subjectNames ?? []).map((value) => value.trim()).filter(Boolean)),
  );
  let createdSession = false;
  let createdTerm = false;
  let createdClassroom = false;
  let createdSubjects = 0;
  let createdBindings = 0;

  const activeSession = await db.academicSession.findFirst({
    where: {
      schoolId: ownedSchool.id,
      isActive: true,
    },
  });

  const existingSession = await db.academicSession.findFirst({
    where: {
      schoolId: ownedSchool.id,
      name: sessionName,
    },
  });

  const session =
    existingSession ??
    (await db.academicSession.create({
      data: {
        schoolId: ownedSchool.id,
        name: sessionName,
        isActive: !activeSession,
      },
    }));
  createdSession = !existingSession;

  const activeTerm = await db.term.findFirst({
    where: {
      session: {
        schoolId: ownedSchool.id,
      },
      isActive: true,
    },
  });

  const existingTerm = await db.term.findFirst({
    where: {
      sessionId: session.id,
      name: termName,
    },
  });

  const term =
    existingTerm ??
    (await db.term.create({
      data: {
        sessionId: session.id,
        name: termName,
        sequence: inferTermSequence(termName),
        isActive: !activeTerm,
      },
    }));
  createdTerm = !existingTerm;

  const existingClassroom = await db.classroom.findFirst({
    where: {
      schoolId: ownedSchool.id,
      name: className,
    },
    include: {
      classSubjects: true,
    },
  });

  const classroom =
    existingClassroom ??
    (await db.classroom.create({
      data: {
        schoolId: ownedSchool.id,
        name: className,
      },
      include: {
        classSubjects: true,
      },
    }));
  createdClassroom = !existingClassroom;

  const existingBindings = new Set(classroom.classSubjects.map((item) => item.subjectId));

  for (const [index, subjectName] of subjectNames.entries()) {
    const existingSubject = await db.subject.findFirst({
      where: {
        schoolId: ownedSchool.id,
        name: subjectName,
      },
    });

    const subject =
      existingSubject ??
      (await db.subject.create({
        data: {
          schoolId: ownedSchool.id,
          name: subjectName,
          assessmentMode: "CONTINUOUS_AND_EXAM",
          displayOrder: index,
        },
      }));

    if (!existingSubject) {
      createdSubjects += 1;
    }

    if (!existingBindings.has(subject.id)) {
      createdBindings += 1;
      await db.classSubject.create({
        data: {
          classroomId: classroom.id,
          subjectId: subject.id,
          displayOrder: index,
        },
      });
    }
  }

  revalidatePath("/classes");
  revalidatePath("/terms");
  revalidatePath("/subjects");
  revalidatePath("/reports/new");

  return {
    ok: true,
    classroomId: classroom.id,
    classroomName: classroom.name,
    sessionName: session.name,
    termName: term.name,
    created: {
      session: createdSession,
      term: createdTerm,
      classroom: createdClassroom,
      subjects: createdSubjects,
      classSubjects: createdBindings,
    },
  };
}

export async function createReportsFromGrandSheet(input: {
  classroomId: string;
  termId: string;
  rows: GrandSheetRowInput[];
}) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  const classroom = await db.classroom.findFirst({
    where: {
      id: input.classroomId,
      schoolId: ownedSchool.id,
    },
    include: {
      students: true,
      classSubjects: true,
    },
  });

  if (!classroom) {
    return { ok: false, message: "Choose a class before creating report sheets." };
  }

  const term = await db.term.findFirst({
    where: {
      id: input.termId,
      session: { schoolId: ownedSchool.id },
    },
  });

  if (!term) {
    return { ok: false, message: "Choose the session and term for this grand sheet." };
  }

  const validRows = input.rows.filter((row) => {
    if (!row.name.trim() || !row.admissionNumber.trim()) return false;
    if (!isBlankOrValidGrandSheetMark(row.firstTest, 130)) return false;
    if (!isBlankOrValidGrandSheetMark(row.secondTest, 130)) return false;

    return GRAND_SHEET_SUBJECTS.every((subject) =>
      isBlankOrValidGrandSheetMark(row.scores[subject.key], subject.max),
    );
  });

  if (!validRows.length) {
    return {
      ok: false,
      message: "Complete at least one pupil row before creating report sheets.",
    };
  }
  const requiredSubjectKeys = new Set(
    GRAND_SHEET_SUBJECTS.filter((subject) =>
      validRows.some((row) => Boolean(row.scores[subject.key]?.trim())),
    ).map((subject) => subject.key),
  );

  const existingSubjects = await db.subject.findMany({
    where: { schoolId: ownedSchool.id },
  });
  const subjectByName = new Map(
    existingSubjects.map((subject) => [
      normalizeGrandSheetName(subject.name),
      subject,
    ]),
  );
  const existingStudents = new Map(
    classroom.students.map((student) => [
      normalizeGrandSheetName(student.fullName),
      student,
    ]),
  );
  const existingBindings = new Set(
    classroom.classSubjects.map((binding) => binding.subjectId),
  );
  const reportHrefs: Array<{ href: string; label: string }> = [];
  let createdStudents = 0;
  let createdReports = 0;
  let updatedReports = 0;
  let createdSubjects = 0;

  await db.$transaction(async (tx) => {
    const boundSubjects: Array<{
      id: string;
      key: string;
    }> = [];

    for (const [index, definition] of GRAND_SHEET_SUBJECTS.entries()) {
      const normalizedLabel = normalizeGrandSheetName(definition.label);
      let subject = subjectByName.get(normalizedLabel);

      if (!subject) {
        subject = await tx.subject.create({
          data: {
            schoolId: ownedSchool.id,
            name: definition.label,
            assessmentMode: "EXAM_ONLY",
            examMax: definition.max,
            displayOrder: index,
          },
        });
        subjectByName.set(normalizedLabel, subject);
        createdSubjects += 1;
      }

      if (!existingBindings.has(subject.id)) {
        await tx.classSubject.create({
          data: {
            classroomId: classroom.id,
            subjectId: subject.id,
            displayOrder: index,
          },
        });
        existingBindings.add(subject.id);
      }

      boundSubjects.push({ id: subject.id, key: definition.key });
    }

    for (const row of validRows) {
      const normalizedStudentName = normalizeGrandSheetName(row.name);
      let student = existingStudents.get(normalizedStudentName);

      if (!student) {
        student = await tx.student.create({
          data: {
            fullName: row.name.trim().replace(/\s+/g, " "),
            admissionNumber: row.admissionNumber.trim(),
            classroomId: classroom.id,
            schoolId: ownedSchool.id,
          },
        });
        existingStudents.set(normalizedStudentName, student);
        createdStudents += 1;
      } else if (!student.admissionNumber && row.admissionNumber.trim()) {
        student = await tx.student.update({
          where: { id: student.id },
          data: { admissionNumber: row.admissionNumber.trim() },
        });
        existingStudents.set(normalizedStudentName, student);
      }

      const currentReport = await tx.reportCard.findUnique({
        where: {
          studentId_termId: {
            studentId: student.id,
            termId: term.id,
          },
        },
      });
      const examTotal = GRAND_SHEET_SUBJECTS.reduce(
        (total, subject) => total + Number(row.scores[subject.key] || 0),
        0,
      );
      const assessment1Total = Number(row.firstTest || 0);
      const assessment2Total = Number(row.secondTest || 0);
      const grandTotal = assessment1Total + assessment2Total + examTotal;
      const rowIsComplete =
        isValidGrandSheetMark(row.firstTest, 130) &&
        isValidGrandSheetMark(row.secondTest, 130) &&
        GRAND_SHEET_SUBJECTS.filter((subject) =>
          requiredSubjectKeys.has(subject.key),
        ).every((subject) =>
          isValidGrandSheetMark(row.scores[subject.key], subject.max),
        );
      const teacherComment = rowIsComplete
        ? grandSheetRemark((grandTotal / 800) * 100)
        : currentReport?.teacherComment;

      const reportCard = currentReport
          ? await tx.reportCard.update({
            where: { id: currentReport.id },
            data: {
              classSize: validRows.length,
              grandMax: 800,
              assessment1Total,
              assessment2Total,
              examTotal,
              grandTotal,
              teacherComment,
            },
          })
        : await tx.reportCard.create({
            data: {
              studentId: student.id,
              classroomId: classroom.id,
              termId: term.id,
              status: "DRAFT",
              classSize: validRows.length,
              grandMax: 800,
              assessment1Total,
              assessment2Total,
              examTotal,
              grandTotal,
              teacherComment,
            },
          });

      if (currentReport) {
        updatedReports += 1;
      } else {
        createdReports += 1;
      }

      await tx.reportScore.deleteMany({
        where: {
          reportCardId: reportCard.id,
          subjectId: {
            in: boundSubjects.map((subject) => subject.id),
          },
        },
      });
      await tx.reportScore.createMany({
        data: boundSubjects.map((subject) => {
          const rawExamScore = row.scores[subject.key]?.trim() ?? "";
          const examScore = rawExamScore ? Number(rawExamScore) : null;

          return {
            reportCardId: reportCard.id,
            subjectId: subject.id,
            a1Score: null,
            a2Score: null,
            examScore,
            totalScore: examScore ?? 0,
          };
        }),
      });

      reportHrefs.push({
        href: `/reports/${reportCard.id}`,
        label: student.fullName,
      });
    }
  }, {
    maxWait: 10_000,
    timeout: 60_000,
  });

  await recomputeClassroomTermRanking(classroom.id, term.id);

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath("/analytics");
  revalidatePath("/reports/grand-sheet");
  for (const report of reportHrefs) {
    revalidatePath(report.href);
    revalidatePath(`${report.href}/preview`);
  }

  return {
    ok: true,
    message: `${reportHrefs.length} pupil report ${
      reportHrefs.length === 1 ? "sheet is" : "sheets are"
    } ready.`,
    createdStudents,
    createdReports,
    updatedReports,
    createdSubjects,
    reports: reportHrefs,
  };
}

function isValidGrandSheetMark(value: string | undefined, max: number) {
  if (!value?.trim()) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max;
}

function isBlankOrValidGrandSheetMark(value: string | undefined, max: number) {
  return !value?.trim() || isValidGrandSheetMark(value, max);
}
