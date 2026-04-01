import Link from "next/link";
import { redirect } from "next/navigation";

import { ThemeToggleInline } from "@/components/theme/ThemeToggleInline";
import { BrandMark } from "@/components/ui/BrandMark";
import { getServerSession } from "@/lib/auth-session";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

const proofs = [
  "Teacher-owned workspace",
  "AI scan intake",
  "Real PDF exports",
];

export default async function HomePage() {
  const session = await getServerSession();

  if (session?.user) {
    const ownedSchool = await getOwnedSchoolForUser(session.user.id);
    redirect(ownedSchool ? "/students" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-[color:var(--canvas)] text-[color:var(--text-base)]">
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-3 py-3 sm:px-4 sm:py-4 xl:px-6 xl:py-6">
        <header className="premium-wash premium-sheen flex items-center justify-between rounded-[30px] px-4 py-4 shadow-[var(--shadow-frost-strong)] sm:px-6 sm:py-5">
          <BrandMark compact />
          <Link
            href="/sign-in"
            className="soft-action-tint rounded-full px-4 py-3 text-sm font-semibold"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 items-center py-3 sm:py-6">
          <section className="premium-wash premium-sheen w-full rounded-[38px] px-6 py-8 shadow-[var(--shadow-frost-strong)] sm:px-10 sm:py-12">
            <div className="mx-auto max-w-[780px] text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Academic reporting
              </p>
              <h1 className="mt-6 font-display text-[3.6rem] leading-[0.92] text-[color:var(--text-strong)] sm:text-[5.5rem]">
                Calm report cards.
              </h1>
              <p className="mt-6 text-base leading-7 text-[color:var(--text-base)] sm:text-lg">
                Capture, review, and export from one focused workspace.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {proofs.map((item) => (
                  <span
                    key={item}
                    className="surface-chip rounded-full px-4 py-2 text-sm font-medium text-[color:var(--text-base)]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/sign-in"
                  className="soft-action-tint rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Start with Kradle
                </Link>
              </div>

              <div className="mx-auto mt-10 w-full max-w-[240px]">
                <ThemeToggleInline />
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-3 flex items-center justify-center rounded-[24px] premium-wash px-4 py-4 text-sm text-[color:var(--text-muted)] shadow-[var(--shadow-frost)]">
          Kradle by Jelo. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
