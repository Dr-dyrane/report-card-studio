"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";
import { requireServerSession } from "@/lib/auth-session";

type StudentInput = {
  studentId: string;
  fullName: string;
  classroomId: string;
  isActive: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function revalidateStudents(routeKey?: string) {
  revalidatePath("/students");
  revalidatePath("/reports");
  if (routeKey) {
    revalidatePath(`/students/${routeKey}`);
    revalidatePath(`/reports/${routeKey}`);
    revalidatePath(`/reports/${routeKey}/preview`);
  }
}

export async function saveStudent(input: StudentInput) {
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

  const student = await db.student.findFirst({
    where: {
      id: input.studentId,
      schoolId: ownedSchool.id,
    },
    select: { id: true, fullName: true },
  });

  if (!student) {
    return { ok: false, message: "Student not found." };
  }

  const classroom = await db.classroom.findFirst({
    where: {
      id: input.classroomId,
      schoolId: ownedSchool.id,
    },
    select: { id: true },
  });

  if (!classroom) {
    return { ok: false, message: "Class not found." };
  }

  const duplicate = await db.student.findFirst({
    where: {
      schoolId: ownedSchool.id,
      classroomId: input.classroomId,
      fullName,
      NOT: { id: input.studentId },
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: false, message: "A student with this name already exists in that class." };
  }

  const updated = await db.student.update({
    where: { id: input.studentId },
    data: {
      fullName,
      classroomId: input.classroomId,
      isActive: input.isActive,
    },
  });

  const oldRoute = slugify(student.fullName);
  const newRoute = slugify(updated.fullName);

  revalidateStudents(oldRoute);
  if (newRoute !== oldRoute) {
    revalidateStudents(newRoute);
  }

  return {
    ok: true,
    routeKey: newRoute,
    message: "Student updated.",
  };
}

export async function removeStudent(input: { studentId: string; routeKey: string }) {
  await requireServerSession();
  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const student = await db.student.findFirst({
    where: {
      id: input.studentId,
      schoolId: ownedSchool.id,
    },
    include: {
      _count: {
        select: {
          reportCards: true,
        },
      },
    },
  });

  if (!student) {
    return { ok: false, message: "Student not found." };
  }

  if (student._count.reportCards > 0) {
    await db.student.update({
      where: { id: student.id },
      data: {
        isActive: false,
      },
    });
    revalidateStudents(input.routeKey);
    return { ok: true, mode: "archived" as const, message: "Student archived." };
  }

  await db.student.delete({
    where: { id: student.id },
  });
  revalidateStudents(input.routeKey);
  return { ok: true, mode: "deleted" as const, message: "Student deleted." };
}
