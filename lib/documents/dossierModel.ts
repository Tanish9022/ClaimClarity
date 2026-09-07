import type {
  CanonicalStatus,
  ClaimContext,
  FormType,
  ReconciliationResult
} from "@/lib/schemas";
import type { Language } from "@/lib/i18n";

export type MatrixCheckStatus =
  | "VERIFIED"
  | "SUPPORTED"
  | "NEEDS_REVIEW"
  | "UNCLEAR"
  | "CONFLICT"
  | "SUPERSEDED";

export interface VerificationMatrixRow {
  id: string;
  category: string;
  sourceType: string;
  sourceArtifactId: string;
  observedDate: string | null;
  observedFact: string;
  interpretation: string;
  status: MatrixCheckStatus;
  claimContextId: string | null;
  notes?: string;
}

export interface VerificationMatrixGroup {
  contextId: string | null;
  contextTitle: string;
  claimReference: string | null;
  formType: FormType | string;
  rows: VerificationMatrixRow[];
}

export interface VerificationMatrixData {
  groups: VerificationMatrixGroup[];
  totalChecks: number;
  verifiedCount: number;
  conflictsCount: number;
  unresolvedCount: number;
}

export interface DossierSummaryItem {
  label: string;
  value: string;
}

export interface DossierData {
  title: string;
  subtitle: string;
  generatedDate: string;
  language: Language;
  caseSummary: DossierSummaryItem[];
  reconciliationOutcome: {
    state: CanonicalStatus;
    stateLabel: string;
    confidence: string;
    reason: string;
    winningRationale: string;
    rulesFired: string[];
  };
  contexts: Array<{
    contextId: string;
    claimReference: string | null;
    formType: string;
    resolutionStatus: string;
    evidenceCount: number;
  }>;
  timeline: Array<{
    date: string;
    source: string;
    artifactId: string;
    observation: string;
    normalizedState: string;
    isStale: boolean;
  }>;
  diagnostic: {
    category: string;
    categoryTitle: string;
    certainty: string;
    rawText: string;
    interpretation: string;
    action: string;
    prerequisites: string[];
    doNotDo: string | null;
    escalationCondition: string | null;
  } | null;
  payment: {
    hasPayments: boolean;
    events: Array<{
      date: string | null;
      amount: string | null;
      sender: string | null;
      attributionStatus: string;
      statusLabel: string;
      rawNarration: string;
      explanation: string;
    }>;
  };
  matrix: VerificationMatrixData;
  conflicts: string[];
  uncertainties: string[];
  recommendedActions: {
    action: string;
    doNotDo: string | null;
  };
  sourceIndex: Array<{
    artifactId: string;
    source: string;
    channelDetail: string | null;
    date: string | null;
    rawSnippet: string;
  }>;
  disclaimer: string;
}

/**
 * DETERMINISTIC PII MASKING
 * Protects Aadhaar (12 digits), PAN (10 chars), bank account numbers, phone numbers.
 */
export function maskSensitivePII(text: string): string {
  if (!text) return "";

  let sanitized = text;

  // Mask 12-digit Aadhaar-like sequences: XXXX-XXXX-1234 or XXXXXXXXXXXX
  sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?(\d{4})\b/g, "XXXX-XXXX-$1");

  // Mask 10-character PAN-like sequences: ABCDE1234F -> XXXXX1234F
  sanitized = sanitized.replace(/\b[A-Z]{5}(\d{4}[A-Z])\b/g, "XXXXX$1");

  // Mask 10-digit Indian mobile numbers: 9876543210 -> XXXXXX3210
  sanitized = sanitized.replace(/\b[6-9]\d{5}(\d{4})\b/g, "XXXXXX$1");

  // Mask long bank account numbers (>8 digits): 123456789012 -> XXXXXXXX9012
  sanitized = sanitized.replace(/\b\d{6,14}(\d{4})\b/g, "XXXXXX$1");

  return sanitized;
}

