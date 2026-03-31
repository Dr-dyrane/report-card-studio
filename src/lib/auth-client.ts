"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, usernameClient } from "better-auth/client/plugins";

function cleanEnv(value: string | undefined) {
  return value?.trim();
}

function normalizeLocalUrl(value: string | undefined) {
  const nextValue = cleanEnv(value);

  if (!nextValue) return undefined;

  const port = cleanEnv(process.env.PORT);
  if (!port) return nextValue;

  try {
    const url = new URL(nextValue);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.port = port;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return nextValue;
  }

  return nextValue;
}

function resolveBaseURL() {
  const explicit = normalizeLocalUrl(process.env.NEXT_PUBLIC_AUTH_URL);

  if (explicit) {
    return explicit;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return `http://localhost:${cleanEnv(process.env.PORT) ?? "3000"}`;
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
  basePath: "/api/auth",
  plugins: [usernameClient(), magicLinkClient()],
});
