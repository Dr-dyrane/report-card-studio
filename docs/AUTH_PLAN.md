# Auth Plan

## Goal

Kradle should support a single teacher-owned workspace first, with a path to grow later without rewriting the auth model.

Bootstrap account:

- `hello@dyrane.tech`
- username: `kradle`

Supported sign-in methods:

- email + password
- username + password
- magic link by email

This is a teacher product, not an open public multi-tenant platform yet.

## Tracker

### Done

- Better Auth installed and wired into the app
- Prisma auth models added:
  - `User`
  - `Session`
  - `Account`
  - `Verification`
- `School.ownerId` added
- bootstrap auth script added
- bootstrap user created:
  - `hello@dyrane.tech`
  - username `kradle`
- current school attached to the bootstrap user
- auth route added at `/api/auth/[...all]`
- sign-in page added at `/sign-in`
- password sign-in UI added
- magic-link UI added
- workspace route protection added through `src/app/(workspace)/layout.tsx`
- root route now redirects by session state
- shell skips workspace chrome on `/sign-in`
- top bar now supports sign out
- report scan API now requires auth
- report server actions now require auth
- Prisma client regenerated successfully after schema/auth changes
- password sign-in verified end to end with browser-like request

### In Progress

- converting auth from “login works” to full owned-data access
- cleaning UI language so auth surfaces feel shipped, not narrated

### Next

1. Scope loaders and server actions by `School.ownerId`
2. Add a small account surface in the app chrome
3. Verify magic-link flow end to end with Resend in browser and on Vercel
4. Protect any remaining server actions and API routes not yet gated
5. Add password-change flow later if needed

### Blocked

- No hard blocker right now
- Magic-link production verification depends on final Vercel env review and live email delivery testing

### Verification

- `npm run lint`
- `npx tsc --noEmit`
- sign-in endpoint returns `200` with session cookie when called with browser-style `Origin`
- unauthenticated workspace route redirects to `/sign-in`
- unauthenticated scan API returns `401`

## Product Rules

1. One teacher account owns the current dataset.
2. Existing data should be attached to the bootstrap account.
3. Magic link is convenience auth, not the only auth method.
4. Password auth should accept either email or username.
5. Signup should stay controlled for now.
6. No broad public registration in phase 1.

## Recommended Stack

- Better Auth
- Prisma Postgres
- Resend
- Next.js App Router route-group/session guards

Why:

- Better Auth supports email/password and magic link.
- Prisma already uses Postgres in this app.
- Resend is already the planned mail provider.
- This keeps the auth layer small and aligned with the current codebase.

## Current App Reality

Today the core academic models are:

- `School`
- `AcademicSession`
- `Term`
- `Classroom`
- `Student`
- `Subject`
- `ReportCard`
- `ReportScore`

Auth ownership now exists at the school level:

- `School.ownerId`

So the next stage is not introducing ownership, but enforcing it consistently across loaders and actions.

## Data Model Plan

### Auth Models

Current auth tables in Prisma:

- `User`
- `Session`
- `Account`
- `Verification`

### User Model Requirements

The app-level user includes:

- `id`
- `email`
- `username`
- `name`
- `displayUsername`
- `emailVerified`
- `createdAt`
- `updatedAt`

Password storage is handled by Better Auth through the account model.

### Ownership Fields

Phase 1 ownership:

- `School.ownerId`

This keeps the current product simple:

- one school
- one owner
- all current classes/students/reports belong to that school

Possible later expansion:

- `Classroom.ownerId`
- `Student.ownerId`
- `ReportCard.ownerId`

But that is not needed yet.

## Bootstrap Strategy

Bootstrap user:

- `hello@dyrane.tech`

Current strategy:

- create bootstrap user
- assign first school row to `School.ownerId`

That is already done for the current database.

## Authentication Methods

### 1. Email + Password

Primary everyday login.

User enters:

- email or username
- password

Behavior:

- if input contains `@`, treat as email
- otherwise treat as username
- resolve to the same user account

