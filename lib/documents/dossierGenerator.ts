import type { ReconciliationResult } from "@/lib/schemas";
import type { Language } from "@/lib/i18n";
import { buildDossierData } from "./dossierModel";
import { PDFColors, PDFDocumentBuilder } from "./pdfEngine";

/**
 * GENERATE PROFESSIONAL EVIDENCE & GRIEVANCE SUPPORT DOSSIER (PDF)
 * Pure deterministic document construction from structured reconciliation result.
 */
export function generateDossierPDF(
  result: ReconciliationResult,
  lang: Language = "en"
): Buffer {
  const data = buildDossierData(result, lang);
  const doc = new PDFDocumentBuilder();

  // 1. Title Banner & Metadata
  doc.setFillColor(PDFColors.primary);
  doc.addText(data.title.toUpperCase(), doc.marginLeft, doc.pageHeight - 58, 14, "F2", PDFColors.primary);
  doc.addText(data.subtitle, doc.marginLeft, doc.pageHeight - 72, 9, "F3", PDFColors.darkGray);
  doc.addText(`Generated: ${data.generatedDate} · Independent Evidence Aid`, doc.marginLeft, doc.pageHeight - 84, 8, "F1", PDFColors.darkGray);

  // Line below banner
  doc.drawLine(doc.marginLeft, doc.pageHeight - 92, doc.pageWidth - doc.marginRight, doc.pageHeight - 92, 1);

  // 2. Case Summary Grid
  doc.addSectionHeading("1. Case Summary & Identifiers");
  const summaryRows: string[][] = [];
  for (let i = 0; i < data.caseSummary.length; i += 2) {
    const item1 = data.caseSummary[i];
    const item2 = data.caseSummary[i + 1];
    summaryRows.push([
      item1 ? `${item1.label}: ${item1.value}` : "",
      item2 ? `${item2.label}: ${item2.value}` : ""
    ]);
  }
  doc.addTable(["Summary Attribute", "Summary Attribute"], [255, 260], summaryRows);

  // 3. Claim Contexts (Package 4)
  if (data.contexts.length > 1) {
    doc.addSectionHeading("2. Claim & Form Partitioning Contexts");
    const ctxHeaders = ["Context ID", "Claim Reference", "Form Type", "Resolution Status", "Evidence Records"];
    const ctxWidths = [65, 120, 100, 110, 120];
    const ctxRows = data.contexts.map(c => [
      c.contextId,
      c.claimReference || "Unreferenced",
      c.formType,
      c.resolutionStatus,
      `${c.evidenceCount} record(s)`
    ]);
    doc.addTable(ctxHeaders, ctxWidths, ctxRows);
  }

  // 4. Claim Status Assessment
  doc.addSectionHeading("3. Reconciliation Assessment");
  const outcomeType =
    data.reconciliationOutcome.state === "CREDITED" || data.reconciliationOutcome.state === "SETTLED"
      ? "success"
      : data.reconciliationOutcome.state === "REJECTED" || data.reconciliationOutcome.state === "UNKNOWN"
      ? "warning"
      : "info";

  doc.addCalloutBox(
    `EVALUATED STATE: ${data.reconciliationOutcome.state} (${data.reconciliationOutcome.confidence} CONFIDENCE)`,
    `${data.reconciliationOutcome.reason}\n\nWinning Rationale: ${data.reconciliationOutcome.winningRationale}`,
    outcomeType
  );

  // 5. Rejection & Diagnostic Information (if present)
  if (data.diagnostic) {
    doc.addSectionHeading("4. Rejection Diagnostic & Intelligence");
    doc.addCalloutBox(
      `DIAGNOSTIC: ${data.diagnostic.categoryTitle} (${data.diagnostic.certainty} CERTAINTY)`,
      `Observed Record: "${data.diagnostic.rawText}"\n\nInterpretation: ${data.diagnostic.interpretation}\n\nRecommended Action: ${data.diagnostic.action}${
        data.diagnostic.doNotDo ? `\n\nCaution: ${data.diagnostic.doNotDo}` : ""
      }${data.diagnostic.escalationCondition ? `\n\nEscalation Guidance: ${data.diagnostic.escalationCondition}` : ""}`,
      "warning"
    );
  }

  // 6. Payment Evidence & Attribution (if present)
  if (data.payment.hasPayments) {
    doc.addSectionHeading("5. Payment Verification & Attribution");
    const payHeaders = ["Date", "Amount", "Sender / Source", "Attribution Status", "Attribution Finding"];
    const payWidths = [65, 75, 95, 100, 180];
    const payRows = data.payment.events.map(p => [
      p.date || "Undated",
      p.amount || "Credit",
      p.sender || "Bank Record",
      p.statusLabel,
      p.explanation
    ]);
    doc.addTable(payHeaders, payWidths, payRows);
  }

  // 7. Structured Verification Matrix
  doc.addSectionHeading("6. Verification Matrix");
  const matrixHeaders = ["Check / Category", "Source & Date", "Observed Evidence", "ClaimClarity Finding", "Status"];
  const matrixWidths = [105, 90, 130, 130, 60];

  data.matrix.groups.forEach(group => {
    if (data.matrix.groups.length > 1) {
      doc.ensureSpace(20);
      doc.addText(group.contextTitle, doc.marginLeft, (doc as any).currentY - 10, 8.5, "F2", PDFColors.primary);
      (doc as any).currentY -= 14;
    }
    const mRows = group.rows.map(r => [
      r.category,
      `${r.sourceType}\n(${r.observedDate || "Undated"})`,
      r.observedFact,
      r.interpretation,
      r.status
    ]);
    doc.addTable(matrixHeaders, matrixWidths, mRows);
  });

  // 8. Chronological Evidence Timeline
  doc.addSectionHeading("7. Chronological Evidence Timeline");
  const timeHeaders = ["Date", "Source Channel", "Artifact ID", "Observed Milestone / Status", "Lifecycle State"];
  const timeWidths = [65, 95, 70, 205, 80];
  const timeRows = data.timeline.map(t => [
    t.date,
    t.source,
    t.artifactId,
    t.observation,
    t.isStale ? `${t.normalizedState} (Superseded)` : t.normalizedState
  ]);
  doc.addTable(timeHeaders, timeWidths, timeRows);

  // 9. Important Conflicts & Uncertainties
  if (data.conflicts.length > 0 || data.uncertainties.length > 0) {
    doc.addSectionHeading("8. Noted Conflicts & Uncertainties");
    const conflictItems = [
      ...data.conflicts.map(c => `• Conflict: ${c}`),
      ...data.uncertainties.map(u => `• Uncertainty: ${u}`)
    ].join("\n");
    doc.addCalloutBox("EVIDENCE LIMITATIONS & CONFLICTS", conflictItems, "warning");
  }

  // 10. Recommended Next Steps
  doc.addSectionHeading("9. Recommended Action Plan");
  doc.addCalloutBox(
    "WHAT TO DO NEXT",
    `Recommended Step: ${data.recommendedActions.action}${
      data.recommendedActions.doNotDo ? `\n\nDon't Do This Yet: ${data.recommendedActions.doNotDo}` : ""
    }`,
    "info"
  );

  // 11. Evidence / Source Index
  doc.addSectionHeading("10. Evidence Source Index");
  const srcHeaders = ["Artifact ID", "Source Channel", "Event Date", "Raw Evidence Snippet"];
  const srcWidths = [70, 95, 70, 280];
  const srcRows = data.sourceIndex.map(s => [
    s.artifactId,
    s.channelDetail ? `${s.source} (${s.channelDetail})` : s.source,
    s.date || "Undated",
    s.rawSnippet
  ]);
  doc.addTable(srcHeaders, srcWidths, srcRows);

  // 12. Non-Governmental Disclaimer
  doc.addSectionHeading("11. Legal & Non-Governmental Disclaimer");
  doc.addCalloutBox(
    "INDEPENDENT CITIZEN UTILITY NOTICE",
    data.disclaimer,
    "info"
  );

  return doc.build();
}
