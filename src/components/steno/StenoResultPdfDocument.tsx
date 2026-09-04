import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

// Register Mukta font for Devanagari Hindi PDF rendering
try {
  const regularPath = path.join(process.cwd(), "public", "fonts", "Mukta-Regular.ttf");
  const boldPath = path.join(process.cwd(), "public", "fonts", "Mukta-Bold.ttf");

  if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
    Font.register({
      family: "MuktaHindi",
      fonts: [
        { src: regularPath, fontWeight: "normal" },
        { src: boldPath, fontWeight: "bold" },
      ],
    });
  }
} catch (e) {
  console.warn("Local PDF font registration note:", e);
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: "#ffffff",
    fontFamily: "MuktaHindi",
    fontSize: 9,
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
    paddingBottom: 8,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  brandSub: {
    fontSize: 7.5,
    color: "#4f46e5",
    textTransform: "uppercase",
    marginTop: 1,
  },
  reportTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  metaCol: {
    width: "50%",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
  },
  metaVal: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 1,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    width: "18%",
    backgroundColor: "#f1f5f9",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  cardValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  cardLabel: {
    fontSize: 6.5,
    color: "#475569",
    marginTop: 2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#faf5ff",
    padding: 8,
    borderRadius: 6,
    borderColor: "#f3e8ff",
    borderWidth: 1,
    marginBottom: 12,
  },
  breakdownItem: {
    alignItems: "center",
    width: "19%",
  },
  tokensBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tokenTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 3,
    marginBottom: 3,
    borderRadius: 3,
    fontSize: 7.5,
  },
  table: {
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 5,
    fontWeight: "bold",
    fontSize: 7.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 4,
    fontSize: 7.5,
  },
  colNum: { width: "6%" },
  colType: { width: "22%" },
  colTyped: { width: "22%" },
  colOrig: { width: "22%" },
  colCat: { width: "14%" },
  colWeight: { width: "7%", textAlign: "center" },
  colPen: { width: "7%", textAlign: "right" },
  transcriptBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 10,
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
    fontSize: 6.5,
    color: "#94a3b8",
  },
});

export interface StenoPdfProps {
  result: any;
}

