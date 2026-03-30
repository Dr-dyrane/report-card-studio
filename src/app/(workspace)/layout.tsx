import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireServerSession } from "@/lib/auth-session";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireServerSession();
  const ownedSchool = await getOwnedSchoolForUser(session.user.id);

  if (!ownedSchool) {
    redirect("/onboarding");
  }

  return children;
}
