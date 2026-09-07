import { describe, it, expect } from "vitest";
import {
  attributePayments,
  parseNumericAmount,
  extractSenderReference,
  extractTransactionReference,
  isPaymentArtifact
} from "@/lib/reconciliation/attribution";
import { partitionEvidence } from "@/lib/entity/formPartition";
import type { Artifact } from "@/lib/schemas";

function makeArtifact(
  id: string,
  text: string,
  status: string | null = null,
  claimId: string | null = null,
  claimType: string | null = null,
  amount: string | null = null,
  source: Artifact["source"] = "new_tracker",
  date: string | null = null
): Artifact {
  return {
    id,
    source,
    channelDetail: null,
    text,
    date,
    status,
    claimId,
    claimType,
    amount,
    ambiguity: null,
    extractionConfidence: "high",
    fileName: null,
    mimeType: null,
    dataBase64: null
  };
}

describe("Package 4: Payment Utility Helpers", () => {
  it("parses numeric amounts accurately from various Indian currency formats", () => {
    expect(parseNumericAmount("₹45,000")).toBe(45000);
    expect(parseNumericAmount("Rs. 52,000.50")).toBe(52001);
    expect(parseNumericAmount("45000")).toBe(45000);
    expect(parseNumericAmount("₹ 1,25,000")).toBe(125000);
    expect(parseNumericAmount(null)).toBeNull();
    expect(parseNumericAmount("invalid")).toBeNull();
  });

  it("extracts EPFO and government disbursement sender references", () => {
    expect(extractSenderReference("NEFT-EPFO-12345 credited to account")).toBe("EPFO-NEFT");
    expect(extractSenderReference("Credit via CBIC pension")).toBe("CBIC");
    expect(extractSenderReference("Salary from private company")).toBeNull();
  });

  it("identifies payment artifacts accurately", () => {
    const bankArt = makeArtifact("b1", "Credit of ₹50,000 received", "Credit", null, null, "₹50,000", "bank");
    const trackerArt = makeArtifact("t1", "Claim under process", "Under Process", null, null, null, "new_tracker");
    expect(isPaymentArtifact(bankArt)).toBe(true);
    expect(isPaymentArtifact(trackerArt)).toBe(false);
  });
});

describe("Package 4: Deterministic Payment Attribution Engine", () => {
  it("attributes payment when narration explicitly contains claim reference (ATTRIBUTED)", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-4821 Form 19 Settled", "Settled", "CLM-4821", "Form 19", "₹45,000", "new_tracker", "2026-07-10"),
      makeArtifact("a2", "Bank credit of ₹45,000 for EPFO claim CLM-4821 received", "Credit", "CLM-4821", "Form 19", "₹45,000", "bank", "2026-07-12")
    ];

    const partition = partitionEvidence(artifacts);
    const attribution = attributePayments(artifacts, partition);

    expect(attribution.payments.length).toBe(1);
    expect(attribution.payments[0].attributionStatus).toBe("ATTRIBUTED");
    expect(attribution.payments[0].matchedSignals).toContain("SIGNAL_EXPLICIT_CLAIM_REF");
    expect(attribution.hasAttributedPayment).toBe(true);
    expect(attribution.hasUnattributedPayment).toBe(false);
  });

  it("marks payment UNATTRIBUTED when generic bank credit has no claim reference and no EPFO sender", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-4821 Form 19 Settled for ₹45,000", "Settled", "CLM-4821", "Form 19", "₹45,000", "new_tracker", "2026-07-10"),
      makeArtifact("a2", "Bank credit of ₹10,000 from ABC Corp received", "Credit", null, null, "₹10,000", "bank", "2026-07-12")
    ];

    const partition = partitionEvidence(artifacts);
    const attribution = attributePayments(artifacts, partition);

    expect(attribution.payments.length).toBe(1);
    expect(attribution.payments[0].attributionStatus).toBe("UNATTRIBUTED");
    expect(attribution.hasUnattributedPayment).toBe(true);
    expect(attribution.hasAttributedPayment).toBe(false);
  });

  it("marks payment CANDIDATE across multiple claims when amount matches one claim but lacks explicit claim ID", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 Settled for ₹40,000", "Settled", "CLM-101", "Form 19", "₹40,000", "new_tracker", "2026-07-10"),
      makeArtifact("a2", "Claim CLM-202 Form 10C Settled for ₹12,000", "Settled", "CLM-202", "Form 10C", "₹12,000", "new_tracker", "2026-07-10"),
      makeArtifact("a3", "Bank credit of ₹40,000 from EPFO-NEFT received", "Credit", null, null, "₹40,000", "bank", "2026-07-12")
    ];

    const partition = partitionEvidence(artifacts);
    const attribution = attributePayments(artifacts, partition);

    expect(attribution.payments.length).toBe(1);
    expect(attribution.payments[0].attributionStatus).toBe("CANDIDATE");
    expect(attribution.hasCandidatePayment).toBe(true);
    expect(attribution.hasAttributedPayment).toBe(false);
  });

  it("marks payment CONFLICTED when payment amount matches multiple distinct claims without explicit claim reference", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 Settled for ₹50,000", "Settled", "CLM-101", "Form 19", "₹50,000", "new_tracker", "2026-07-10"),
      makeArtifact("a2", "Claim CLM-202 Form 31 Settled for ₹50,000", "Settled", "CLM-202", "Form 31", "₹50,000", "new_tracker", "2026-07-10"),
      makeArtifact("a3", "Bank credit of ₹50,000 received", "Credit", null, null, "₹50,000", "bank", "2026-07-12")
    ];

    const partition = partitionEvidence(artifacts);
    const attribution = attributePayments(artifacts, partition);

    expect(attribution.payments.length).toBe(1);
    expect(attribution.payments[0].attributionStatus).toBe("CONFLICTED");
    expect(attribution.hasConflictedPayment).toBe(true);
  });

  it("ensures historical rejection on Claim B does not contaminate attributed payment on Claim A", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 Settled", "Settled", "CLM-101", "Form 19", "₹35,000", "new_tracker", "2026-07-10"),
      makeArtifact("a2", "Bank credit of ₹35,000 for EPFO claim CLM-101 received", "Credit", "CLM-101", "Form 19", "₹35,000", "bank", "2026-07-12"),
      makeArtifact("b1", "Claim CLM-202 Form 10C Rejected: Signature mismatch", "Rejected", "CLM-202", "Form 10C", null, "new_tracker", "2026-07-08")
    ];

    const partition = partitionEvidence(artifacts);
    const attribution = attributePayments(artifacts, partition);

    expect(partition.contexts.length).toBe(2);
    expect(attribution.payments.length).toBe(1);
    expect(attribution.payments[0].attributionStatus).toBe("ATTRIBUTED");
    expect(attribution.payments[0].attributedContextId).toBe("CTX-1");
  });
});
