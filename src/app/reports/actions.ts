"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";

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

export async function updateReportScores(input: {
  reportCardId: string;
  routeKey: string;
  teacherComment: string;
  teacherName: string;
  scores: ScoreUpdateInput[];
}) {
  const db = await getDb();
  if (!db) {
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
    where: { id: input.reportCardId },
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
