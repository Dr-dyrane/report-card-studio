import { getDb } from "@/lib/db";
import { requireOwnedSchool } from "@/lib/owned-school";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function cleanFilePart(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export type ClassExportDataset = {
  classroomId: string;
  classroomName: string;
  sessionName: string;
  termName: string;
  filenameBase: string;
  headers: string[];
  rows: Array<Record<string, string | number>>;
};

export async function getClassExportDataset(classId: string): Promise<ClassExportDataset | null> {
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) return null;

  const activeTerm =
    (await db.term.findFirst({
      where: {
        isActive: true,
        session: { schoolId: school.id },
      },
      include: {
        session: true,
      },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    })) ??
    (await db.term.findFirst({
      where: {
        session: { schoolId: school.id },
      },
      include: {
        session: true,
      },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    }));

  if (!activeTerm) return null;

  const classroom = await db.classroom.findFirst({
    where: {
      id: classId,
      schoolId: school.id,
    },
    include: {
      classSubjects: {
        include: {
          subject: true,
        },
        orderBy: [{ displayOrder: "asc" }],
      },
      reportCards: {
        where: {
          termId: activeTerm.id,
          status: {
            not: "LOCKED",
          },
        },
        include: {
          student: true,
          scores: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: [{ grandTotal: "desc" }, { updatedAt: "asc" }],
      },
    },
  });

  if (!classroom) return null;

  const subjectColumns = classroom.classSubjects.map(({ subject }) => subject);
  const headers = [
    "Student",
    "Status",
    "Position",
    "A1 Total",
    "A2 Total",
    "Exam Total",
    "Grand Total",
    ...subjectColumns.flatMap((subject) => [
      `${subject.name} A1`,
      `${subject.name} A2`,
      `${subject.name} Exam`,
      `${subject.name} Total`,
    ]),
  ];

  const rows = classroom.reportCards.map((report) => {
    const subjectScoreMap = new Map(
      report.scores.map((score) => [score.subjectId, score]),
    );

    const baseRow: Record<string, string | number> = {
      Student: report.student.fullName,
      Status: report.status,
      Position: report.position ?? "--",
      "A1 Total": report.assessment1Total,
      "A2 Total": report.assessment2Total,
      "Exam Total": report.examTotal,
      "Grand Total": report.grandTotal,
    };

    for (const subject of subjectColumns) {
      const score = subjectScoreMap.get(subject.id);
      baseRow[`${subject.name} A1`] = score?.a1Score ?? "";
      baseRow[`${subject.name} A2`] = score?.a2Score ?? "";
      baseRow[`${subject.name} Exam`] = score?.examScore ?? "";
      baseRow[`${subject.name} Total`] = score?.totalScore ?? 0;
    }

    return baseRow;
  });

  return {
    classroomId: classroom.id,
    classroomName: classroom.name,
    sessionName: activeTerm.session.name,
    termName: activeTerm.name,
    filenameBase: cleanFilePart(`${classroom.name}-${activeTerm.name}-${activeTerm.session.name}`),
    headers,
    rows,
  };
}

export async function getExportsCenterData() {
  const school = await requireOwnedSchool();
  const db = await getDb();

  if (!db) {
    return {
      schoolName: school.name,
      classes: [],
      studentPdfs: [],
    };
  }

  const activeTerm =
    (await db.term.findFirst({
      where: {
        isActive: true,
        session: { schoolId: school.id },
      },
      include: {
        session: true,
      },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    })) ??
    (await db.term.findFirst({
      where: {
        session: { schoolId: school.id },
      },
      include: {
        session: true,
      },
      orderBy: [{ sequence: "desc" }, { updatedAt: "desc" }],
    }));

  const classrooms = await db.classroom.findMany({
    where: {
      schoolId: school.id,
    },
    include: {
      reportCards: activeTerm
        ? {
            where: {
              termId: activeTerm.id,
              status: {
                not: "LOCKED",
              },
            },
            select: { id: true },
          }
        : false,
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  const recentReportCards = activeTerm
    ? await db.reportCard.findMany({
        where: {
          termId: activeTerm.id,
          status: "PUBLISHED",
          classroom: { schoolId: school.id },
        },
        include: {
          student: true,
          classroom: true,
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 8,
      })
    : [];

  return {
    schoolName: school.name,
    activeTermName: activeTerm?.name ?? "",
    activeSessionName: activeTerm?.session.name ?? "",
    classes: classrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      readyReports: classroom.reportCards.length,
      csvHref: `/api/exports/class/${classroom.id}/csv`,
      excelHref: `/api/exports/class/${classroom.id}/excel`,
    })),
    studentPdfs: recentReportCards.map((report) => ({
      id: report.id,
      studentName: report.student.fullName,
      classroomName: report.classroom.name,
      href: `/api/exports/report/${slugify(report.student.fullName)}/pdf`,
    })),
  };
}

export function datasetToCsv(dataset: ClassExportDataset) {
  const escape = (value: string | number) => {
    const stringValue = String(value ?? "");
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, "\"\"")}"`;
    }
    return stringValue;
  };

  const lines = [
    dataset.headers.map(escape).join(","),
    ...dataset.rows.map((row) =>
      dataset.headers.map((header) => escape(row[header] ?? "")).join(","),
    ),
  ];

  return lines.join("\n");
}

export function datasetToSpreadsheetXml(dataset: ClassExportDataset) {
  const escapeXml = (value: string | number) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const rows = [
    dataset.headers,
    ...dataset.rows.map((row) => dataset.headers.map((header) => row[header] ?? "")),
  ];

  const xmlRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
          .join("")}</Row>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${escapeXml(dataset.classroomName)}">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`;
}
