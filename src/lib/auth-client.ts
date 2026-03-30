"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, usernameClient } from "better-auth/client/plugins";

function cleanEnv(value: string | undefined) {
  return value?.trim();
}

const baseURL =
  cleanEnv(process.env.NEXT_PUBLIC_AUTH_URL) ??
  cleanEnv(process.env.BETTER_AUTH_URL) ??
  "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
  plugins: [usernameClient(), magicLinkClient()],
});
