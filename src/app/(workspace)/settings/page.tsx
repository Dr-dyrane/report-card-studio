import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { getOwnedSchool } from "@/lib/owned-school";
import { AccountProfileCard } from "@/components/settings/AccountProfileCard";
import { ChangePasswordCard } from "@/components/settings/ChangePasswordCard";
import { ThemeToggleCard } from "@/components/theme/ThemeToggleCard";
import { Field, InputShell } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";

export default async function SettingsPage() {
  const session = await requireServerSession();
  const school = await getOwnedSchool();
  const db = await getDb();

  const activeSession = school
    ? await db.academicSession.findFirst({
        where: {
          schoolId: school.id,
          isActive: true,
        },
        include: {
          terms: {
            where: {
              isActive: true,
            },
            orderBy: [{ sequence: "asc" }],
            take: 1,
          },
        },
      })
    : null;

  const activeTerm = activeSession?.terms[0] ?? null;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Settings" description="Account and workspace." />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Account">
          <AccountProfileCard
            name={session.user.name ?? ""}
            email={session.user.email}
            username={session.user.username ?? ""}
          />
        </SectionCard>

        <SectionCard title="Workspace">
          <div className="grid gap-5">
            <Field label="Name">
              <InputShell value={school?.name ?? "No workspace"} />
            </Field>
            <Field label="Session">
              <InputShell value={activeSession?.name ?? "Not set"} />
            </Field>
            <Field label="Active term">
              <InputShell value={activeTerm?.name ?? "Not set"} />
            </Field>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Appearance">
        <ThemeToggleCard />
      </SectionCard>

      <SectionCard title="Security">
        <ChangePasswordCard />
      </SectionCard>
    </div>
  );
}
