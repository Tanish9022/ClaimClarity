import { describe, expect, it } from "vitest";
import { normalizeStatus, reconcileClaim } from "@/lib/reconciliation/reconcileClaim";
import { sampleClaims } from "@/lib/data/sampleClaims";
import type { Artifact } from "@/lib/schemas";

const art = (
  id: string,
  source: Artifact["source"],
  text: string,
  date: string | null = null,
  status: string | null = null,
  claimId: string | null = null,
  amount: string | null = null,
  ambiguity: string | null = null
): Artifact => ({
  id,
  source,
  channelDetail: null,
  text,
  date,
  status,
  claimId,
  claimType: null,
  amount,
  ambiguity,
  extractionConfidence: "high",
  fileName: null,
  mimeType: null,
  dataBase64: null
});

describe("ClaimClarity V2 Deterministic Reconciliation Engine", () => {
  describe("Status Normalization", () => {
    it("normalizes evidence status strings into canonical lifecycle states", () => {
      expect(normalizeStatus("Under Process")).toBe("PROCESSING");
      expect(normalizeStatus("Pending verification at Field Office")).toBe("PROCESSING");
      expect(normalizeStatus("Claim Submitted At Portal")).toBe("SUBMITTED");
      expect(normalizeStatus("Claim approved")).toBe("APPROVED");
      expect(normalizeStatus("Claim settled")).toBe("SETTLED");
      expect(normalizeStatus("Disbursed to bank")).toBe("SETTLED");
      expect(normalizeStatus("Bank credit received ₹45,000")).toBe("CREDITED");
      expect(normalizeStatus("Claim Rejected")).toBe("REJECTED");
      expect(normalizeStatus("Random unknown string")).toBe("UNKNOWN");
      expect(normalizeStatus(null)).toBe("UNKNOWN");
    });
  });

  describe("20 Required Lifecycle & Boundary Scenarios", () => {
    // 1. Submitted -> Processing
    it("1. Submitted -> Processing: selects PROCESSING and detects stage progression", () => {
      const evidence = [
        art("1", "new_tracker", "Claim submitted", "2026-07-01", "Submitted", "CLM-100"),
        art("2", "old_tracker", "Under Process", "2026-07-04", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("PROCESSING");
      expect(r.confidence).toBe("medium");
      expect(r.conflicts.some(c => c.type === "DIFFERENT_STAGES")).toBe(true);
      expect(r.rulesFired).toContain("PROCESSING_IN_FLIGHT_RECONCILED");
      expect(r.recommendedAction).toMatch(/Wait and monitor/i);
      expect(r.reconciliationTrace.competingStatesEvaluated.find(s => s.state === "SUBMITTED")?.status).toBe("unsupported");
    });

    // 2. Processing -> Settled
    it("2. Processing -> Settled: selects SETTLED and marks earlier processing as stale", () => {
      const evidence = [
        art("1", "old_tracker", "Under Process", "2026-07-04", "Under Process", "CLM-100"),
        art("2", "new_tracker", "Claim Settled", "2026-07-10", "Settled", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("SETTLED");
      expect(r.confidence).toBe("high");
      expect(r.reconciliationTrace.staleObservations).toContain("1");
      expect(r.rulesFired).toContain("LATER_SETTLEMENT_EVIDENCE_WINS");
      expect(r.conflicts.some(c => c.type === "STALE_OBSERVATION")).toBe(true);
      expect(r.recommendedAction).toMatch(/Check your bank account/i);
    });

    // 3. Processing -> Credited
    it("3. Processing -> Credited: selects CREDITED as highest financial terminal outcome", () => {
      const evidence = [
        art("1", "sms", "Under Process", "2026-07-05", "Under Process", "CLM-100"),
        art("2", "passbook", "₹45,000 credited", "2026-07-12", "₹45,000 credited", "CLM-100", "₹45,000")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("CREDITED");
      expect(r.confidence).toBe("high");
      expect(r.reconciliationTrace.supportingObservations).toContain("2");
      expect(r.reconciliationTrace.staleObservations).toContain("1");
      expect(r.rulesFired).toContain("LATER_CREDIT_EVIDENCE_WINS");
      expect(r.recommendedAction).toMatch(/Verify the credit/i);
    });

    // 4. Submitted -> Processing -> Settled -> Credited
    it("4. Submitted -> Processing -> Settled -> Credited: full progression selects CREDITED", () => {
      const evidence = [
        art("1", "new_tracker", "Submitted", "2026-07-01", "Submitted", "CLM-100"),
        art("2", "old_tracker", "Under Process", "2026-07-04", "Under Process", "CLM-100"),
        art("3", "new_tracker", "Settled", "2026-07-10", "Settled", "CLM-100"),
        art("4", "bank", "Credit received", "2026-07-12", "Credit received", "CLM-100", "₹50,000")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("CREDITED");
      expect(r.confidence).toBe("high");
      expect(r.reconciliationTrace.staleObservations).toEqual(["1", "2"]);
      expect(r.reconciliationTrace.supportingObservations).toEqual(["4", "3"]);
      expect(r.doNotDo).toMatch(/Do not submit another claim/i);
    });

    // 5. Processing -> Rejected
    it("5. Processing -> Rejected: selects REJECTED as terminal outcome", () => {
      const evidence = [
        art("1", "sms", "Under Process", "2026-07-05", "Under Process", "CLM-100"),
        art("2", "new_tracker", "Claim Rejected: Name mismatch", "2026-07-09", "Rejected", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("REJECTED");
      expect(r.confidence).toBe("high");
      expect(r.rulesFired).toContain("OFFICIAL_REJECTION_RECORDED");
      expect(r.recommendedAction).toMatch(/Review the rejection reason/i);
      expect(r.doNotDo).toMatch(/Do not submit an identical claim/i);
    });

    // 6. Rejected -> later Credited (Contradiction)
    it("6. Rejected -> later Credited: flags TERMINAL_CONTRADICTION and refuses to declare definitive state", () => {
      const evidence = [
        art("1", "new_tracker", "Claim Rejected", "2026-07-05", "Rejected", "CLM-100"),
        art("2", "bank", "Credit received ₹25,000", "2026-07-08", "Credit received", "CLM-100", "₹25,000")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("UNKNOWN");
      expect(r.confidence).toBe("low");
      expect(r.conflicts.some(c => c.type === "TERMINAL_CONTRADICTION")).toBe(true);
      expect(r.rulesFired).toContain("TERMINAL_CONTRADICTION_DETECTED");
      expect(r.recommendedAction).toMatch(/Verify the official claim outcome/i);
    });

    // 7. Settled -> later Rejected (Contradiction)
    it("7. Settled -> later Rejected: flags TERMINAL_CONTRADICTION and surfaces conflict", () => {
      const evidence = [
        art("1", "new_tracker", "Claim Settled", "2026-07-05", "Settled", "CLM-100"),
        art("2", "new_tracker", "Claim Rejected", "2026-07-08", "Rejected", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("UNKNOWN");
      expect(r.confidence).toBe("low");
      expect(r.conflicts.some(c => c.type === "TERMINAL_CONTRADICTION")).toBe(true);
      expect(r.rulesFired).toContain("TERMINAL_CONTRADICTION_REFUSAL");
    });

    // 8. Conflicting claim IDs
    it("8. Conflicting claim IDs: raises IDENTIFIER_MISMATCH and reduces confidence to low", () => {
      const evidence = [
        art("1", "new_tracker", "Under Process", "2026-07-05", "Under Process", "CLM-AAA"),
        art("2", "sms", "Under Process", "2026-07-06", "Under Process", "CLM-BBB")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.claimIdentity.identityStatus).toBe("CONFLICT");
      expect(r.confidence).toBe("low");
      expect(r.conflicts.some(c => c.type === "IDENTIFIER_MISMATCH")).toBe(true);
      expect(r.rulesFired).toContain("IDENTIFIER_MISMATCH_DETECTED");
    });

    // 9. Missing claim ID (Incomplete identity)
    it("9. Missing claim ID: marks identity as INCOMPLETE without automatically dropping evidence", () => {
      const evidence = [
        art("1", "sms", "Your claim is under process", "2026-07-05", "Under Process", null),
        art("2", "old_tracker", "Claim under process", "2026-07-06", "Under Process", null)
      ];
      const r = reconcileClaim(evidence, null, "demo");
      expect(r.claimIdentity.identityStatus).toBe("INCOMPLETE");
      expect(r.uncertainties).toContain("No explicit claim ID was found in the evidence.");
      expect(r.finalState).toBe("PROCESSING");
    });

    // 10. Missing dates
    it("10. Missing dates: handles undated evidence and surfaces timeline uncertainty", () => {
      const evidence = [
        art("1", "sms", "Under Process", null, "Under Process", "CLM-100"),
        art("2", "new_tracker", "Claim Settled", "2026-07-10", "Settled", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("SETTLED");
      expect(r.uncertainties.some(u => u.includes("lack a verified date"))).toBe(true);
    });

    // 11. Partial chronology
    it("11. Partial chronology: orders dated events first and places undated at end", () => {
      const evidence = [
        art("undated", "sms", "Under Process", null, "Under Process", "CLM-100"),
        art("d2", "new_tracker", "Settled", "2026-07-10", "Settled", "CLM-100"),
        art("d1", "old_tracker", "Submitted", "2026-07-02", "Submitted", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.events[0].artifactId).toBe("d1");
      expect(r.events[1].artifactId).toBe("d2");
      expect(r.events[2].artifactId).toBe("undated");
    });

    // 12. One strong dated terminal observation
    it("12. One strong dated terminal observation: safely supports conclusion with medium confidence", () => {
      const evidence = [
        art("1", "new_tracker", "Claim CLM-555 Settled", "2026-07-10", "Settled", "CLM-555", "₹30,000")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("SETTLED");
      expect(r.confidence).toBe("medium"); // Calibrated for single uncorroborated record
      expect(r.rulesFired).toContain("LATER_SETTLEMENT_EVIDENCE_WINS");
    });

    // 13. One vague undated message
    it("13. One vague undated message: triggers INSUFFICIENT_EVIDENCE_REFUSAL and UNKNOWN", () => {
      const evidence = [
        art("1", "sms", "Your request has been received.", null, null, null)
      ];
      const r = reconcileClaim(evidence, null, "demo");
      expect(r.finalState).toBe("UNKNOWN");
      expect(r.confidence).toBe("low");
      expect(r.rulesFired).toContain("INSUFFICIENT_EVIDENCE_REFUSAL");
      expect(r.uncertainties).toContain("Missing claim ID");
      expect(r.recommendedAction).toMatch(/Add another dated/i);
    });

    // 14. Duplicate evidence
    it("14. Duplicate evidence: deduplicates identical duplicate observations from same source", () => {
      const evidence = [
        art("1", "sms", "Claim CLM-100 Under Process", "2026-07-05", "Under Process", "CLM-100"),
        art("2", "sms", "Claim CLM-100 Under Process", "2026-07-05", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.evidenceCount).toBe(1);
    });

    // 15. Ambiguous wording
    it("15. Ambiguous wording: preserves extraction ambiguity in uncertainties list", () => {
      const evidence = [
        art("1", "other", "Status may be pending or completed", "2026-07-05", "Pending", "CLM-100", null, "Unclear whether completed or pending"),
        art("2", "new_tracker", "Under Process", "2026-07-06", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.uncertainties).toContain("Unclear whether completed or pending");
    });

    // 16. Multiple independent sources agreeing
    it("16. Multiple independent sources agreeing: produces high confidence on consensus", () => {
      const evidence = [
        art("1", "new_tracker", "Under Process", "2026-07-05", "Under Process", "CLM-100"),
        art("2", "old_tracker", "Under Process", "2026-07-05", "Under Process", "CLM-100"),
        art("3", "sms", "Under Process", "2026-07-06", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("PROCESSING");
      expect(r.conflicts.length).toBe(0);
      expect(r.reconciliationTrace.supportingObservations.length).toBe(3);
    });

    // 17. Multiple sources disagreeing on in-flight stages
    it("17. Multiple sources disagreeing: flags DIFFERENT_STAGES conflict", () => {
      const evidence = [
        art("1", "new_tracker", "Submitted", "2026-07-03", "Submitted", "CLM-100"),
        art("2", "old_tracker", "Under Process", "2026-07-04", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.conflicts.some(c => c.type === "DIFFERENT_STAGES")).toBe(true);
      expect(r.finalState).toBe("PROCESSING");
    });

    // 18. Stale processing after completion
    it("18. Stale processing after completion: detects regression and flags stale records", () => {
      const evidence = [
        art("1", "new_tracker", "Claim Settled", "2026-07-10", "Settled", "CLM-100"),
        art("2", "sms", "Under Process notification", "2026-07-12", "Under Process", "CLM-100")
      ];
      const r = reconcileClaim(evidence, "Rohan", "demo");
      expect(r.finalState).toBe("SETTLED");
      expect(r.conflicts.some(c => c.type === "CHRONOLOGY_REGRESSION")).toBe(true);
    });

    // 19. Conflicting terminal states in sample claim CASE_CONFLICT
    it("19. Conflicting terminal states: tests sampleClaims.CASE_CONFLICT", () => {
      const r = reconcileClaim(sampleClaims.CASE_CONFLICT.artifacts, "Vikram", "demo");
      expect(r.finalState).toBe("UNKNOWN");
      expect(r.confidence).toBe("low");
      expect(r.conflicts.some(c => c.type === "TERMINAL_CONTRADICTION")).toBe(true);
    });

    // 20. Trace and structured output integrity
    it("20. Trace and structured output: contains all required trace fields and evaluations", () => {
      const r = reconcileClaim(sampleClaims.CASE_A.artifacts, "Rohan", "demo");
      expect(r.reconciliationTrace).toBeDefined();
      expect(Array.isArray(r.reconciliationTrace.supportingObservations)).toBe(true);
      expect(Array.isArray(r.reconciliationTrace.staleObservations)).toBe(true);
      expect(Array.isArray(r.reconciliationTrace.conflictsFound)).toBe(true);
      expect(Array.isArray(r.reconciliationTrace.competingStatesEvaluated)).toBe(true);
      expect(r.reconciliationTrace.winningStateRationale.length).toBeGreaterThan(5);

      const creditedEval = r.reconciliationTrace.competingStatesEvaluated.find(s => s.state === "CREDITED");
      expect(creditedEval?.status).toBe("selected");

      const procEval = r.reconciliationTrace.competingStatesEvaluated.find(s => s.state === "PROCESSING");
      expect(procEval?.status).toBe("superseded");
    });
  });

  describe("Sample Claims Suite", () => {
    it("CASE A reconciles disagreeing records with newer passbook credit", () => {
      const r = reconcileClaim(sampleClaims.CASE_A.artifacts, "Rohan", "demo");
      expect(r.finalState).toBe("CREDITED");
      expect(r.confidence).toBe("high");
      expect(r.conflicts.some(c => c.type === "STALE_OBSERVATION")).toBe(true);
      expect(r.rulesFired).toContain("LATER_CREDIT_EVIDENCE_WINS");
    });

    it("CASE B resolves standard full progression to CREDITED", () => {
      const r = reconcileClaim(sampleClaims.CASE_B.artifacts, "Asha", "demo");
      expect(r.finalState).toBe("CREDITED");
      expect(r.confidence).toBe("high");
      expect(r.rulesFired).toContain("LATER_CREDIT_EVIDENCE_WINS");
    });

    it("CASE C refuses vague evidence", () => {
      const r = reconcileClaim(sampleClaims.CASE_C.artifacts, null, "demo");
      expect(r.finalState).toBe("UNKNOWN");
      expect(r.confidence).toBe("low");
      expect(r.rulesFired).toContain("INSUFFICIENT_EVIDENCE_REFUSAL");
    });
  });
});
