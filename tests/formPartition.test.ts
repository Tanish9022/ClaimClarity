import { describe, it, expect } from "vitest";
import {
  partitionEvidence,
  extractFormType,
  normalizeIdentifier,
  extractClaimIdentifier
} from "@/lib/entity/formPartition";
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

describe("Package 4: Form Type Extraction & Identifier Normalization", () => {
  it("extracts Form 19, 10C, 31, 13, 10D correctly", () => {
    expect(extractFormType("Claim submitted for Form 19 final settlement")).toBe("Form 19");
    expect(extractFormType("Form 10C pension withdrawal benefit claim")).toBe("Form 10C");
    expect(extractFormType("Form 31 advance application")).toBe("Form 31");
    expect(extractFormType("Form 13 transfer of account balance")).toBe("Form 13");
    expect(extractFormType("Form 10D monthly pension scheme")).toBe("Form 10D");
    expect(extractFormType("Generic EPF claim text without form")).toBe("FORM_UNSPECIFIED");
  });

  it("normalizes identifiers safely without destructive alterations", () => {
    expect(normalizeIdentifier(" clm-12345 ")).toBe("CLM-12345");
    expect(normalizeIdentifier("ABC   123  456")).toBe("ABC 123 456");
    expect(normalizeIdentifier(null)).toBeNull();
    expect(normalizeIdentifier("")).toBeNull();
  });

  it("extracts claim identifier from text when not in metadata", () => {
    const res = extractClaimIdentifier(null, "Your request for CLM-99881 has been registered.");
    expect(res.rawId).toBe("CLM-99881");
    expect(res.normalizedId).toBe("CLM-99881");
  });
});

describe("Package 4: Evidence Partitioning Engine", () => {
  it("partitions single claim consistently into one CONFIDENT context", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 submitted", "Submitted", "CLM-101", "Form 19"),
      makeArtifact("a2", "Claim CLM-101 Under Process", "Under Process", "CLM-101", "Form 19"),
      makeArtifact("a3", "Claim CLM-101 Settled", "Settled", "CLM-101", "Form 19")
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(1);
    expect(res.contexts[0].claimReference).toBe("CLM-101");
    expect(res.contexts[0].formType).toBe("Form 19");
    expect(res.contexts[0].resolutionStatus).toBe("CONFIDENT");
    expect(res.contexts[0].evidenceArtifactIds).toEqual(["a1", "a2", "a3"]);
    expect(res.unresolvedArtifactIds.length).toBe(0);
    expect(res.hasMultiClaim).toBe(false);
  });

  it("partitions multiple distinct claims into separate contexts", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 submitted", "Submitted", "CLM-101", "Form 19"),
      makeArtifact("a2", "Claim CLM-202 Form 10C submitted", "Submitted", "CLM-202", "Form 10C"),
      makeArtifact("a3", "Claim CLM-101 Settled", "Settled", "CLM-101", "Form 19"),
      makeArtifact("a4", "Claim CLM-202 Rejected", "Rejected", "CLM-202", "Form 10C")
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(2);
    expect(res.hasMultiClaim).toBe(true);
    expect(res.hasMultiForm).toBe(true);

    const ctx1 = res.contexts.find(c => c.claimReference === "CLM-101");
    const ctx2 = res.contexts.find(c => c.claimReference === "CLM-202");

    expect(ctx1).toBeDefined();
    expect(ctx1?.formType).toBe("Form 19");
    expect(ctx1?.evidenceArtifactIds).toEqual(["a1", "a3"]);

    expect(ctx2).toBeDefined();
    expect(ctx2?.formType).toBe("Form 10C");
    expect(ctx2?.evidenceArtifactIds).toEqual(["a2", "a4"]);
  });

  it("links unreferenced artifact to single existing claim context contextually", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-500 Form 31 submitted", "Submitted", "CLM-500", "Form 31"),
      makeArtifact("a2", "SMS: Your claim has been received and is under process", "Under Process", null, null)
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(1);
    expect(res.contexts[0].claimReference).toBe("CLM-500");
    expect(res.contexts[0].evidenceArtifactIds).toContain("a1");
    expect(res.contexts[0].evidenceArtifactIds).toContain("a2");
  });

  it("places unreferenced artifact into unresolvedArtifactIds when multiple contexts exist", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-101 Form 19 submitted", "Submitted", "CLM-101", "Form 19"),
      makeArtifact("a2", "Claim CLM-202 Form 10C submitted", "Submitted", "CLM-202", "Form 10C"),
      makeArtifact("a3", "Generic SMS: Your EPFO request is under review", "Under Process", null, null)
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(2);
    expect(res.unresolvedArtifactIds).toContain("a3");
  });

  it("partitions distinct form types when no explicit claim ID is present", () => {
    const artifacts = [
      makeArtifact("a1", "Form 19 claim submitted on portal", "Submitted", null, "Form 19"),
      makeArtifact("a2", "Form 10C claim under process", "Under Process", null, "Form 10C")
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(2);
    expect(res.hasMultiForm).toBe(true);
    expect(res.contexts.some(c => c.formType === "Form 19")).toBe(true);
    expect(res.contexts.some(c => c.formType === "Form 10C")).toBe(true);
  });

  it("flags CONFLICTED resolutionStatus when contradictory forms exist under the same claim ID", () => {
    const artifacts = [
      makeArtifact("a1", "Claim CLM-999 Form 19 submitted", "Submitted", "CLM-999", "Form 19"),
      makeArtifact("a2", "Claim CLM-999 Form 31 advance under process", "Under Process", "CLM-999", "Form 31")
    ];

    const res = partitionEvidence(artifacts);
    expect(res.contexts.length).toBe(1);
    expect(res.contexts[0].resolutionStatus).toBe("CONFLICTED");
    expect(res.contexts[0].conflicts.length).toBeGreaterThan(0);
  });

  it("handles empty and generic unlinked evidence safely", () => {
    const resEmpty = partitionEvidence([]);
    expect(resEmpty.contexts.length).toBe(0);
    expect(resEmpty.unresolvedArtifactIds.length).toBe(0);

    const resGeneric = partitionEvidence([
      makeArtifact("g1", "Your request is in progress.", "Under Process", null, null)
    ]);
    expect(resGeneric.contexts.length).toBe(1);
    expect(resGeneric.contexts[0].formType).toBe("FORM_UNSPECIFIED");
    expect(resGeneric.contexts[0].resolutionStatus).toBe("UNRESOLVED");
  });
});
