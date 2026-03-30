import { redirect } from "next/navigation";

import { SignInFlow } from "@/components/auth/SignInFlow";
import { getServerSession } from "@/lib/auth-session";

export default async function SignInPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/students");
  }

  return <SignInFlow />;
}
