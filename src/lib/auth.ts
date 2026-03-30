import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink, username } from "better-auth/plugins";
import { Resend } from "resend";

import { prisma } from "@/lib/db";

function cleanEnv(value: string | undefined) {
  return value?.trim();
}

function resolveAppUrl() {
  const explicit = cleanEnv(process.env.BETTER_AUTH_URL);

  if (explicit) {
    return explicit;
  }

  const publicUrl = cleanEnv(process.env.NEXT_PUBLIC_AUTH_URL);

  if (publicUrl) {
    return publicUrl;
  }

  const vercelUrl = cleanEnv(process.env.VERCEL_URL);

  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3001";
}

const appUrl = resolveAppUrl();
const authSecret =
  cleanEnv(process.env.BETTER_AUTH_SECRET) ??
  "kradle-dev-secret-change-me-please-replace";
const resendKey = cleanEnv(process.env.RESEND_API_KEY);
const resendFrom =
  cleanEnv(process.env.RESEND_FROM_EMAIL) ?? "noreply@kradle.dyrane.tech";

const resend = resendKey ? new Resend(resendKey) : null;

export const auth = betterAuth({
  appName: "Kradle",
  baseURL: appUrl,
  secret: authSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: Array.from(
    new Set(
      [
        appUrl,
        cleanEnv(process.env.NEXT_PUBLIC_AUTH_URL),
        cleanEnv(process.env.VERCEL_URL)
          ? `https://${cleanEnv(process.env.VERCEL_URL)}`
          : undefined,
      ].filter((value): value is string => Boolean(value)),
    ),
  ),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      if (!resend) {
        console.warn("[auth] Password reset email skipped because RESEND_API_KEY is not set.");
        console.info(`[auth] Password reset for ${user.email}: ${url}`);
        return;
      }

      await resend.emails.send({
        from: resendFrom,
        to: user.email,
        subject: "Reset your Kradle password",
        text: `Open this secure link to reset your Kradle password:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #111827;">
            <p style="margin: 0 0 16px;">Open this secure link to reset your Kradle password.</p>
            <p style="margin: 0 0 20px;">
              <a href="${url}" style="display: inline-block; padding: 12px 18px; border-radius: 999px; background: #2563eb; color: white; text-decoration: none;">Reset password</a>
            </p>
            <p style="margin: 0; color: #6b7280;">If you did not request this, you can ignore this email.</p>
          </div>
        `,
      });
    },
  },
  plugins: [
    nextCookies(),
    username(),
    magicLink({
      async sendMagicLink({ email, url }) {
        if (!resend) {
          console.warn("[auth] Magic link skipped because RESEND_API_KEY is not set.");
          console.info(`[auth] Magic link for ${email}: ${url}`);
          return;
        }

        await resend.emails.send({
          from: resendFrom,
          to: email,
          subject: "Your Kradle sign-in link",
          text: `Open this secure sign-in link to continue to Kradle:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
          html: `
            <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #111827;">
              <p style="margin: 0 0 16px;">Open this secure sign-in link to continue to Kradle.</p>
              <p style="margin: 0 0 20px;">
                <a href="${url}" style="display: inline-block; padding: 12px 18px; border-radius: 999px; background: #2563eb; color: white; text-decoration: none;">Sign in to Kradle</a>
              </p>
              <p style="margin: 0; color: #6b7280;">If you did not request this, you can ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
});
