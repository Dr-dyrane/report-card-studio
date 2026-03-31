import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { getReportCardByRouteKey } from "@/lib/report-data";

type ReportCardData = NonNullable<Awaited<ReturnType<typeof getReportCardByRouteKey>>>;

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 18,
    backgroundColor: "#fcf7f1",
    color: "#231c18",
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2d6ca",
  },
  eyebrow: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#7a6657",
    marginBottom: 5,
    fontWeight: 700,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerMain: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    lineHeight: 1.02,
    fontFamily: "Times-Bold",
  },
  subline: {
    marginTop: 4,
    fontSize: 9,
    color: "#64564b",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#efe4d8",
    minWidth: 86,
  },
  statusLabel: {
    fontSize: 6.8,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#826d5d",
    marginBottom: 3,
  },
  statusValue: {
    fontSize: 9,
    fontWeight: 700,
  },
  summaryWrap: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  summaryMeta: {
    flex: 1,
    backgroundColor: "#fffaf5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  summaryHero: {
    marginBottom: 8,
  },
  summaryHeroLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#8a7768",
    marginBottom: 4,
  },
  summaryHeroValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#241d19",
  },
  summaryInlineValue: {
    marginTop: 2,
    fontSize: 8.4,
    color: "#5f5146",
  },
  summaryMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryMetaCard: {
    width: "48.5%",
    backgroundColor: "#f8f1e8",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  summaryMetaLabel: {
    fontSize: 6.8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#8a7768",
    marginBottom: 4,
  },
  summaryMetaValue: {
    fontSize: 8.4,
    fontWeight: 700,
    color: "#2f2620",
  },
  totalsGrid: {
    width: 176,
    gap: 4,
  },
  totalCard: {
    backgroundColor: "#f8f0e7",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
  },
  totalCardStrong: {
    backgroundColor: "#eadfcf",
  },
  totalLabel: {
    fontSize: 7.1,
    color: "#7a6657",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  totalValue: {
    marginTop: 3,
    fontSize: 12.2,
    fontWeight: 700,
  },
  noteBar: {
    backgroundColor: "#f6eee7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 7,
    borderRadius: 999,
  },
  noteText: {
    fontSize: 7.8,
    color: "#64564b",
  },
  tableWrap: {
    marginBottom: 8,
    backgroundColor: "#fffaf5",
    borderRadius: 18,
    overflow: "hidden",
  },
  tableHeadTop: {
    flexDirection: "row",
    backgroundColor: "#f3e9de",
    borderBottomWidth: 0.6,
    borderBottomColor: "#eadfd3",
  },
  spacerHead: {
    width: "26%",
    borderRightWidth: 0.6,
    borderRightColor: "#eadfd3",
  },
  groupHead: {
    width: "13%",
    borderRightWidth: 0.6,
    borderRightColor: "#eadfd3",
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  groupHeadSmall: {
    width: "9%",
    borderRightWidth: 0.6,
    borderRightColor: "#eadfd3",
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  groupHeadText: {
    fontSize: 6.8,
    textAlign: "center",
    color: "#5e5044",
    fontWeight: 700,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#fbf5ef",
    borderBottomWidth: 0.6,
    borderBottomColor: "#eadfd3",
  },
  subjectCol: {
    width: "26%",
    paddingHorizontal: 5,
    paddingVertical: 3.2,
    borderRightWidth: 0.5,
    borderRightColor: "#f0e6dc",
  },
  numCol: {
    width: "6.5%",
    paddingHorizontal: 2,
    paddingVertical: 3.2,
    borderRightWidth: 0.5,
    borderRightColor: "#f0e6dc",
    textAlign: "center",
  },
  totalCol: {
    width: "8%",
    paddingHorizontal: 2,
    paddingVertical: 3.2,
    borderRightWidth: 0.5,
    borderRightColor: "#f0e6dc",
    textAlign: "center",
    fontWeight: 700,
  },
  remarkCol: {
    width: "14%",
    paddingHorizontal: 3,
    paddingVertical: 3.2,
    textAlign: "center",
  },
  tableHeadText: {
    fontSize: 6.9,
    color: "#6a5c51",
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1e6db",
    minHeight: 14,
  },
  tableRowAlt: {
    backgroundColor: "#fefbf8",
  },
  tableText: {
    fontSize: 6.8,
  },
  tableTextMuted: {
    fontSize: 6.7,
    color: "#7b6c5f",
  },
  footerGrid: {
    flexDirection: "row",
    gap: 8,
  },
  footerCard: {
    flex: 1,
    backgroundColor: "#fffaf5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 62,
    borderRadius: 18,
  },
  footerTitle: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7a6657",
    marginBottom: 6,
    fontWeight: 700,
  },
  footerText: {
    fontSize: 8,
    lineHeight: 1.45,
    color: "#2d241e",
  },
  footerMuted: {
    color: "#86776b",
  },
  signatureTitle: {
    marginTop: 12,
    marginBottom: 5,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7a6657",
    fontWeight: 700,
  },
  signatureLine: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#d7c8b8",
    minHeight: 14,
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  signatureText: {
    fontSize: 8,
    color: "#2d241e",
  },
});

function formatStatus(status: string) {
  if (status === "LOCKED") return "Archived";
  return `${status.slice(0, 1)}${status.slice(1).toLowerCase()}`;
}

function scoreDisplay(value: number | null | undefined) {
  return value === null || value === undefined ? "--" : String(value);
}

function getRemark(row: ReportCardData["previewRows"][number]) {
  const max = (row.subject.a1Max ?? 0) + (row.subject.a2Max ?? 0) + (row.subject.examMax ?? 0);
  if (!max || !row.totalScore) return "";
  const percentage = (row.totalScore / max) * 100;
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Very Good";
  if (percentage >= 55) return "Good";
  if (percentage >= 40) return "Fair";
  return "Needs work";
}

function PdfReportCard({ report }: { report: ReportCardData }) {
  const rows = report.previewRows;
  const teacherComment = report.teacherComment?.trim() || "";
  const headTeacherComment = report.headTeacherComment?.trim() || "";
  const teacherName = report.classroom.teacherName?.trim() || "";

  return (
    <Document title={`${report.student.fullName} Report Card`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Report card</Text>
          <View style={styles.headerRow}>
            <View style={styles.headerMain}>
              <Text style={styles.title}>{report.classroom.name} Report Card</Text>
              <Text style={styles.subline}>
                {report.term.name} / {report.term.session.name}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{formatStatus(report.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryWrap}>
          <View style={styles.summaryMeta}>
            <View style={styles.summaryHero}>
              <Text style={styles.summaryHeroLabel}>Student</Text>
              <Text style={styles.summaryHeroValue}>{report.student.fullName}</Text>
              <Text style={styles.summaryInlineValue}>{report.classroom.name}</Text>
            </View>

            <View style={styles.summaryMetaGrid}>
              {[
                ["Teacher", teacherName || "Class teacher"],
                ["Position", report.position ?? "--"],
                ["Class size", String(report.classSize ?? "--")],
                ["Class", report.classroom.name],
              ].map(([label, value]) => (
                <View key={label} style={styles.summaryMetaCard}>
                  <Text style={styles.summaryMetaLabel}>{label}</Text>
                  <Text style={styles.summaryMetaValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.totalsGrid}>
            {[
              ["1st Assessment", String(report.assessment1Total), false],
              ["2nd Assessment", String(report.assessment2Total), false],
              ["Exam", String(report.examTotal), false],
              ["Grand Total", `${report.grandTotal} / ${report.grandMax}`, true],
            ].map(([label, value, strong]) => (
              <View
                key={String(label)}
                style={[styles.totalCard, strong ? styles.totalCardStrong : {}]}
              >
                <Text style={styles.totalLabel}>{label}</Text>
                <Text style={styles.totalValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteBar}>
          <Text style={styles.noteText}>
            Saved totals and class position are reflected in this export.
          </Text>
        </View>

        <View style={styles.tableWrap}>
          <View style={styles.tableHeadTop}>
            <View style={styles.spacerHead} />
            <View style={styles.groupHead}>
              <Text style={styles.groupHeadText}>1st Assessment</Text>
            </View>
            <View style={styles.groupHeadSmall}>
              <Text style={styles.groupHeadText}>Score</Text>
            </View>
            <View style={styles.groupHead}>
              <Text style={styles.groupHeadText}>2nd Assessment</Text>
            </View>
            <View style={styles.groupHeadSmall}>
              <Text style={styles.groupHeadText}>Score</Text>
            </View>
            <View style={styles.groupHead}>
              <Text style={styles.groupHeadText}>Exam</Text>
            </View>
            <View style={styles.groupHeadSmall}>
              <Text style={styles.groupHeadText}>Score</Text>
            </View>
            <View style={styles.groupHeadSmall}>
              <Text style={styles.groupHeadText}>Grand Total</Text>
            </View>
            <View style={[styles.groupHeadSmall, { borderRightWidth: 0, width: "14%" }]}>
              <Text style={styles.groupHeadText}>Remark</Text>
            </View>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, styles.subjectCol]}>Subject</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A1 Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A1</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A2 Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A2</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>Exam Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>Exam</Text>
            <Text style={[styles.tableHeadText, styles.totalCol]}>Total</Text>
            <Text style={[styles.tableHeadText, styles.remarkCol]}>Remark</Text>
          </View>

          {rows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableText, styles.subjectCol]}>{row.subject.name}</Text>
              <Text style={[styles.tableTextMuted, styles.numCol]}>
                {scoreDisplay(row.subject.a1Max)}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{scoreDisplay(row.a1Score)}</Text>
              <Text style={[styles.tableTextMuted, styles.numCol]}>
                {scoreDisplay(row.subject.a2Max)}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{scoreDisplay(row.a2Score)}</Text>
              <Text style={[styles.tableTextMuted, styles.numCol]}>
                {scoreDisplay(row.subject.examMax)}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{scoreDisplay(row.examScore)}</Text>
              <Text style={[styles.tableText, styles.totalCol]}>{scoreDisplay(row.totalScore)}</Text>
              <Text style={[styles.tableTextMuted, styles.remarkCol]}>{getRemark(row)}</Text>
            </View>
          ))}
        </View>

        {teacherComment || headTeacherComment || teacherName ? (
          <View style={styles.footerGrid}>
            {teacherComment ? (
              <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>Teacher comment</Text>
                <Text style={styles.footerText}>{teacherComment}</Text>
              </View>
            ) : null}

            {headTeacherComment ? (
              <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>Head comment</Text>
                <Text style={styles.footerText}>{headTeacherComment}</Text>
              </View>
            ) : null}

            {teacherName ? (
              <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>Teacher</Text>
                <Text style={styles.footerText}>{teacherName}</Text>
                <Text style={styles.signatureTitle}>Signature</Text>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureText}>{teacherName}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Report notes</Text>
            <Text style={[styles.footerText, styles.footerMuted]}>
              This export reflects the saved report totals, class size, and current ranking.
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderReportCardPdf(report: ReportCardData) {
  return renderToBuffer(<PdfReportCard report={report} />);
}
