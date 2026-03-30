"use server";

import { redirect } from "next/navigation";

import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

function getSessionLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  if (month >= 9) {
    return `${year}/${year + 1}`;
  }

  return `${year - 1}/${year}`;
}

function getActiveTermSequence() {
  const month = new Date().getUTCMonth() + 1;

  if (month >= 9) return 1;
  if (month >= 1 && month <= 4) return 2;
  return 3;
}

export async function completeOnboarding(input: {
  schoolName: string;
  className?: string;
}) {
  const session = await requireServerSession();
  const db = await getDb();

  if (!db) {
    return { ok: false, message: "Database unavailable." };
  }

  const existingSchool = await getOwnedSchoolForUser(session.user.id);
  if (existingSchool) {
    return { ok: true, href: "/students" };
  }

  const schoolName = input.schoolName.trim().replace(/\s+/g, " ");
  const className = (input.className ?? "").trim().replace(/\s+/g, " ");

  if (!schoolName) {
    return { ok: false, message: "Add your school name." };
  }

  const sessionName = getSessionLabel();
  const activeSequence = getActiveTermSequence();

  const school = await db.school.create({
    data: {
      name: schoolName,
      ownerId: session.user.id,
      sessions: {
        create: {
          name: sessionName,
          isActive: true,
          terms: {
            create: [
              {
                name: "First Term",
                sequence: 1,
                isActive: activeSequence === 1,
              },
              {
                name: "Second Term",
                sequence: 2,
                isActive: activeSequence === 2,
              },
              {
                name: "Third Term",
                sequence: 3,
                isActive: activeSequence === 3,
              },
            ],
          },
        },
      },
    },
  });

  if (className) {
    await db.classroom.create({
      data: {
        name: className,
        schoolId: school.id,
        displayOrder: 1,
      },
    });
  }

  return { ok: true, href: "/students" };
}

export async function completeOnboardingAndRedirect(formData: FormData) {
  const schoolName = `${formData.get("schoolName") ?? ""}`;
  const className = `${formData.get("className") ?? ""}`;

  const result = await completeOnboarding({ schoolName, className });

  if (!result.ok || !result.href) {
    redirect("/onboarding");
  }

  redirect(result.href);
}
