"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { requireServerSession } from "@/lib/auth-session";
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

export async function updateReportScores(input: {
  reportCardId: string;
  routeKey: string;
  teacherComment: string;
  teacherName: string;
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
    },
  });

  if (!reportCard) {
    return { ok: false };
  }

  for (const score of input.scores) {
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

  const assessment1Total = reportScores.reduce(
    (sum, score) => sum + (score.a1Score ?? 0),
    0,
  );
  const assessment2Total = reportScores.reduce(
    (sum, score) => sum + (score.a2Score ?? 0),
    0,
  );
  const examTotal = reportScores.reduce((sum, score) => sum + (score.examScore ?? 0), 0);
  const grandTotal = reportScores.reduce((sum, score) => sum + score.totalScore, 0);

  const classroom = await db.reportCard.findUnique({
    where: { id: reportCard.id },
    select: { classroomId: true },
  });

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

  if (classroom?.classroomId) {
    await db.classroom.update({
      where: { id: classroom.classroomId },
      data: {
        teacherName: input.teacherName,
      },
    });
  }

  revalidatePath("/reports");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/students");
  revalidatePath(`/students/${input.routeKey}`);

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
    select: { id: true },
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

  revalidatePath("/reports");
  revalidatePath(`/reports/${input.routeKey}`);
  revalidatePath(`/reports/${input.routeKey}/preview`);
  revalidatePath("/students");
  revalidatePath(`/students/${input.routeKey}`);

  return { ok: true };
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
          students: true,
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
      students: true,
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

  revalidatePath("/reports");
  revalidatePath("/students");
  revalidatePath(created.href);
  revalidatePath(`${created.href}/preview`);
  revalidatePath(`/students/${slugify(input.fullName)}`);

  return { ok: true, href: created.href };
}
