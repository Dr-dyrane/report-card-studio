import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";

function cleanEnv(value?: string | null) {
  return value?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function extractFirstJsonObject(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No structured JSON found in model response.");
  }

  return JSON.parse(value.slice(start, end + 1));
}

function normalizeName(value?: string | null) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";
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
    studentName?: string;
    className?: string;
  };

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

  if (!body.imageDataUrl) {
    return NextResponse.json({ error: "Image is required." }, { status: 400 });
  }

  const ownedSchool = await requireOwnedSchool();
  const db = await getDb();

  const matchedClassroom = body.className?.trim()
    ? (
        await db.classroom.findMany({
          where: {
            schoolId: ownedSchool.id,
          },
          include: {
            classSubjects: {
              include: {
                subject: true,
              },
              orderBy: {
                displayOrder: "asc",
              },
            },
          },
        })
      ).find(
        (classroom) =>
          normalizeName(classroom.name) === normalizeName(body.className),
      ) ?? null
    : null;

  const subjectNames =
    matchedClassroom?.classSubjects
      .map((item) => item.subject.name.trim())
      .filter(Boolean) ?? [];

  const subjectListBlock = subjectNames.length
    ? `Known subjects for this class:
- ${subjectNames.join("\n- ")}`
    : "Known subjects for this class: unavailable";

  const prompt = `
Extract report-card data from this school result image.

Known context:
- Student: ${body.studentName || "Unknown"}
- Class: ${body.className || "Unknown"}
${subjectListBlock}

Rules:
- Return strict JSON only.
- Prefer the known class subjects above when naming rows.
- If the image shows a row that clearly maps to one of the known subjects, use that exact subject name.
- Keep every recognized known subject row you can find, even if some values are null.
- Use student score columns for earned scores.
- Preserve max attainable scores separately where visible.
- Total per subject = A1 score + A2 score + Exam score.
- If a subject has no assessments, total = Exam score only.
- If a value is unclear, leave it null and add a warning.

Return this shape:
{
  "studentName": string | null,
  "className": string | null,
  "summary": {
    "assessment1Total": number | null,
    "assessment2Total": number | null,
    "examTotal": number | null,
    "grandTotal": number | null,
    "grandMax": number | null
  },
  "scores": [
    {
      "subject": string,
      "a1Score": number | null,
      "a2Score": number | null,
      "examScore": number | null,
      "totalScore": number | null
    }
  ],
  "teacherComment": string | null,
  "position": string | null,
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
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You extract report-card rows carefully and return only strict JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: body.imageDataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || "Vision request failed." },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "Vision response was empty." },
      { status: 500 },
    );
  }

  try {
    const parsed = extractFirstJsonObject(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Could not parse structured report-card data." },
      { status: 500 },
    );
  }
}