### 2. Magic Link

Secondary low-friction login.

User enters:

- email

Behavior:

- send magic link using Resend
- user clicks link
- session is created

### 3. Username

Username is not a separate auth system.

It is:

- an alias for password login only

Magic link still uses email.

## Route Protection

### Public

- `/sign-in`
- `/api/auth/*`
- Better Auth callback endpoints

### Protected

- `/`
- `/dashboard`
- `/students`
- `/reports`
- `/analytics`
- `/subjects`
- `/classes`
- `/terms`
- `/settings`
- `/exports`
- scan routes and report actions

### Current Protection Strategy

Implemented with route groups:

- `src/app/(workspace)/layout.tsx`

Behavior:

- signed-out user -> redirect to `/sign-in`
- signed-in user -> workspace routes available
- `/sign-in` redirects to `/students` when already signed in

## UX Plan

### Sign-In Screen

Keep it extremely simple:

- password tab
- magic-link tab
- one credential field set at a time
- no explanatory marketing copy

### Session UX

After sign-in:

- land on `/students`

Top bar:

- current user email
- sign out

## Controlled Access Plan

Phase 1:

- no general signup screen
- bootstrap account first
- optional invite-only user creation later

Reason:

- less abuse risk
- less setup complexity
- matches the current teacher-owned product scope

## Implementation Order

### Phase 1: Foundation

1. Install Better Auth
2. Add auth schema/models for Prisma
3. Add `User` ownership concept
4. Add `ownerId` to `School`
5. Generate migration/client

Status:

- done

### Phase 2: Bootstrap

1. Create bootstrap user `hello@dyrane.tech`
2. Attach the current school row to that user
3. Add script to safely backfill existing DBs

Status:

- done

### Phase 3: Sign-In

1. Build `/sign-in`
2. Add email/password sign-in
3. Add magic link sign-in
4. Support email-or-username lookup for password login

Status:

- done for UI and password flow
- magic-link browser and production verification still pending

### Phase 4: Protection

1. Add session guards
2. Protect app routes
3. Redirect signed-out users cleanly

Status:

- mostly done

Still to do:

- audit remaining API routes and actions for auth checks

### Phase 5: App Integration

1. Add top-bar account surface
2. Add sign out
3. Use current user session in server actions
4. Scope all data loaders by owned school

Status:

- sign out done
- action checks partially done
- school ownership scoping still next

### Phase 6: Hardening

1. Rate-limit magic-link and sign-in requests
2. Add password reset later if needed
3. Add email verification UX polish if required

Status:

- not started

## Data Access Rules

All loaders and server actions should enforce:

- current user session exists
- current user owns the school being queried

That is the next major auth milestone.

## Risks To Avoid

1. Do not add auth without ownership enforcement.
2. Do not keep the current global data access once auth exists.
3. Do not allow broad public signup yet.
4. Do not make username a separate identity source from email.
5. Do not hand-roll password hashing/session storage when Better Auth already handles it.

## Migration Notes

Treat this as a careful data migration, not just “install auth”.

Safe sequence:

1. add models/columns
2. migrate schema
3. create bootstrap user
4. attach school to owner
5. protect routes
6. scope data access

## Env Plan

Current relevant envs:

- `DATABASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

## Later Expansion

When the app grows beyond one teacher:

- add invites
- add more users
- add class assignment tables
- add role distinctions

But do not build that now.

## Decision Summary

The phase-1 auth contract is:

- single teacher-owned workspace
- bootstrap account at `hello@dyrane.tech`
- email + password
- username + password
- magic link by email
- controlled signup
- ownership attached at the school level first

## Sources

- Better Auth magic link plugin docs:
  - https://www.better-auth.com/docs/plugins/magic-link
- Better Auth email service docs:
  - https://better-auth.com/docs/infrastructure/services/email
- Prisma guide for Better Auth + Next.js:
  - https://docs.prisma.io/docs/guides/authentication/better-auth/nextjs
