# Kradle Next Steps

## Where We Are

Execution has gone well on structure and usability.

Strongly shipped:

- auth and teacher-owned workspace model
- Prisma Postgres-backed app data
- core shell, mobile shell, and account surfaces
- report entry with live totals
- preview and browser print/PDF
- scan-to-add foundation
- CRUD foundation for subjects, classes, students, terms, and settings
- archive/delete safeguards for core models

Still actively being refined:

- final print/export fidelity against real report cards
- final ranking trust and visibility across all surfaces
- final beautification pass for dense desktop workspaces

## Biggest Remaining Product Gaps

### 1. Preview / Export Fidelity

The matrix parity work is now much further along.

Already improved:

- report entry now uses the full class subject matrix
- preview now renders the full matrix structure even when scores are blank
- blank sheets feel like working sheets instead of dead-end placeholders
- preview rows and export structure now come from the shared report loader

Remaining work:

- visually verify a few real student cards against the original Excel-derived layout
- tighten print rhythm, spacing, and page fit for one-page PDF output
- carry any remaining subject or assessment edge variants cleanly

Definition of done:

- every student report renders a complete matrix
- preview and print match stored row data
- export feels trustworthy enough to replace the spreadsheet print path

### 2. Report Sheet Speed

The sheet works, but it should feel faster and more fluid.

Already improved:

- blur-save is in place
- enter-key movement across score cells is in place
- blank sheets now open as real editable matrices
- previous / next student flow exists on the sheet

Remaining work:

- further keyboard movement refinement on desktop
- cleaner active-row and active-cell presence
- better mobile stepping through score fields
- lighter save feedback during long entry sessions

Definition of done:

- a teacher can move through a class with minimal friction
- saving feels mostly automatic
- the sheet feels better than Excel, not just equivalent

### 3. Ranking Verification

Ranking logic is much better than before, but still needs a final visible trust pass.

Already improved:

- ranking recomputation runs after score edits
- ranking recomputation runs after publish
- ranking recomputation runs after scan prefill
- live analytics now reads from workspace data

Remaining work:

- visually verify recomputed positions on reports, students, analytics, and previews
- surface rank changes more clearly after edits
- confirm class-size scope stays correct in every edge case

Definition of done:

- edits update position consistently
- every view tells the same story

### 4. Scan Review Polish

The scan path exists, but it still needs final product refinement.

Already improved:

- new report flow is multiphasic
- scan waiting states are clearer
- scan review now distinguishes detected vs final student/class values

Remaining work:

- refine confidence and warning presentation
- make edited vs detected values even clearer where needed
- keep tightening the handoff from scan to working sheet

Definition of done:

- scan feels trustworthy and calm
- review feels fast, not heavy

## Beautification Plan

Usability has improved a lot. The next visual work should focus on polish, not experimentation.

### A. Dense Desktop Craft

- reduce dead space on desktop list/workspace screens
- make tables and list rows feel more intentional
- improve alignment of actions, totals, and status clusters

### B. Report Sheet Refinement

- better numeric rhythm
- stronger row focus
- more elegant totals rail
- cleaner section transitions

### C. Analytics Storytelling

- calmer muted charts
- better highlighted insights
- stronger glance -> tap -> inspect rhythm

### D. Preview / Print Beauty

- tighter typographic rhythm
- more elegant summary/header/footer spacing
- more polished one-page output

### E. Theme Consistency

- keep reducing harsh whites and contrast spikes
- ensure light/dark surfaces stay coherent across every component

## Recommended Order

1. Final print/PDF fidelity pass
2. Final ranking verification in UI
3. Report-sheet speed polish follow-up
4. Scan review polish follow-up
5. Dense desktop beautification

## Principle To Preserve

Kradle should stay:

- student-sheet-first
- direct
- low-noise
- calm under long working sessions
- better than Excel for day-to-day report completion
