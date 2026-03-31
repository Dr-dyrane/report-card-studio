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

Not fully finished:

- full preview/export parity with the Excel-derived source cards
- final report-sheet speed polish
- final ranking trust and visibility across all surfaces
- final beautification pass for dense desktop workspaces

## Biggest Remaining Product Gaps

### 1. Full Report Parity

Still the most important gap.

Remaining work:

- support the full subject matrix from the original report cards
- carry all real assessment patterns cleanly
- ensure preview/export matches the Excel-derived structure across all students
- remove any reduced/demo assumptions from preview

Definition of done:

- every student report renders a complete matrix
- preview and print match stored row data
- export feels trustworthy enough to replace the spreadsheet print path

### 2. Report Sheet Speed

The sheet works, but it should feel faster and more fluid.

Remaining work:

- autosave/blur-save refinement
- stronger keyboard movement on desktop
- cleaner row focus and active-cell feel
- faster next/previous student movement
- better mobile stepping through score fields

Definition of done:

- a teacher can move through a class with minimal friction
- saving feels mostly automatic
- the sheet feels better than Excel, not just equivalent

### 3. Ranking Verification

Ranking logic is much better than before, but still needs a final visible trust pass.

Remaining work:

- verify recomputed positions on reports, students, analytics, and previews
- surface rank changes more clearly after edits
- confirm class-size scope is always correct

Definition of done:

- edits update position consistently
- every view tells the same story

### 4. Scan Review Polish

The scan path exists, but it still needs final product refinement.

Remaining work:

- make review of extracted vs edited values clearer
- refine confidence and warning presentation
- improve the handoff from scan to working sheet

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

1. Full preview/export parity
2. Report-sheet speed polish
3. Ranking verification in UI
4. Scan review polish
5. Dense desktop beautification
6. Final print/PDF polish

## Principle To Preserve

Kradle should stay:

- student-sheet-first
- direct
- low-noise
- calm under long working sessions
- better than Excel for day-to-day report completion