export const StenoResultPdfDocument = ({ result }: StenoPdfProps) => {
  const dateStr = result.createdAt ? new Date(result.createdAt).toLocaleString() : new Date().toLocaleString();
  const minutes = Math.floor((result.timeSpentSeconds || 0) / 60);
  const seconds = (result.timeSpentSeconds || 0) % 60;
  const timeTakenStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const errorLog: any[] = result.errorLog || [];
  const breakdown = result.mistakeBreakdown || { spelling: 0, missing: 0, added: 0, matra: 0, punctuation: 0 };
  const weights = result.frozenWeights || {
    spellingWeight: "full",
    matraWeight: "half",
    punctuationWeight: "half",
    addedWordWeight: "full",
    missingWordWeight: "full",
  };
  const wordTokens: any[] = result.wordBreakdown || [];

  // Limit error log table in PDF to top 35 items so PDF report is maximum 2-3 pages
  const displayErrorLog = errorLog.slice(0, 35);
  const hasMoreErrors = errorLog.length > 35;

  // Word token preview (up to 80 words)
  const previewTokens = wordTokens.slice(0, 80);

  return (
    <Document title={`NGIT_Steno_Result_${result.passageTitle || "Test"}`}>
      {/* PAGE 1: Summary, Performance & Word Evaluation */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>NGIT Institute</Text>
            <Text style={styles.brandSub}>Official Steno Result Report</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>STENO TEST RESULT</Text>
            <Text style={{ fontSize: 7.5, color: "#64748b", marginTop: 2 }}>Date: {dateStr}</Text>
          </View>
        </View>

        {/* Candidate & Test Metadata */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Candidate Name</Text>
            <Text style={styles.metaVal}>{result.userId?.name || "Student Candidate"}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Candidate Email</Text>
            <Text style={styles.metaVal}>{result.userId?.email || "N/A"}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Dictation Passage</Text>
            <Text style={styles.metaVal}>{result.passageTitle || "Steno Dictation Test"}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Exam Preset / Language</Text>
            <Text style={styles.metaVal}>{result.examTitle || "Standard"} ({result.language || "Hindi"})</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Font Layout / Target Speed</Text>
            <Text style={styles.metaVal}>{result.fontUsed || "Mangal"} | {result.targetWpm || 80} WPM Target</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Time Taken / Words Typed</Text>
            <Text style={styles.metaVal}>{timeTakenStr} | {result.typedWordCount || 0} / {result.originalWordCount || 0} Words</Text>
          </View>
        </View>

        {/* Performance Summary Cards */}
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{result.accuracy || 0}%</Text>
            <Text style={styles.cardLabel}>Accuracy</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{result.grossWpm || 0}</Text>
            <Text style={styles.cardLabel}>Gross WPM</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{result.netWpm || 0}</Text>
            <Text style={styles.cardLabel}>Net WPM</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{result.totalMistakes || 0}</Text>
            <Text style={styles.cardLabel}>Mistakes</Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.cardValue, { color: result.status === "Passed" ? "#059669" : "#dc2626" }]}>
              {result.status === "Passed" ? "QUALIFIED" : "DISQUALIFIED"}
            </Text>
            <Text style={styles.cardLabel}>Status</Text>
          </View>
        </View>

        {/* Mistake Breakdown */}
        <Text style={styles.sectionTitle}>Mistake Category Breakdown</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#e11d48" }}>{breakdown.spelling}</Text>
            <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 1 }}>Spelling ({weights.spellingWeight})</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#d97706" }}>{breakdown.missing}</Text>
            <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 1 }}>Missing ({weights.missingWordWeight})</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#2563eb" }}>{breakdown.added}</Text>
            <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 1 }}>Added ({weights.addedWordWeight})</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#7c3aed" }}>{breakdown.matra}</Text>
            <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 1 }}>Matra ({weights.matraWeight})</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#059669" }}>{breakdown.punctuation}</Text>
            <Text style={{ fontSize: 6.5, color: "#64748b", marginTop: 1 }}>Punctuation ({weights.punctuationWeight})</Text>
          </View>
        </View>

        {/* Word-by-Word Evaluation Tokens Summary */}
        {previewTokens.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Word-by-Word Transcription Alignment (Preview)</Text>
            <View style={styles.tokensBox}>
              {previewTokens.map((token: any, idx: number) => {
                let bgColor = "#ecfdf5";
                let textColor = "#065f46";
                if (token.type === "spelling") { bgColor = "#ffe4e6"; textColor = "#9f1239"; }
                if (token.type === "missing") { bgColor = "#fef3c7"; textColor = "#92400e"; }
                if (token.type === "added") { bgColor = "#dbeafe"; textColor = "#1e40af"; }
                if (token.type === "matra") { bgColor = "#f3e8ff"; textColor = "#6b21a8"; }
                if (token.type === "punctuation") { bgColor = "#ccfbf1"; textColor = "#115e59"; }

                const wordText = token.typed && token.typed !== "—" ? token.typed : token.original;
                return (
                  <Text key={idx} style={[styles.tokenTag, { backgroundColor: bgColor, color: textColor }]}>
                    {wordText}
                  </Text>
                );
              })}
            </View>
          </View>
        )}

        <Footer dateStr={dateStr} />
      </Page>

      {/* PAGE 2: Detailed Mistake Log */}
      {displayErrorLog.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.brandName}>NGIT Steno</Text>
            <Text style={styles.reportTitle}>DETAILED MISTAKE LOG ({errorLog.length} Errors)</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colNum}>#</Text>
              <Text style={styles.colType}>Error Type</Text>
              <Text style={styles.colTyped}>Student Typed</Text>
              <Text style={styles.colOrig}>Original Dictation</Text>
              <Text style={styles.colCat}>Category</Text>
              <Text style={styles.colWeight}>Weight</Text>
              <Text style={styles.colPen}>Penalty</Text>
            </View>

            {displayErrorLog.map((err: any, idx: number) => (
              <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }]}>
                <Text style={styles.colNum}>{err.index || idx + 1}</Text>
                <Text style={styles.colType}>{err.errorType}</Text>
                <Text style={styles.colTyped}>{err.typedWord || "—"}</Text>
                <Text style={styles.colOrig}>{err.originalWord || "—"}</Text>
                <Text style={styles.colCat}>{err.category}</Text>
                <Text style={styles.colWeight}>{err.weight}</Text>
                <Text style={styles.colPen}>{err.penalty}</Text>
              </View>
            ))}
          </View>

          {hasMoreErrors && (
            <Text style={{ fontSize: 7, color: "#64748b", fontStyle: "italic", marginTop: 4 }}>
              * Showing top 35 of {errorLog.length} mistakes recorded. Full itemized mistake log available online on NGIT Steno Portal.
            </Text>
          )}

          <Footer dateStr={dateStr} />
        </Page>
      )}

      {/* PAGE 3: Transcripts */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>NGIT Steno</Text>
          <Text style={styles.reportTitle}>ORIGINAL & SUBMITTED TRANSCRIPTS</Text>
        </View>

        <Text style={styles.sectionTitle}>Original Dictation Transcript</Text>
        <View style={styles.transcriptBox}>
          <Text>{result.originalText || result.passageId?.transcriptText || result.passageId?.text || "Original text unavailable."}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Typed Student Transcript</Text>
        <View style={styles.transcriptBox}>
          <Text>{result.typedTranscription || "Typed text unavailable."}</Text>
        </View>

        <Footer dateStr={dateStr} />
      </Page>
    </Document>
  );
};

const Footer = ({ dateStr }: { dateStr: string }) => (
  <View style={styles.footer} fixed>
    <Text>NGIT Educational Portal — Confidential Test Report</Text>
    <Text>Generated: {dateStr}</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);
