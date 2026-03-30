"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";
import { requireServerSession } from "@/lib/auth-session";

type SubjectInput = {
  subjectId?: string;
  name: string;
  category: string;
  assessmentMode: "CONTINUOUS_AND_EXAM" | "EXAM_ONLY";
  a1Max: string;
  a2Max: string;
  examMax: string;
  displayOrder: string;
  isActive: boolean;
};

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string, fallback: number) {
  const parsed = parseOptionalNumber(value);
  return parsed ?? fallback;
}

function revalidateSubjects(subjectId?: string) {
  revalidatePath("/subjects");
  revalidatePath("/reports/new");
  if (subjectId) {
    revalidatePath(`/subjects/${subjectId}`);
  }
}

export async function saveSubject(input: SubjectInput) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  const category = input.category.trim().replace(/\s+/g, " ");
  const displayOrder = parseRequiredNumber(input.displayOrder, 0);
  const a1Max =
    input.assessmentMode === "EXAM_ONLY" ? null : parseOptionalNumber(input.a1Max);
  const a2Max =
    input.assessmentMode === "EXAM_ONLY" ? null : parseOptionalNumber(input.a2Max);
  const examMax = parseOptionalNumber(input.examMax);

  const duplicate = await db.subject.findFirst({
    where: {
      schoolId: ownedSchool.id,
      name,
      ...(input.subjectId ? { NOT: { id: input.subjectId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: false, message: "A subject with this name already exists." };
  }

  const data = {
    name,
    category: category || null,
    assessmentMode: input.assessmentMode,
    a1Max,
    a2Max,
    examMax,
    displayOrder,
    isActive: input.isActive,
    schoolId: ownedSchool.id,
  };

  const subject = input.subjectId
    ? await db.subject.update({
        where: { id: input.subjectId },
        data,
      })
    : await db.subject.create({
        data,
      });

  revalidateSubjects(subject.id);

  return {
    ok: true,
    subjectId: subject.id,
    message: input.subjectId ? "Subject updated." : "Subject created.",
  };
}

export async function removeSubject(input: { subjectId: string }) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const subject = await db.subject.findFirst({
    where: {
      id: input.subjectId,
      schoolId: ownedSchool.id,
    },
    include: {
      _count: {
        select: {
          classSubjects: true,
          reportScores: true,
        },
      },
    },
  });

  if (!subject) {
    return { ok: false, message: "Subject not found." };
  }

  const isReferenced = subject._count.classSubjects > 0 || subject._count.reportScores > 0;

  if (isReferenced) {
    await db.subject.update({
      where: { id: subject.id },
      data: {
        isActive: false,
      },
    });
    revalidateSubjects(subject.id);
    return { ok: true, mode: "archived" as const, message: "Subject archived." };
  }

  await db.subject.delete({
    where: { id: subject.id },
  });

  revalidateSubjects(subject.id);
  return { ok: true, mode: "deleted" as const, message: "Subject deleted." };
}
