# Kradle Next Steps

## Product Focus

Kradle should solve the original report-card workflow better than Excel:

1. open the class roster
2. open a student's report sheet quickly
3. edit scores inline
4. see subject totals and grand total update immediately
5. preview the finished report card
6. print or export cleanly

The app should stay aligned with Apple-style product principles:

- one clear task per screen
- calm, low-noise UI
- direct manipulation over explanation
- fast transitions between students
- print/export fidelity from the same rendered source

Clarified product rule:

- `New report` means `new student + new report sheet`
- scan intake should prefill a new sheet, not attach a report to an already existing student by default
- class context must stay visible across intake, roster, and reports

## Current Status

Implemented:

- app shell, grouped sidebar, mobile bottom bar, breadcrumb-style top bar
- Heroicons-based icon system
- PWA support and aggressive service-worker update flow
- Prisma connected to Postgres locally using pulled Vercel env
- report entry with inline editable scores
- live row totals and live assessment/grand totals
- report preview and browser print/PDF flow
- faster direct access from students and reports into report entry and preview
- class-aware new-sheet intake for manual and scan flows
- class segregation on students and reports via lightweight class filters

Partially implemented:

- preview/export parity with the Excel-derived report-card model
- setup CRUD for subjects, classes, terms, settings
- publish/finalize workflow
- ranking recomputation after edits

## Highest Priority Gaps

### 1. Full Report Parity

This is still the biggest product gap.

What remains:

- expand the subject model to match the full original report-card structure
- import or seed full subject-row data for all students
- support all assessment patterns present in the source report cards
- ensure preview matches the spreadsheet-derived layout across all students

Definition of done:

- every student report can render a full subject matrix
- preview/export no longer falls back to reduced subject coverage
- totals shown in preview exactly match stored row values

### 2. Faster Editing Flow

The app is editable now, but it should feel much closer to working in a spreadsheet.

What remains:

- autosave or blur-save score edits
- next/previous student navigation from report entry
- keyboard-first editing flow on desktop
- better mobile stepping between score inputs
- sticky student switcher or quick jump inside report entry

Definition of done:

- a teacher can move from one student sheet to the next with almost no friction
- saving feels automatic or near-automatic
- editing multiple rows does not require repeated navigation

### 3. Publish and Locking Workflow

What remains:

- wire the `Publish` action to persistence
- define state transitions: `DRAFT`, `PUBLISHED`, `LOCKED`
- define whether published reports remain editable
- add clear UI messaging around finalization state

Definition of done:

- publishing changes report state in the database
- preview/export reflect published state
- users understand whether a report is final or still editable

### 4. Scan-To-Add AI Intake

This is the next major workflow after the core sheet flow.

What remains:

- add a `Manual` or `Scan` entry choice when creating a report
- adapt the visual-lens pattern from the `drdyrane` repo into Kradle
- send report-card images to a vision endpoint that returns strict structured JSON
- prefill the student report sheet from scanned image data
- clearly flag low-confidence or unreadable fields for review
- let the teacher cross-check, fix, and save before anything is committed

Definition of done:

- a user can start a new report by uploading or capturing a report-card image
- the app extracts student identity, term summary, and subject rows into editable fields
- the editable report sheet stays the single source of truth
- saving remains a human-confirmed step, not an automatic blind import

### 5. Ranking and Position Recalculation

What remains:

- recompute class positions after score edits
- keep `grandTotal` and `position` in sync
- handle ranking scope by class and term

Definition of done:

- editing a student's scores can update their position correctly
- class standings remain trustworthy

### 6. Setup CRUD

The setup screens exist, but most still need real persistence.

What remains:

- subject create/edit/delete
- class create/edit
- term/session management
- settings persistence

Definition of done:

- all primary setup screens save to Prisma/Postgres
- changes are reflected immediately in report entry and preview

### 7. Production Backend Hardening

Local Postgres-backed development is now working. Production still needs explicit verification.

What remains:

- verify deployed Vercel environment is using Postgres-backed `DATABASE_URL`
- redeploy after Postgres migration changes
- confirm live reads and writes
- confirm preview/export uses real production data

Definition of done:

- deployed app reads and writes to Postgres successfully
- no Prisma fallback-only behavior is masking backend issues

### 8. PDF / Print Finish

The print path is much better, but still needs final product-level polish.

What remains:

- validate one-page fit across more real student reports
- tune pagination for longer report variants
- optionally add server-generated PDF later

Definition of done:

- browser print-to-PDF looks polished across representative reports
- no awkward blank first page, clipped rows, or poor page breaks

## Recommended Build Order

1. Verify production Postgres deployment
2. Add autosave or blur-save in report entry
3. Add next/previous student navigation inside report entry
4. Add scan-to-add AI intake
5. Implement ranking recomputation
6. Expand subject/report parity to full report-card coverage
7. Finish setup CRUD
8. Final print/PDF polish

## UX Direction to Preserve

Kradle should remain student-sheet-first, not dashboard-first.

Primary user journey:

1. open app
2. land in students
3. open student report
4. edit scores
5. preview
6. print/export

Secondary modules should support this flow, not compete with it.

## Suggested Near-Term Deliverables

### Sprint 1

- production backend verification
- autosave score edits
- next/previous student navigation

### Sprint 2

- scan-to-add AI intake
- ranking recomputation
- publish workflow
- stronger report-entry ergonomics

### Sprint 3

- full report parity with the Excel-derived model
- final preview/export polish
