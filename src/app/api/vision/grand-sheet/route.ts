import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  GRAND_SHEET_SUBJECTS,
  normalizeGrandSheetName,
  type GrandSheetRowInput,
} from "@/lib/grand-sheet";

function cleanEnv(value?: string | null) {
  return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function extractFirstJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No structured JSON found in model response.");
  }

  return JSON.parse(value.slice(start, end + 1)) as {
    className?: unknown;
    academicSessionName?: unknown;
    termName?: unknown;
    rows?: unknown;
    warnings?: unknown;
  };
}

function textValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function scoreValue(value: unknown, max: number) {
  const text = textValue(value);
  if (!text) return "";
  const numeric = Number(text);
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= max ? text : "";
}

function normalizeRows(value: unknown): GrandSheetRowInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object"))
    .map((row, index) => {
      const rawScores =
        row.scores && typeof row.scores === "object"
          ? (row.scores as Record<string, unknown>)
          : {};
      const normalizedScores = new Map(
        Object.entries(rawScores).map(([key, score]) => [
          normalizeGrandSheetName(key),
          score,
        ]),
      );

      return {
        id: `scan-${Date.now()}-${index}`,
        name: textValue(row.name),
        admissionNumber: textValue(row.admissionNumber),
        scores: Object.fromEntries(
          GRAND_SHEET_SUBJECTS.map((subject) => [
            subject.key,
            scoreValue(
              rawScores[subject.key] ??
                normalizedScores.get(normalizeGrandSheetName(subject.label)) ??
                normalizedScores.get(normalizeGrandSheetName(subject.shortLabel)),
              subject.max,
            ),
          ]),
        ),
        firstTest: scoreValue(row.firstTest, 130),
        secondTest: scoreValue(row.secondTest, 130),
      };
    })
    .filter(
      (row) =>
        row.name ||
        row.admissionNumber ||
        row.firstTest ||
        row.secondTest ||
        Object.values(row.scores).some(Boolean),
    );
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    imageDataUrl?: string;
  };
  const imageDataUrl = body.imageDataUrl?.trim() ?? "";

  if (!imageDataUrl) {
    return NextResponse.json({ error: "Grand-sheet image is required." }, { status: 400 });
  }

  if (imageDataUrl.length > 20_000_000) {
    return NextResponse.json(
      { error: "That image is too large. Use a clear image under 15 MB." },
      { status: 413 },
    );
  }

  const apiKey = cleanEnv(process.env.OPENAI_API_KEY);
  const model =
    cleanEnv(process.env.OPENAI_VISION_MODEL) ||
    cleanEnv(process.env.OPENAI_MODEL) ||
    "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing for scan intake." },
      { status: 500 },
    );
  }

  const subjectShape = GRAND_SHEET_SUBJECTS.map(
    (subject) => `"${subject.key}": number | null // ${subject.label}, maximum ${subject.max}`,
  ).join(",\n        ");
  const prompt = `
Read the photographed school grand sheet carefully. Extract every pupil row that is visible.

Rules:
- Return strict JSON only.
- Never guess an unreadable mark. Use null and add a warning with the pupil and column.
- Preserve pupil names and admission numbers exactly as written.
- The subject columns are examination marks. First Test and Second Test are aggregate totals, each out of 130.
- Match the columns to the fixed keys below even when a heading is abbreviated.
- Do not calculate or return totals, percentage, position, or remarks; the app calculates them.

Return:
{
  "className": string | null,
  "academicSessionName": string | null,
  "termName": string | null,
  "rows": [
    {
      "name": string | null,
      "admissionNumber": string | number | null,
      "scores": {
        ${subjectShape}
      },
      "firstTest": number | null,
      "secondTest": number | null
    }
  ],
  "warnings": string[]
}
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 12000,
      messages: [
        {
          role: "system",
          content:
            "You transcribe school grand sheets with high precision and return strict JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || "Grand-sheet scan failed." },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json({ error: "The scan returned no data." }, { status: 500 });
  }

  try {
    const parsed = extractFirstJsonObject(content);
    const rows = normalizeRows(parsed.rows);

    if (!rows.length) {
      return NextResponse.json(
        { error: "No pupil rows were found. Try a clearer, straighter image." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      className: textValue(parsed.className) || null,
      academicSessionName: textValue(parsed.academicSessionName) || null,
      termName: textValue(parsed.termName) || null,
      rows,
      warnings: Array.isArray(parsed.warnings)
        ? parsed.warnings.map(textValue).filter(Boolean)
        : [],
    });
  } catch {
    return NextResponse.json(
      { error: "Could not read structured grand-sheet data." },
      { status: 500 },
    );
  }
}
