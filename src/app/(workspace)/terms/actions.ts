"use server";

import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";

type SessionInput = {
  sessionId?: string;
  name: string;
};

type TermInput = {
  termId?: string;
  sessionId: string;
  name: string;
  sequence: string;
  nextTermBegins?: string;
};

function parseSequence(value: string, fallback: number) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function revalidateTerms() {
  revalidatePath("/terms");
  revalidatePath("/settings");
}

export async function saveAcademicSession(input: SessionInput) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, message: "Session name is required." };

  const duplicate = await db.academicSession.findFirst({
    where: {
      schoolId: school.id,
      name,
      ...(input.sessionId ? { NOT: { id: input.sessionId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: false, message: "A session with this name already exists." };
  }

  const existingActive = await db.academicSession.findFirst({
    where: { schoolId: school.id, isActive: true },
    select: { id: true },
  });

  const session = input.sessionId
    ? await db.academicSession.update({
        where: { id: input.sessionId },
        data: { name },
      })
    : await db.academicSession.create({
        data: {
          schoolId: school.id,
          name,
          isActive: !existingActive,
        },
      });

  revalidateTerms();

  return {
    ok: true,
    sessionId: session.id,
    message: input.sessionId ? "Session updated." : "Session created.",
  };
}

export async function setActiveAcademicSession(input: { sessionId: string }) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const session = await db.academicSession.findFirst({
    where: { id: input.sessionId, schoolId: school.id },
    select: { id: true, isActive: true },
  });

  if (!session) return { ok: false, message: "Session not found." };

  const previousActive = await db.academicSession.findFirst({
    where: { schoolId: school.id, isActive: true },
    select: { id: true },
  });

  await db.academicSession.updateMany({
    where: { schoolId: school.id },
    data: { isActive: false },
  });

  await db.academicSession.update({
    where: { id: session.id },
    data: { isActive: true },
  });

  const firstActiveTerm = await db.term.findFirst({
    where: { sessionId: session.id, isActive: true },
    select: { id: true },
  });

  if (!firstActiveTerm) {
    const firstTerm = await db.term.findFirst({
      where: { sessionId: session.id },
      orderBy: [{ sequence: "asc" }],
      select: { id: true },
    });

    if (firstTerm) {
      await db.term.updateMany({
        where: { session: { schoolId: school.id } },
        data: { isActive: false },
      });
      await db.term.update({
        where: { id: firstTerm.id },
        data: { isActive: true },
      });
    }
  }

  revalidateTerms();

  return {
    ok: true,
    previousSessionId: previousActive?.id ?? null,
    message: "Session is now active.",
  };
}

export async function removeAcademicSession(input: { sessionId: string }) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const session = await db.academicSession.findFirst({
    where: { id: input.sessionId, schoolId: school.id },
    include: {
      terms: {
        include: {
          _count: {
            select: { reportCards: true },
          },
        },
      },
    },
  });

  if (!session) return { ok: false, message: "Session not found." };
  if (session.isActive) {
    return { ok: false, message: "Set another session active before removing this one." };
  }
  if (session.terms.some((term) => term._count.reportCards > 0)) {
    return { ok: false, message: "This session already has report history." };
  }

  await db.academicSession.delete({ where: { id: session.id } });
  revalidateTerms();
  return { ok: true, message: "Session deleted." };
}

export async function saveTerm(input: TermInput) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, message: "Term name is required." };

  const session = await db.academicSession.findFirst({
    where: { id: input.sessionId, schoolId: school.id },
    select: { id: true },
  });

  if (!session) return { ok: false, message: "Session not found." };

  const sequence = parseSequence(input.sequence, 1);

  const duplicate = await db.term.findFirst({
    where: {
      sessionId: session.id,
      sequence,
      ...(input.termId ? { NOT: { id: input.termId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    return { ok: false, message: "That term order is already used in this session." };
  }

  const existingActive = await db.term.findFirst({
    where: { session: { schoolId: school.id }, isActive: true },
    select: { id: true },
  });

  const term = input.termId
    ? await db.term.update({
        where: { id: input.termId },
        data: {
          name,
          sequence,
          nextTermBegins: input.nextTermBegins?.trim() || null,
        },
      })
    : await db.term.create({
        data: {
          sessionId: session.id,
          name,
          sequence,
          nextTermBegins: input.nextTermBegins?.trim() || null,
          isActive: !existingActive,
        },
      });

  revalidateTerms();
  return {
    ok: true,
    termId: term.id,
    message: input.termId ? "Term updated." : "Term created.",
  };
}

export async function setActiveTerm(input: { termId: string }) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const term = await db.term.findFirst({
    where: {
      id: input.termId,
      session: { schoolId: school.id },
    },
    include: {
      session: true,
    },
  });

  if (!term) return { ok: false, message: "Term not found." };

  const previousActiveTerm = await db.term.findFirst({
    where: { session: { schoolId: school.id }, isActive: true },
    select: { id: true },
  });
  const previousActiveSession = await db.academicSession.findFirst({
    where: { schoolId: school.id, isActive: true },
    select: { id: true },
  });

  await db.term.updateMany({
    where: { session: { schoolId: school.id } },
    data: { isActive: false },
  });
  await db.term.update({ where: { id: term.id }, data: { isActive: true } });

  await db.academicSession.updateMany({
    where: { schoolId: school.id },
    data: { isActive: false },
  });
  await db.academicSession.update({
    where: { id: term.sessionId },
    data: { isActive: true },
  });

  revalidateTerms();
  return {
    ok: true,
    previousTermId: previousActiveTerm?.id ?? null,
    previousSessionId: previousActiveSession?.id ?? null,
    message: "Term is now active.",
  };
}

export async function removeTerm(input: { termId: string }) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const term = await db.term.findFirst({
    where: { id: input.termId, session: { schoolId: school.id } },
    include: {
      _count: { select: { reportCards: true } },
    },
  });

  if (!term) return { ok: false, message: "Term not found." };
  if (term.isActive) {
    return { ok: false, message: "Set another term active before removing this one." };
  }
  if (term._count.reportCards > 0) {
    return { ok: false, message: "This term already has report history." };
  }

  await db.term.delete({ where: { id: term.id } });
  revalidateTerms();
  return { ok: true, message: "Term deleted." };
}
