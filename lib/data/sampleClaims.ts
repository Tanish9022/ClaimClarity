import type { Artifact } from "@/lib/schemas";

export type SampleClaimKey = "CASE_A" | "CASE_B" | "CASE_C" | "CASE_CONFLICT";

export type SampleClaim = {
  caseId: SampleClaimKey;
  title: string;
  subtitle: string;
  conflictPreview: string;
  memberName: string | null;
  artifacts: Artifact[];
};

const makeSampleArtifact = (
  id: string,
  source: Artifact["source"],
  text: string,
  date: string | null,
  status: string | null,
  claimId: string | null,
  amount: string | null = null,
  claimType: string | null = null
): Artifact => ({
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
});

export const sampleClaims: Record<SampleClaimKey, SampleClaim> = {
  CASE_A: {
    caseId: "CASE_A",
    title: "Why do my records disagree?",
    subtitle: "Older trackers show Under Process, but a newer passbook record shows credit.",
    conflictPreview: "Portal → Processing · SMS → Processing · Passbook → ₹45,000 credited",
    memberName: "Rohan Sharma",
    artifacts: [
      makeSampleArtifact("a-portal", "new_tracker", "Claim CLM-DEMO-4821 (Form 31): Claim Submitted At Portal", "2026-07-03", "Claim Submitted At Portal", "CLM-DEMO-4821", null, "Form 31"),
      makeSampleArtifact("a-legacy", "old_tracker", "Claim CLM-DEMO-4821: Under Process at Field Office", "2026-07-03", "Under Process", "CLM-DEMO-4821", null, "Form 31"),
      makeSampleArtifact("a-sms", "sms", "Your EPFO claim CLM-DEMO-4821 has been received and is under process.", "2026-07-05", "Under Process", "CLM-DEMO-4821", null, "Form 31"),
      makeSampleArtifact("a-passbook", "passbook", "Claim CLM-DEMO-4821 Settled. ₹45,000 credited to bank account.", "2026-07-13", "₹45,000 credited", "CLM-DEMO-4821", "₹45,000", "Form 31")
    ]
  },
  CASE_B: {
    caseId: "CASE_B",
    title: "It says processing. Was I already paid?",
    subtitle: "Full chronological progression from initial submission to verified credit.",
    conflictPreview: "Submitted → Processing → Settled → ₹52,000 Credited",
    memberName: "Asha Verma",
    artifacts: [
      makeSampleArtifact("b-submit", "new_tracker", "Claim CLM-DEMO-7318 submitted at unified portal", "2026-07-07", "Submitted", "CLM-DEMO-7318", "₹52,000", "Form 19"),
      makeSampleArtifact("b-old", "old_tracker", "Claim CLM-DEMO-7318: Under Process", "2026-07-08", "Under Process", "CLM-DEMO-7318", "₹52,000", "Form 19"),
      makeSampleArtifact("b-settled", "new_tracker", "Claim CLM-DEMO-7318 Settled by Field Office", "2026-07-12", "Settled", "CLM-DEMO-7318", "₹52,000", "Form 19"),
      makeSampleArtifact("b-bank", "bank", "Synthetic bank credit of ₹52,000 for EPFO claim CLM-DEMO-7318 received", "2026-07-13", "Credit received", "CLM-DEMO-7318", "₹52,000", "Form 19")
    ]
  },
  CASE_C: {
    caseId: "CASE_C",
    title: "Can you tell what happened?",
    subtitle: "Vague, undated notification with no claim ID or verifiable status.",
    conflictPreview: "SMS: 'Your request has been received.' (No date · No claim ID)",
    memberName: null,
    artifacts: [
      makeSampleArtifact("c-vague", "sms", "Your request has been received.", null, null, null)
    ]
  },
  CASE_CONFLICT: {
    caseId: "CASE_CONFLICT",
    title: "Two records give incompatible outcomes",
    subtitle: "Official record shows Rejection, but a subsequent record indicates Credit.",
    conflictPreview: "Tracker → Rejected · Bank → ₹30,000 Credited",
    memberName: "Vikram Malhotra",
    artifacts: [
      makeSampleArtifact("d-sub", "new_tracker", "Claim CLM-DEMO-9912 submitted", "2026-07-03", "Submitted", "CLM-DEMO-9912"),
      makeSampleArtifact("d-proc", "old_tracker", "Claim CLM-DEMO-9912 Under Process", "2026-07-06", "Under Process", "CLM-DEMO-9912"),
      makeSampleArtifact("d-rej", "new_tracker", "Claim CLM-DEMO-9912 Rejected: Signature mismatch", "2026-07-10", "Rejected", "CLM-DEMO-9912"),
      makeSampleArtifact("d-bank", "bank", "Bank credit of ₹30,000 received referencing EPFO CLM-DEMO-9912", "2026-07-12", "Credit received", "CLM-DEMO-9912", "₹30,000")
    ]
  }
};