/**
 * BUILD STRUCTURED VERIFICATION MATRIX FROM RECONCILIATION RESULT
 */
export function buildVerificationMatrix(
  result: ReconciliationResult,
  lang: Language = "en"
): VerificationMatrixData {
  const isHi = lang === "hi";
  const rows: VerificationMatrixRow[] = [];

  // 1. Claim Reference Check
  if (result.claimIdentity.claimId) {
    rows.push({
      id: "chk-claim-ref",
      category: isHi ? "दावा संदर्भ संख्या" : "Claim Reference",
      sourceType: "Portal / Notice",
      sourceArtifactId: result.events.find(e => e.claimId)?.artifactId || "E-REF",
      observedDate: result.events.find(e => e.claimId)?.date || null,
      observedFact: `Claim ID: ${result.claimIdentity.claimId}`,
      interpretation: isHi
        ? "दावा पहचान संख्या सत्यापित और सुसंगत है।"
        : "Claim identifier is verified and consistent across records.",
      status: result.claimIdentity.identityStatus === "MATCHED" ? "VERIFIED" : "CONFLICT",
      claimContextId: result.partitionResult?.contexts[0]?.contextId || "CTX-1"
    });
  } else {
    rows.push({
      id: "chk-claim-ref-missing",
      category: isHi ? "दावा संदर्भ संख्या" : "Claim Reference",
      sourceType: "Evidence",
      sourceArtifactId: "E-NONE",
      observedDate: null,
      observedFact: isHi ? "कोई स्पष्ट दावा संख्या नहीं मिली" : "No explicit claim ID present",
      interpretation: isHi
        ? "दावा संदर्भ संख्या का अभाव निश्चित पहचान को सीमित करता है।"
        : "Missing claim reference limits definitive identity verification.",
      status: "UNCLEAR",
      claimContextId: null
    });
  }

  // 2. Form Type Check
  if (result.claimIdentity.claimType || (result.partitionResult && result.partitionResult.hasMultiForm)) {
    const formName = result.claimIdentity.claimType || result.partitionResult?.contexts[0]?.formType || "Form Unspecified";
    rows.push({
      id: "chk-form-type",
      category: isHi ? "फॉर्म का प्रकार" : "Form Type",
      sourceType: "Claim Record",
      sourceArtifactId: result.events.find(e => e.claimType)?.artifactId || "E-FORM",
      observedDate: result.events.find(e => e.claimType)?.date || null,
      observedFact: `Form: ${formName}`,
      interpretation: isHi
        ? `दावा फॉर्म श्रेणी (${formName}) की पुष्टि हुई।`
        : `Claim form classification (${formName}) corroborated.`,
      status: "SUPPORTED",
      claimContextId: result.partitionResult?.contexts[0]?.contextId || "CTX-1"
    });
  }

  // 3. Status & Lifecycle Milestones from Events
  result.events.forEach((evt, idx) => {
    let status: MatrixCheckStatus = "SUPPORTED";
    if (evt.isStale) {
      status = "SUPERSEDED";
    } else if (evt.normalizedState === "UNKNOWN") {
      status = "UNCLEAR";
    } else if (result.conflicts.some(c => c.artifactIds.includes(evt.artifactId) && c.severity === "blocking")) {
      status = "CONFLICT";
    }

    const isCredit = evt.normalizedState === "CREDITED";
    const categoryName = isCredit
      ? isHi ? "बैंक जमा प्रविष्टि" : "Bank Credit Entry"
      : isHi ? "दावे की स्थिति / चरण" : "Claim Lifecycle Status";

    rows.push({
      id: `chk-evt-${idx + 1}`,
      category: categoryName,
      sourceType: evt.source,
      sourceArtifactId: evt.artifactId,
      observedDate: evt.date,
      observedFact: evt.rawStatus ? `${evt.rawStatus}` : evt.detail.substring(0, 80),
      interpretation: evt.isStale
        ? isHi ? "नए परिणाम द्वारा बदला गया (अमान्य)।" : "Superseded by newer outcome."
        : isHi ? `स्थिति ${evt.normalizedState} के रूप में विश्लेषित।` : `Interpreted as ${evt.normalizedState} state.`,
      status,
      claimContextId: result.partitionResult?.contexts.find(c => c.evidenceArtifactIds.includes(evt.artifactId))?.contextId || null,
      notes: evt.ambiguity || undefined
    });
  });

  // 4. Payment Attribution Checks
  if (result.paymentAttribution && result.paymentAttribution.payments.length > 0) {
    result.paymentAttribution.payments.forEach((pay, idx) => {
      let status: MatrixCheckStatus = "UNCLEAR";
      if (pay.attributionStatus === "ATTRIBUTED") status = "VERIFIED";
      else if (pay.attributionStatus === "CANDIDATE") status = "NEEDS_REVIEW";
      else if (pay.attributionStatus === "CONFLICTED") status = "CONFLICT";
      else status = "UNCLEAR";

      rows.push({
        id: `chk-pay-${idx + 1}`,
        category: isHi ? "भुगतान सत्यापन एवं जुड़ाव" : "Payment Attribution",
        sourceType: "Bank / Passbook",
        sourceArtifactId: pay.sourceArtifactId,
        observedDate: pay.date,
        observedFact: `${pay.amount || "Credit"} | ${pay.senderReference || "Bank Credit"}`,
        interpretation: pay.explanation[lang],
        status,
        claimContextId: pay.attributedContextId || pay.candidateContextIds[0] || null
      });
    });
  }

  // 5. Timing Assessment Check
  if (result.timingAssessment) {
    const t = result.timingAssessment;
    const elapsed = t.elapsedDaysFromSubmission !== null ? `${t.elapsedDaysFromSubmission} days` : "Unknown";
    rows.push({
      id: "chk-timing",
      category: isHi ? "समयरेखा व सेवा मानक" : "Timing & Benchmark",
      sourceType: "Timeline Calculation",
      sourceArtifactId: "E-TIMING",
      observedDate: t.latestObservationDate,
      observedFact: `Elapsed: ${elapsed} (Guideline: ${t.benchmarkDays} days)`,
      interpretation: t.timingNotice
        ? t.timingNotice[lang]
        : isHi ? "समयसीमा नागरिक चार्टर मानक के अंतर्गत है।" : "Timeline within service guidelines.",
      status: t.isBeyondBenchmark ? "NEEDS_REVIEW" : "SUPPORTED",
      claimContextId: null
    });
  }

  // 6. Diagnostic Rejection Check (if present)
  if (result.diagnostic) {
    const diag = result.diagnostic;
    rows.push({
      id: "chk-diagnostic",
      category: isHi ? "अस्वीकृति निदान" : "Rejection Diagnostic",
      sourceType: diag.sourceType,
      sourceArtifactId: diag.sourceArtifactId,
      observedDate: null,
      observedFact: diag.rawText.substring(0, 100),
      interpretation: `${diag.diagnosticTitle[lang]}: ${diag.interpretation[lang]}`,
      status: "NEEDS_REVIEW",
      claimContextId: null
    });
  }

  // Group rows by claim context
  const groups: VerificationMatrixGroup[] = [];
  const contexts = result.partitionResult?.contexts || [];

  if (contexts.length > 1) {
    contexts.forEach(ctx => {
      const contextRows = rows.filter(
        r => r.claimContextId === ctx.contextId || ctx.evidenceArtifactIds.includes(r.sourceArtifactId)
      );
      groups.push({
        contextId: ctx.contextId,
        contextTitle: `${ctx.contextId}: ${ctx.claimReference || "Unreferenced"} (${ctx.formType})`,
        claimReference: ctx.claimReference,
        formType: ctx.formType,
        rows: contextRows
      });
    });

    const unassignedRows = rows.filter(r => !r.claimContextId && !groups.some(g => g.rows.includes(r)));
    if (unassignedRows.length > 0) {
      groups.push({
        contextId: null,
        contextTitle: isHi ? "सामान्य / असंबद्ध सत्यापन जांच" : "General / Cross-Claim Checks",
        claimReference: null,
        formType: "FORM_UNSPECIFIED",
        rows: unassignedRows
      });
    }
  } else {
    groups.push({
      contextId: contexts[0]?.contextId || "CTX-1",
      contextTitle: isHi ? "समग्र साक्ष्य सत्यापन मैट्रिक्स" : "Comprehensive Verification Matrix",
      claimReference: result.claimIdentity.claimId,
      formType: result.claimIdentity.claimType || "Form 19",
      rows
    });
  }

  const verifiedCount = rows.filter(r => r.status === "VERIFIED" || r.status === "SUPPORTED").length;
  const conflictsCount = rows.filter(r => r.status === "CONFLICT").length;
  const unresolvedCount = rows.filter(r => r.status === "NEEDS_REVIEW" || r.status === "UNCLEAR").length;

  return {
    groups,
    totalChecks: rows.length,
    verifiedCount,
    conflictsCount,
    unresolvedCount
  };
}

