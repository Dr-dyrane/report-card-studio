import { redirect } from "next/navigation";

import { SignInFlow } from "@/components/auth/SignInFlow";
import { getServerSession } from "@/lib/auth-session";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

export default async function SignInPage() {
  const session = await getServerSession();

  if (session?.user) {
    const ownedSchool = await getOwnedSchoolForUser(session.user.id);
    redirect(ownedSchool ? "/students" : "/onboarding");
  }

  return <SignInFlow />;
}
