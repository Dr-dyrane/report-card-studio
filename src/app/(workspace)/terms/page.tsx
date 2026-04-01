import { PageHeader } from "@/components/ui/PageHeader";
import { TermsManager } from "@/components/terms/TermsManager";
import { requireServerSession } from "@/lib/auth-session";
import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";

export default async function TermsPage() {
  await requireServerSession();
  const school = await requireOwnedSchool();
  const db = await getDb();

  const sessions = db
    ? await db.academicSession.findMany({
        where: { schoolId: school.id },
        include: {
          terms: {
            include: {
              _count: { select: { reportCards: true } },
            },
            orderBy: [{ sequence: "asc" }],
          },
        },
        orderBy: [{ createdAt: "asc" }],
      })
    : [];

  const flattenedTerms = sessions.flatMap((session) =>
    session.terms.map((term) => ({
      id: term.id,
      name: term.name,
      sequence: term.sequence,
      isActive: term.isActive,
      nextTermBegins: term.nextTermBegins,
      sessionId: session.id,
      sessionName: session.name,
      reportCount: term._count.reportCards,
    })),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Terms"
        title="Terms"
      />

      <TermsManager
        schoolName={school.name}
        sessions={sessions.map((session) => ({
          id: session.id,
          name: session.name,
          isActive: session.isActive,
          termsCount: session.terms.length,
          reportCount: session.terms.reduce(
            (sum, term) => sum + term._count.reportCards,
            0,
          ),
        }))}
        terms={flattenedTerms}
      />
    </div>
  );
}
