import { describe, expect, it } from "vitest";
import {
  classifyRejectionEvidence,
  findRejectionDiagnostic,
  REJECTION_CATEGORIES
} from "@/lib/reconciliation/rejections";
import { assessClaimTimings, calculateElapsedDays, parseDateSafe, CLAIM_TIMINGS } from "@/lib/config/timings";
import { reconcileClaim } from "@/lib/reconciliation/reconcileClaim";
import type { Artifact } from "@/lib/schemas";

const makeArtifact = (
  id: string,
  text: string,
  status: string | null = null,
  date: string | null = null,
  source: Artifact["source"] = "new_tracker"
): Artifact => ({
  id,
  source,
  channelDetail: null,
  text,
  date,
  status,
  claimId: "CLM-TEST-001",
  claimType: "Form 31",
  amount: "₹25,000",
  ambiguity: null,
  extractionConfidence: "high",
  fileName: null,
  mimeType: null,
  dataBase64: null
});

describe("Package 3: Rejection Intelligence & Diagnostic Taxonomy", () => {
  it("defines the full 12-category curated taxonomy with safe fallback", () => {
    expect(REJECTION_CATEGORIES.length).toBe(12);
    expect(REJECTION_CATEGORIES).toContain("REJ_UNSPECIFIED");
    expect(REJECTION_CATEGORIES).toContain("REJ_BANK_ACCOUNT_MISMATCH");
    expect(REJECTION_CATEGORIES).toContain("REJ_KYC_IDENTITY_MISMATCH");
    expect(REJECTION_CATEGORIES).toContain("REJ_FATHER_SPOUSE_NAME_MISMATCH");
  });

  it("classifies bank account & IFSC mismatches with exact certainty", () => {
    const art = makeArtifact("art-bank", "Claim Rejected: Bank account mismatch with member IFSC code", "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_BANK_ACCOUNT_MISMATCH");
    expect(diag?.certainty).toBe("exact");
    expect(diag?.matchingRuleId).toBe("RULE_REJ_BANK_01");
    expect(diag?.sourceArtifactId).toBe("art-bank");
    expect(diag?.resolutionGuidance.stage).toBe("REMEDIATE");
    expect(diag?.resolutionGuidance.doNotDo).not.toBeNull();
  });

  it("classifies Father/Spouse name discrepancies accurately", () => {
    const art = makeArtifact("art-father", "Claim Denied: Father's name mismatch in joint declaration", "Denied");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_FATHER_SPOUSE_NAME_MISMATCH");
    expect(diag?.resolutionGuidance.prerequisites.length).toBeGreaterThan(0);
  });

  it("classifies KYC & Date of Birth discrepancies", () => {
    const art = makeArtifact("art-kyc", "Claim not approved: DOB mismatch with Aadhaar database", "Not Approved");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_KYC_IDENTITY_MISMATCH");
    expect(diag?.certainty).toBe("exact");
  });

  it("classifies signature and missing attestation issues", () => {
    const art = makeArtifact("art-sig", "Claim rejected: Member signature mismatch on physical form", "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_MEMBER_SIGNATURE_DOCS");
    expect(diag?.resolutionGuidance.stage).toBe("PREVENT_PROTECT");
  });

  it("classifies missing Date of Exit and service eligibility", () => {
    const art = makeArtifact("art-service", "Claim rejected: Date of Exit missing in service history", "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_SERVICE_ELIGIBILITY");
    expect(diag?.resolutionGuidance.escalationCondition).not.toBeNull();
  });

  it("classifies duplicate claims without jumping to conclusions", () => {
    const art = makeArtifact("art-dup", "Claim rejected: Duplicate claim already registered for Form 31", "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_DUPLICATE_CLAIM");
    expect(diag?.resolutionGuidance.stage).toBe("INFORM");
  });

  it("classifies technical batch failures", () => {
    const art = makeArtifact("art-tech", "Transaction returned: Batch processing failure on server", "Returned");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_TECHNICAL_SYSTEM_ERROR");
    expect(diag?.resolutionGuidance.stage).toBe("INFORM");
  });

  it("safely falls back to REJ_UNSPECIFIED when rejection text lacks standard known codes", () => {
    const art = makeArtifact("art-unspec", "Claim rejected by regional field officer without specific remarks", "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_UNSPECIFIED");
    expect(diag?.certainty).toBe("unspecified");
    expect(diag?.matchingRuleId).toBe("RULE_REJ_FALLBACK_UNSPECIFIED");
    expect(diag?.rawText).toContain("Claim rejected by regional field officer");
  });

  it("returns null when text contains no rejection or problem signals", () => {
    const art = makeArtifact("art-ok", "Claim submitted successfully at member portal", "Submitted");
    const diag = classifyRejectionEvidence(art);
    expect(diag).toBeNull();
  });

  it("resists false positives from neutral positive mentions like 'no mismatch' or 'without error'", () => {
    const art = makeArtifact(
      "art-neutral",
      "Member portal status: Bank account verified successfully with no mismatch and without error.",
      "Under Process"
    );
    const diag = classifyRejectionEvidence(art);
    expect(diag).toBeNull();
  });

  it("prioritizes causal reason when multiple category keywords appear in rejection remarks", () => {
    const art = makeArtifact(
      "art-multi",
      "Claim rejected because Date of Exit missing, although bank account details were verified.",
      "Rejected"
    );
    const diag = classifyRejectionEvidence(art);

    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_SERVICE_ELIGIBILITY");
    expect(diag?.matchingRuleId).toBe("RULE_REJ_SERVICE_01");
  });

  it("safely falls back to REJ_UNSPECIFIED when multiple competing categories tie without causal disambiguation", () => {
    const art = makeArtifact(
      "art-tie",
      "Claim rejected: bank account mismatch and signature mismatch on form",
      "Rejected"
    );
    const diag = classifyRejectionEvidence(art);
    expect(diag).not.toBeNull();
    expect(diag?.category).toBe("REJ_UNSPECIFIED");
    expect(diag?.certainty).toBe("unspecified");
  });

  it("preserves provenance and raw text without mutating input", () => {
    const raw = "Claim CLM-99 rejected: Bank account mismatch and cancelled cheque illegible";
    const art = makeArtifact("art-prov", raw, "Rejected");
    const diag = classifyRejectionEvidence(art);

    expect(diag?.rawText).toBe(`Rejected ${raw}`);
    expect(diag?.sourceArtifactId).toBe("art-prov");
    expect(diag?.matchedKeywords.length).toBeGreaterThanOrEqual(1);
    expect(diag?.matchingRuleId).toBe("RULE_REJ_BANK_01");
  });
});

