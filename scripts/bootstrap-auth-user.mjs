import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, username } from "better-auth/plugins";
import { Resend } from "resend";

const workspaceRoot = resolve(import.meta.dirname, "..");
const envPaths = [resolve(workspaceRoot, ".env.local"), resolve(workspaceRoot, ".env")];
const loadedEnvKeys = new Set();

for (const envPath of envPaths) {
  if (!existsSync(envPath)) continue;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || loadedEnvKeys.has(key)) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
    loadedEnvKeys.add(key);
  }
}

function cleanEnv(value) {
  return value?.trim();
}

const databaseUrl = cleanEnv(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasourceUrl: databaseUrl,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

const appUrl = cleanEnv(process.env.BETTER_AUTH_URL) ?? "http://localhost:3001";
const authSecret =
  cleanEnv(process.env.BETTER_AUTH_SECRET) ??
  "kradle-dev-secret-change-me-please-replace";
const resendKey = cleanEnv(process.env.RESEND_API_KEY);
const resendFrom =
  cleanEnv(process.env.RESEND_FROM_EMAIL) ?? "noreply@kradle.dyrane.tech";

const resend = resendKey ? new Resend(resendKey) : null;

const auth = betterAuth({
  appName: "Kradle",
  baseURL: appUrl,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username(),
    magicLink({
      disableSignUp: true,
      async sendMagicLink({ email, url }) {
        if (!resend) {
          console.info(`[bootstrap] Magic link for ${email}: ${url}`);
          return;
        }

        await resend.emails.send({
          from: resendFrom,
          to: email,
          subject: "Your Kradle sign-in link",
          text: `Open this secure sign-in link to continue to Kradle:\n\n${url}`,
        });
      },
    }),
  ],
});

async function main() {
  const email = "hello@dyrane.tech";
  const usernameValue = "kradle";
  const password = "getKradle2026";

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Kradle",
        email,
        password,
        username: usernameValue,
        displayUsername: usernameValue,
      },
    });

    if (!result?.user?.id) {
      throw new Error("Bootstrap user creation did not return a user id.");
    }

    user = await prisma.user.findUnique({
      where: { id: result.user.id },
    });
  }

  if (!user) {
    throw new Error("Bootstrap user could not be loaded after creation.");
  }

  const school = await prisma.school.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!school) {
    throw new Error("No school exists yet. Seed the app data before bootstrapping auth.");
  }

  await prisma.school.update({
    where: { id: school.id },
    data: { ownerId: user.id },
  });

  console.info(`[bootstrap] Attached school "${school.name}" to ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
