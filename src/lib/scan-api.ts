import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getOwnedSchoolForUser } from "@/lib/owned-school";

export async function getApiScanContext(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  const school = await getOwnedSchoolForUser(session.user.id);
  if (!school) return null;

  return { db: await getDb(), school, user: session.user };
}

export function safeScanError(error: unknown) {
  if (error instanceof Error && error.message) {
    if (/blob|token|store|oidc|database/i.test(error.message)) {
      return "Scan storage is temporarily unavailable. Your academic records were not changed.";
    }
  }
  return "The photo was saved, but it could not be read. Please retry.";
}
