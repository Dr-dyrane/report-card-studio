"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, usernameClient } from "better-auth/client/plugins";

function cleanEnv(value: string | undefined) {
  return value?.trim();
}

function resolveBaseURL() {
  const explicit = cleanEnv(process.env.NEXT_PUBLIC_AUTH_URL);

  if (explicit) {
    return explicit;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3001";
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
  basePath: "/api/auth",
  plugins: [usernameClient(), magicLinkClient()],
});
