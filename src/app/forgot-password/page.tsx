import { redirect } from "next/navigation";

import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";
import { getServerSession } from "@/lib/auth-session";

export default async function ForgotPasswordPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/settings");
  }

  return <ForgotPasswordFlow />;
}
