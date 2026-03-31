"use server";

import { revalidatePath } from "next/cache";

import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";

export async function saveWorkspaceProfile(input: { name: string }) {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return { ok: false, message: "Database unavailable." };

  const name = input.name.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, message: "Workspace name is required." };

  const previousName = school.name;

  await db.school.update({
    where: { id: school.id },
    data: { name },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/students");
  revalidatePath("/reports");

  return { ok: true, message: "Workspace updated.", previousName };
}
