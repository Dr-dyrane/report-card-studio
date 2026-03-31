# Kradle Auth Tracker

## Goal

Support a single teacher-owned workspace with low-friction sign-in and safe data ownership.

Bootstrap account:

- `hello@dyrane.tech`
- username: `kradle`

Supported auth methods:

- email + password
- username + password
- magic link by email

## Current State

### Done

- Better Auth installed and wired into the app
- Prisma auth models added:
  - `User`
  - `Session`
  - `Account`
  - `Verification`
- `School.ownerId` added and used for ownership
- bootstrap user created
- current school attached to the bootstrap user
- auth route added at `/api/auth/[...all]`
- `/sign-in` shipped
- magic-link signup/sign-in flow works
- onboarding for new users shipped
- forgot-password and reset-password shipped
- change password shipped in settings
- top-bar account surface and sign out shipped
- workspace routing is protected
- auth pages stay outside workspace chrome
- owned-school scoping added to the main loaders and core report actions
- report scan API requires auth

### Mostly Done

- ownership enforcement across the app
  - main paths are covered
  - still worth a final audit of every action and API route

### Still To Verify

- full production magic-link verification on live domain
- full production reset-password verification on live domain
- optional rate limiting for auth endpoints

## Product Rules

1. One teacher account owns the current dataset.
2. Email is the primary identity.
3. Username is a convenience alias for password login.
4. Magic link uses email only.
5. Auth should feel shipped, not narrated.

## Data Ownership Model

Current ownership scope:

- `School.ownerId`

That keeps the app simple:

- one school
- one owner
- classes, students, reports, and settings belong to that school

## Verification

Current confidence:

- password sign-in works
- new-user magic-link signup works
- route protection works
- reset and change-password screens are in place
- owned-school gating is active on the main workspace path

Engineering checks:

- `npm run lint`
- `npx tsc --noEmit`

## Next Auth Work

1. Audit any remaining server actions and API routes for ownership checks
2. Verify magic-link and password-reset flows on production domain
3. Add lightweight rate limiting if needed

## Status Summary

Auth is no longer a planning item. It is a shipped foundation with a short hardening tail.
