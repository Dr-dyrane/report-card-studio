"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";
import { requireServerSession } from "@/lib/auth-session";

type ClassroomInput = {
  classroomId?: string;
  name: string;
  teacherName: string;
  displayOrder: string;
};

function parseRequiredNumber(value: string, fallback: number) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function revalidateClasses(classroomId?: string) {
  revalidatePath("/classes");
  revalidatePath("/reports/new");
  revalidatePath("/students");
  if (classroomId) {
    revalidatePath(`/classes/${classroomId}`);
  }
}

export async function saveClassroom(input: ClassroomInput) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) {
    return { ok: false, message: "Class name is required." };
  }

  const duplicate = await db.classroom.findFirst({
    where: {
      schoolId: ownedSchool.id,
      name,
      ...(input.classroomId ? { NOT: { id: input.classroomId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: false, message: "A class with this name already exists." };
  }

  const classroom = input.classroomId
    ? await db.classroom.update({
        where: { id: input.classroomId },
        data: {
          name,
          teacherName: input.teacherName.trim().replace(/\s+/g, " ") || null,
          displayOrder: parseRequiredNumber(input.displayOrder, 0),
        },
      })
    : await db.classroom.create({
        data: {
          schoolId: ownedSchool.id,
          name,
          teacherName: input.teacherName.trim().replace(/\s+/g, " ") || null,
          displayOrder: parseRequiredNumber(input.displayOrder, 0),
        },
      });

  revalidateClasses(classroom.id);

  return {
    ok: true,
    classroomId: classroom.id,
    message: input.classroomId ? "Class updated." : "Class created.",
  };
}

export async function removeClassroom(input: { classroomId: string }) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const classroom = await db.classroom.findFirst({
    where: {
      id: input.classroomId,
      schoolId: ownedSchool.id,
    },
    include: {
      _count: {
        select: {
          students: true,
          reportCards: true,
          classSubjects: true,
        },
      },
    },
  });

  if (!classroom) {
    return { ok: false, message: "Class not found." };
  }

  if (classroom._count.students > 0 || classroom._count.reportCards > 0) {
    return {
      ok: false,
      message: "Move students and clear report sheets before removing this class.",
    };
  }

  await db.classSubject.deleteMany({
    where: { classroomId: classroom.id },
  });

  await db.classroom.delete({
    where: { id: classroom.id },
  });

  revalidateClasses(classroom.id);
  return { ok: true, message: "Class deleted." };
}
