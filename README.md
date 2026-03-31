# Kradle

Kradle is a calm academic reporting workspace built for fast score entry, review, scan-assisted capture, and print-ready report cards.

## Product Goal

Kradle should solve the original workflow better than Excel:

1. open the roster
2. open a student sheet quickly
3. edit scores inline
4. see totals update immediately
5. preview the report card
6. print or export cleanly

The product is intentionally student-sheet-first, not dashboard-first.

## Current State

Implemented:

- teacher-owned auth with Better Auth
- email/password, username/password, and magic link sign-in
- onboarding, password reset, change password, account management
- Prisma Postgres-backed data model
- owned-school scoping for the main workspace
- subjects, classes, students, terms, and settings CRUD foundations
- report entry with live row totals and live grand totals
- report archive/delete safeguards
- ranking recomputation improvements
- report preview plus browser print/PDF flow
- scan-to-add foundation for AI-prefilled report creation
- mobile shell with avatar utility sheet, FAB, and blade list patterns
- warmer, lower-glare light theme and refined dark theme

Still in progress:

- full preview/export parity with the Excel-derived report structure
- final report-sheet speed polish
- final ranking verification across every surface
- final visual polish on dense desktop data views

## Tech

- Next.js App Router
- TypeScript
- Prisma
- Postgres
- Better Auth
- Resend
- Tailwind CSS v4

## Core Product Rules

- `New report` means `new student + new report sheet`
- scan should prefill a new sheet by default
- teachers remain in control: AI suggests, teacher reviews, teacher saves
- shell context should use real workspace data or stay empty
- shared UI should avoid explanatory filler copy

## Design Direction

Kradle aims for:

- low-noise Apple-style UI
- direct manipulation over narration
- soft surfaces instead of heavy borders
- dense but elegant desktop workspaces
- mobile sheets and blades over cramped mini tables
- print output from the same rendered source used for preview

## Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
```

## Main Docs

- [Next steps](C:\Users\Dyrane\Documents\ccs\report-card-studio\docs\NEXT_STEPS.md)
- [Auth tracker](C:\Users\Dyrane\Documents\ccs\report-card-studio\docs\AUTH_PLAN.md)
- [Scan-to-add flow](C:\Users\Dyrane\Documents\ccs\report-card-studio\docs\SCAN_TO_ADD_FLOW.md)
