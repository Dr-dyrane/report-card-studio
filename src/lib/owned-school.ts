import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";

export async function getOwnedSchoolForUser(userId: string) {
  const db = await getDb();

  if (!db) {
    return null;
  }

  const school = await db.school.findFirst({
    where: {
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  return school;
}

export async function getOwnedSchool() {
  const session = await requireServerSession();
  return getOwnedSchoolForUser(session.user.id);
}

export async function requireOwnedSchool() {
  const school = await getOwnedSchool();

  if (!school) {
    throw new Error("Owned school not found.");
  }

  return school;
}
