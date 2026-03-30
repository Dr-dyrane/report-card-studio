import { ReactNode } from "react";

import { requireServerSession } from "@/lib/auth-session";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireServerSession();

  return children;
}
