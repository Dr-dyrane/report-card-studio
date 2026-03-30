import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { getServerSession } from "@/lib/auth-session";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

export default async function OnboardingPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const ownedSchool = await getOwnedSchoolForUser(session.user.id);

  if (ownedSchool) {
    redirect("/students");
  }

  return (
    <OnboardingFlow
      email={session.user.email}
      displayName={session.user.name ?? session.user.username ?? ""}
    />
  );
}
