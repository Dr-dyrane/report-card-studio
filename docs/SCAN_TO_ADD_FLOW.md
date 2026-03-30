# Kradle Scan-To-Add Flow

## Goal

Use the same Apple-style student-sheet flow, but let a teacher begin a report in two ways:

1. `Manual`
2. `Scan to add`

`Scan to add` should use AI vision to read a report-card image, prefill the editable report sheet, and let the teacher correct anything before saving.

This should feel faster than the old Excel workflow while preserving the same trust model:

- AI suggests
- teacher checks
- teacher edits
- teacher saves

## Source Pattern

The `drdyrane` repo already has the pattern we want to adapt:

- a visual lens capture/upload flow
- a client `visionEngine` that sends:
  - `imageDataUrl`
  - `clinicalContext`
  - `lensPrompt`
- a backend vision endpoint
- structured JSON returned to the app
- a review surface where the user continues from AI output instead of starting from zero

For Kradle, the same architecture should be simplified into document extraction rather than clinical analysis.

## Product Flow

### A. Start New Report

From class, student, or reports view:

1. tap `New`
2. choose:
   - `Manual`
   - `Scan`

### B. Manual Path

1. choose class and student
2. open empty report sheet
3. enter scores directly
4. totals update live
5. preview and save

### C. Scan Path

1. choose class and student, or let scan propose student identity
2. open a bottom sheet:
   - `Take photo`
   - `Upload image`
3. send the image to a Kradle vision endpoint
4. receive structured extracted data
5. prefill the report sheet
6. show low-confidence or unreadable fields inline
7. let the teacher edit anything
8. save only after teacher review

## UI Direction

Keep this aligned with the rest of Kradle:

- use a bottom sheet for scan entry
- do not create a separate “AI dashboard”
- land in the same report sheet after scan
- use quiet status language:
  - `Scanned`
  - `Needs check`
  - `Low confidence`
  - `Saved`

The editable report sheet remains the main workspace.

## Recommended Screen Sequence

### 1. New Report Sheet

Surface:

- title: `New report`
- segmented choice:
  - `Manual`
  - `Scan`

If `Scan` is selected:

- open camera/upload bottom sheet

### 2. Scan Review State

After AI returns:

- show student identity block
- show term summary totals
- show subject matrix prefilled
- highlight uncertain cells
- show source image thumbnail or reopen action

Primary actions:

- `Use sheet`
- `Retake`

Secondary:

- `Cancel`

### 3. Final Working Sheet

This is the same report-entry screen already in the app, now prefilled.

Needed additions:

- scan status pill
- optional confidence badge per row or field
- source image reopen action

## Data Contract To Extract

The AI output should be strict JSON shaped for the Kradle report sheet.

Suggested contract:

```json
{
  "student": {
    "fullName": "Student 4",
    "className": "Primary 5 Lavender",
    "termName": "Second Term",
    "sessionName": "2024/2025",
    "position": "13th",
    "classSize": 30
  },
  "summary": {
    "assessment1Total": 109,
    "assessment2Total": 120,
    "examTotal": 492,
    "grandTotal": 721,
    "grandMax": 1000
  },
  "scores": [
    {
      "subject": "Mathematics",
      "a1Max": 20,
      "a1Score": 14,
      "a2Max": 20,
      "a2Score": 10,
      "examMax": 60,
      "examScore": 32,
      "totalScore": 56,
      "confidence": 0.96,
      "needsReview": false
    }
  ],
  "teacherComment": "She is eager to learn",
  "headTeacherComment": "",
  "warnings": [
    "Fine Art exam score is unclear."
  ]
}
```

## Prompt Shape

The `drdyrane` flow uses:

- a system prompt
- a `lensPrompt`
- strict JSON output

For Kradle, the lens prompt should be adapted into a report-card extraction prompt:

```text
Extract report-card data from this school result image.

Rules:
- Read only visible values.
- Use student score columns, not max columns, for actual earned scores.
- Total per subject = A1 score + A2 score + Exam score.
- If a subject has no assessments, total = Exam score only.
- Preserve max attainable scores separately from student scores.
- Return strict JSON only.
- Mark unclear or unreadable fields in warnings and set needsReview=true.
```

Optional contextual prompt pieces:

- known class
- known term
- known student name if chosen before scan

## Environment Variables To Bring Over

The `drdyrane` repo uses a lightweight vision env shape. Kradle should start with the same pattern.

Minimum:

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_VISION_MODEL="gpt-4o-mini"
LLM_VISION_PROVIDER="openai"
VISION_ENRICHMENT="true"
```

Optional fallback:

```env
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-3-5-haiku-20241022"
```

## Implementation Plan

### Phase 1

- add env variables
- add `/api/vision/report-card`
- upload one image
- return strict extracted JSON
- prefill report sheet

### Phase 2

- capture from camera on mobile
- confidence markers
- reopen source image while editing

### Phase 3

- batch queue for multiple images
- student matching suggestions
- scan history / retry support

## Why This Matters

This closes the loop between the original WhatsApp-image workflow and the new app:

- before: image -> ChatGPT reasoning -> Excel entry -> formulas
- after: image -> AI extraction -> Kradle sheet -> review -> save -> preview -> print

That is the strongest product move after the core report sheet itself.