/**
 * ASSEMBLE COMPLETE DOSSIER DATA OBJECT
 */
export function buildDossierData(
  result: ReconciliationResult,
  lang: Language = "en"
): DossierData {
  const isHi = lang === "hi";
  const matrix = buildVerificationMatrix(result, lang);

  const claimId = result.claimIdentity.claimId || (isHi ? "उपलब्ध नहीं" : "Not available");
  const formType = result.claimIdentity.claimType || result.partitionResult?.contexts[0]?.formType || (isHi ? "अनिर्दिष्ट" : "Unspecified");
  const observationCount = `${result.events.length} record(s)`;
  const dateSpan = (() => {
    const dates = result.events.map(e => e.date).filter((d): d is string => Boolean(d)).sort();
    if (dates.length === 0) return isHi ? "उपलब्ध नहीं" : "Not dated";
    if (dates.length === 1) return dates[0];
    return `${dates[0]} to ${dates[dates.length - 1]}`;
  })();

  const caseSummary: DossierSummaryItem[] = [
    { label: isHi ? "दावा संदर्भ संख्या" : "Claim Identifier", value: claimId },
    { label: isHi ? "फॉर्म प्रकार" : "Form Category", value: formType },
    { label: isHi ? "सत्यापित स्थिति" : "Reconciliation State", value: result.finalState },
    { label: isHi ? "सबूत का विश्वास स्तर" : "Confidence Level", value: result.confidence.toUpperCase() },
    { label: isHi ? "समीक्षित रिकॉर्ड्स" : "Evidence Records", value: observationCount },
    { label: isHi ? "अवलोकन समयावधि" : "Observation Timeline", value: dateSpan }
  ];

  if (result.timingAssessment?.elapsedDaysFromSubmission !== null && result.timingAssessment?.elapsedDaysFromSubmission !== undefined) {
    caseSummary.push({
      label: isHi ? "बीते दिन" : "Elapsed Days",
      value: `${result.timingAssessment.elapsedDaysFromSubmission} days (Benchmark: ${result.timingAssessment.benchmarkDays} days)`
    });
  }

  const contexts = (result.partitionResult?.contexts || []).map(c => ({
    contextId: c.contextId,
    claimReference: c.claimReference,
    formType: c.formType,
    resolutionStatus: c.resolutionStatus,
    evidenceCount: c.evidenceArtifactIds.length
  }));

  const timeline = result.events.map(e => ({
    date: e.date || (isHi ? "अदिनांकित" : "Undated"),
    source: e.source.toUpperCase().replace("_", " "),
    artifactId: e.artifactId,
    observation: maskSensitivePII(e.rawStatus ? `${e.rawStatus} (${e.detail.substring(0, 100)})` : e.detail.substring(0, 120)),
    normalizedState: e.normalizedState,
    isStale: e.isStale
  }));

  const diagnostic = result.diagnostic
    ? {
        category: result.diagnostic.category,
        categoryTitle: result.diagnostic.diagnosticTitle[lang],
        certainty: result.diagnostic.certainty.toUpperCase(),
        rawText: maskSensitivePII(result.diagnostic.rawText),
        interpretation: result.diagnostic.interpretation[lang],
        action: result.diagnostic.resolutionGuidance.action[lang],
        prerequisites: result.diagnostic.resolutionGuidance.prerequisites,
        doNotDo: result.diagnostic.resolutionGuidance.doNotDo ? result.diagnostic.resolutionGuidance.doNotDo[lang] : null,
        escalationCondition: result.diagnostic.resolutionGuidance.escalationCondition ? result.diagnostic.resolutionGuidance.escalationCondition[lang] : null
      }
    : null;

  const payment = {
    hasPayments: Boolean(result.paymentAttribution && result.paymentAttribution.payments.length > 0),
    events: (result.paymentAttribution?.payments || []).map(p => ({
      date: p.date,
      amount: p.amount,
      sender: p.senderReference,
      attributionStatus: p.attributionStatus,
      statusLabel:
        p.attributionStatus === "ATTRIBUTED"
          ? isHi ? "सत्यापित जुड़ाव" : "Verified Link"
          : p.attributionStatus === "CANDIDATE"
          ? isHi ? "संभावित जुड़ाव" : "Candidate Match"
          : p.attributionStatus === "CONFLICTED"
          ? isHi ? "विरोधाभासी" : "Conflicted"
          : isHi ? "असंबंधित भुगतान" : "Unlinked Payment",
      rawNarration: maskSensitivePII(p.rawNarration),
      explanation: p.explanation[lang]
    }))
  };

  const conflicts = result.conflicts.map(c => maskSensitivePII(c.message));
  const uncertainties = result.uncertainties.map(u => maskSensitivePII(u));

  const sourceIndex = result.events.map(e => ({
    artifactId: e.artifactId,
    source: e.source.toUpperCase().replace("_", " "),
    channelDetail: e.channelDetail,
    date: e.date,
    rawSnippet: maskSensitivePII(e.detail.substring(0, 200))
  }));

  return {
    title: isHi
      ? "ClaimClarity साक्ष्य एवं शिकायत सहायता डोजियर"
      : "ClaimClarity Evidence & Grievance Support Dossier",
    subtitle: isHi
      ? "उपलब्ध रिकॉर्ड्स का स्वतंत्र विश्लेषण एवं साक्ष्य सारांश"
      : "Independent Evidence Analysis & Structured Record Summary",
    generatedDate: new Date().toISOString().split("T")[0],
    language: lang,
    caseSummary,
    reconciliationOutcome: {
      state: result.finalState,
      stateLabel: result.finalState,
      confidence: result.confidence.toUpperCase(),
      reason: result.reason,
      winningRationale: result.reconciliationTrace.winningStateRationale,
      rulesFired: result.rulesFired
    },
    contexts,
    timeline,
    diagnostic,
    payment,
    matrix,
    conflicts,
    uncertainties,
    recommendedActions: {
      action: result.recommendedAction,
      doNotDo: result.doNotDo
    },
    sourceIndex,
    disclaimer: isHi
      ? "यह दस्तावेज ClaimClarity द्वारा नागरिक के उपलब्ध साक्ष्यों को व्यवस्थित करने के लिए एक स्वतंत्र सहायक दस्तावेज के रूप में तैयार किया गया है। यह ईपीएफओ द्वारा जारी आधिकारिक पत्र या ईपीएफआईजीएमएस शिकायत नहीं है और न ही यह किसी सरकारी निर्णय का प्रतिनिधित्व करता है।"
      : "Prepared by ClaimClarity as an independent evidence-organizing aid. This document is not issued by EPFO, is not an official EPFiGMS submission, and does not represent a government determination."
  };
}
