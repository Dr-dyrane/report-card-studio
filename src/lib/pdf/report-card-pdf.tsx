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
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 26,
    backgroundColor: "#f7f2ec",
    color: "#231d19",
    fontSize: 9.2,
    fontFamily: "Helvetica",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#7e695d",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  titleWrap: {
    flexGrow: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 0.98,
    fontFamily: "Times-Bold",
    color: "#231d19",
  },
  subtitle: {
    marginTop: 7,
    fontSize: 10,
    color: "#6f6259",
  },
  statusWrap: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#efe7df",
    minWidth: 84,
  },
  statusLabel: {
    fontSize: 7.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#8a776d",
  },
  statusValue: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: "capitalize",
    color: "#251f1b",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  leftCol: {
    flex: 1.08,
    gap: 8,
  },
  rightCol: {
    flex: 0.92,
    gap: 8,
  },
  summaryMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaCard: {
    width: "48.5%",
    borderRadius: 16,
    backgroundColor: "#f1e8e1",
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  metricCard: {
    borderRadius: 18,
    backgroundColor: "#f0e7e0",
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  metricCardPrimary: {
    backgroundColor: "#e5e7f5",
  },
  cardLabel: {
    fontSize: 8.1,
    color: "#857168",
  },
  cardValue: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "#211b17",
  },
  scoreValue: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: 700,
    color: "#211b17",
  },
  noteBand: {
    borderRadius: 16,
    backgroundColor: "#eee4db",
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 9,
    color: "#63574f",
    marginBottom: 12,
  },
  table: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fbf7f2",
    marginBottom: 14,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#efe6de",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  rowAlt: {
    backgroundColor: "#f5ede6",
  },
  subjectCol: {
    width: "31%",
    paddingRight: 4,
  },
  numCol: {
    width: "9.85%",
    textAlign: "right",
  },
  totalCol: {
    width: "9.9%",
    textAlign: "right",
    fontWeight: 700,
  },
  tableHeadText: {
    fontSize: 7.8,
    color: "#7a675c",
    fontWeight: 600,
  },
  tableText: {
    fontSize: 8.6,
    color: "#2a221e",
  },
  mutedTableText: {
    fontSize: 8.4,
    color: "#7a675c",
  },
  footerGrid: {
    flexDirection: "row",
    gap: 8,
  },
  footerCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#f1e8e1",
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  footerTitle: {
    fontSize: 7.5,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: "#827068",
  },
  footerText: {
    marginTop: 8,
    fontSize: 9.2,
    lineHeight: 1.5,
    color: "#302722",
  },
});

function PdfReportCard({ report }: { report: ReportCardData }) {
  const rows = report.previewRows;
  const hasEnteredScores = rows.some(
    (row) => row.a1Score !== null || row.a2Score !== null || row.examScore !== null,
  );

  return (
    <Document title={`${report.student.fullName} Report Card`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Report card</Text>

        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{report.classroom.name} Report Card</Text>
            <Text style={styles.subtitle}>
              {report.term.name} / {report.term.session.name}
            </Text>
          </View>
          <View style={styles.statusWrap}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>{report.status.toLowerCase()}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.leftCol}>
            <View style={styles.summaryMetaGrid}>
              {[
                ["Student", report.student.fullName],
                ["Class", report.classroom.name],
                ["Position", report.position ?? "--"],
                ["Grand total", `${report.grandTotal} / ${report.grandMax}`],
                ["Class size", String(report.classSize ?? "--")],
                ["Teacher", report.classroom.teacherName ?? "Class teacher"],
              ].map(([label, value]) => (
                <View key={label} style={styles.metaCard}>
                  <Text style={styles.cardLabel}>{label}</Text>
                  <Text style={styles.cardValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.rightCol}>
            {[
              ["1st Assessment", String(report.assessment1Total), false],
              ["2nd Assessment", String(report.assessment2Total), false],
              ["Exam", String(report.examTotal), false],
              ["Grand total", String(report.grandTotal), true],
            ].map(([label, value, primary]) => (
              <View
                key={String(label)}
                style={primary ? [styles.metricCard, styles.metricCardPrimary] : styles.metricCard}
              >
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.scoreValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteBand}>
          <Text>
            {hasEnteredScores
              ? "Saved totals and class position are reflected in this export."
              : "The full subject sheet is ready, but subject scores are still blank."}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadText, styles.subjectCol]}>Subject</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A1 Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A1</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A2 Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>A2</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>Exam Max</Text>
            <Text style={[styles.tableHeadText, styles.numCol]}>Exam</Text>
            <Text style={[styles.tableHeadText, styles.totalCol]}>Total</Text>
          </View>

          {rows.map((row, index) => (
            <View
              key={row.id}
              style={index % 2 === 0 ? [styles.tableRow, styles.rowAlt] : styles.tableRow}
            >
              <Text style={[styles.tableText, styles.subjectCol]}>{row.subject.name}</Text>
              <Text style={[styles.mutedTableText, styles.numCol]}>
                {row.subject.a1Max ?? "--"}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{row.a1Score ?? "--"}</Text>
              <Text style={[styles.mutedTableText, styles.numCol]}>
                {row.subject.a2Max ?? "--"}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{row.a2Score ?? "--"}</Text>
              <Text style={[styles.mutedTableText, styles.numCol]}>
                {row.subject.examMax ?? "--"}
              </Text>
              <Text style={[styles.tableText, styles.numCol]}>{row.examScore ?? "--"}</Text>
              <Text style={[styles.tableText, styles.totalCol]}>{row.totalScore}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerGrid}>
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Teacher comment</Text>
            <Text style={styles.footerText}>{report.teacherComment ?? "No comment yet."}</Text>
          </View>
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Head comment</Text>
            <Text style={styles.footerText}>{report.headTeacherComment ?? "No comment yet."}</Text>
          </View>
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Teacher</Text>
            <Text style={styles.footerText}>
              {report.classroom.teacherName ?? "Class teacher"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportCardPdf(report: ReportCardData) {
  return renderToBuffer(<PdfReportCard report={report} />);
}