describe("Package 3: Domain Timing Rules & Service Benchmarks", () => {
  it("correctly parses valid ISO date strings", () => {
    const d = parseDateSafe("2026-07-15");
    expect(d).not.toBeNull();
    expect(d?.getUTCFullYear()).toBe(2026);
    expect(d?.getUTCMonth()).toBe(6);
    expect(d?.getUTCDate()).toBe(15);
  });

  it("returns null on malformed or missing dates without throwing", () => {
    expect(parseDateSafe(null)).toBeNull();
    expect(parseDateSafe("")).toBeNull();
    expect(parseDateSafe("invalid-date")).toBeNull();
    expect(parseDateSafe("15/07/2026")).toBeNull();
  });

  it("calculates elapsed days between submission and latest observation", () => {
    const d1 = parseDateSafe("2026-07-01")!;
    const d2 = parseDateSafe("2026-07-25")!;
    expect(calculateElapsedDays(d1, d2)).toBe(24);
  });

  it("evaluates exact 20-day benchmark boundary semantics", () => {
    // 19 days -> not beyond
    const t19 = assessClaimTimings("2026-07-01", "2026-07-20");
    expect(t19.elapsedDaysFromSubmission).toBe(19);
    expect(t19.isBeyondBenchmark).toBe(false);

    // 20 days -> boundary condition (not beyond benchmark)
    const t20 = assessClaimTimings("2026-07-01", "2026-07-21");
    expect(t20.elapsedDaysFromSubmission).toBe(20);
    expect(t20.isBeyondBenchmark).toBe(false);

    // 21 days -> beyond benchmark
    const t21 = assessClaimTimings("2026-07-01", "2026-07-22");
    expect(t21.elapsedDaysFromSubmission).toBe(21);
    expect(t21.isBeyondBenchmark).toBe(true);
    expect(t21.timingNotice?.en).toContain("20-day Citizen Charter service benchmark");
    // Verifies NO false legal breach accusation
    expect(t21.timingNotice?.en).not.toMatch(/violation|illegal|breached the law/i);
  });

  it("evaluates exact 45-day escalation threshold boundary semantics", () => {
    // 44 days -> not escalation eligible
    const t44 = assessClaimTimings("2026-05-01", "2026-06-14");
    expect(t44.elapsedDaysFromSubmission).toBe(44);
    expect(t44.isEscalationEligible).toBe(false);

    // 45 days -> escalation threshold reached
    const t45 = assessClaimTimings("2026-05-01", "2026-06-15");
    expect(t45.elapsedDaysFromSubmission).toBe(45);
    expect(t45.isEscalationEligible).toBe(true);
    expect(t45.timingNotice?.en).toContain("ClaimClarity's configured 45-day escalation threshold");
    expect(t45.timingNotice?.en).toContain("EPFiGMS portal");
  });

  it("evaluates stale pending condition at 30+ days without implying rejection", () => {
    const t30 = assessClaimTimings("2026-05-01", "2026-05-31");
    expect(t30.elapsedDaysFromSubmission).toBe(30);
    expect(t30.isStalePending).toBe(true);
  });

  it("handles missing dates safely without fabricating arbitrary days", () => {
    const noDates = assessClaimTimings(null, null);
    expect(noDates.elapsedDaysFromSubmission).toBeNull();
    expect(noDates.isBeyondBenchmark).toBe(false);
    expect(noDates.isStalePending).toBe(false);
    expect(noDates.isEscalationEligible).toBe(false);
    expect(noDates.timingNotice).toBeNull();
  });
});

