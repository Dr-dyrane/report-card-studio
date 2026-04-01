import { requireServerSession } from "@/lib/auth-session";
import { getOwnedSchool } from "@/lib/owned-school";
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ProfilePage() {
  const session = await requireServerSession();
  const school = await getOwnedSchool();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title={session.user.name ?? "Profile"}
      />

      <ProfileWorkspace user={session.user} schoolName={school?.name ?? null} />
    </div>
  );
}