describe("Package 3: Reconciliation Integration & Safety Invariants", () => {
  it("enriches reconciliation result with diagnostic when rejection evidence is supplied", () => {
    const artifacts = [
      makeArtifact("a-sub", "Claim CLM-REJ-1 submitted on portal", "Submitted", "2026-07-01"),
      makeArtifact("a-rej", "Claim CLM-REJ-1 Rejected: Bank account mismatch with passbook", "Rejected", "2026-07-08")
    ];

    const result = reconcileClaim(artifacts, "Rohan", "demo");
    expect(result.finalState).toBe("REJECTED");
    expect(result.diagnostic).not.toBeNull();
    expect(result.diagnostic?.category).toBe("REJ_BANK_ACCOUNT_MISMATCH");
    expect(result.diagnostic?.certainty).toBe("exact");
    expect(result.timingAssessment?.elapsedDaysFromSubmission).toBe(7);
  });

  it("never allows diagnostic classification to override authoritative terminal conflict reconciliation", () => {
    const artifacts = [
      makeArtifact("a-sub", "Claim submitted", "Submitted", "2026-07-01"),
      makeArtifact("a-rej", "Claim Rejected: Signature mismatch", "Rejected", "2026-07-05"),
      makeArtifact("a-cred", "Bank credit of ₹30,000 received for claim", "Credited", "2026-07-10", "bank")
    ];

    const result = reconcileClaim(artifacts, "Rohan", "demo");
    // Authoritative reconciliation detects terminal conflict
    expect(result.conflicts.some(c => c.type === "TERMINAL_CONTRADICTION")).toBe(true);
    // Diagnostic information is attached for auditability without corrupting state
    expect(result.diagnostic?.category).toBe("REJ_MEMBER_SIGNATURE_DOCS");
  });

  it("never allows stale pending timing to convert PROCESSING into REJECTED", () => {
    const artifacts = [
      makeArtifact("a-sub", "Claim submitted on portal", "Submitted", "2026-05-01"),
      makeArtifact("a-proc", "Claim is under process at field office", "Under Process", "2026-06-15")
    ];

    const result = reconcileClaim(artifacts, "Asha", "demo");
    expect(result.finalState).toBe("PROCESSING");
    expect(result.timingAssessment?.isStalePending).toBe(true);
    expect(result.timingAssessment?.isEscalationEligible).toBe(true);
    // Must remain PROCESSING rather than jumping to REJECTED
    expect(result.finalState).not.toBe("REJECTED");
  });
});
