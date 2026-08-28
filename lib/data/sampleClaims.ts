import type { Artifact } from "@/lib/schemas";

export type SampleClaim = { caseId: "CASE_A" | "CASE_B" | "CASE_C"; memberName: string | null; artifacts: Artifact[] };
const artifact = (id: string, source: Artifact["source"], text: string, date: string | null, status: string | null, claimId: string | null, claimType: string | null = null): Artifact => ({ id, source, text, date, status, claimId, claimType, amount: null, ambiguity: null, fileName: null, mimeType: null, dataBase64: null });
export const sampleClaims: Record<SampleClaim["caseId"], SampleClaim> = {
  CASE_A: { caseId: "CASE_A", memberName: "Rohan Sharma", artifacts: [
    artifact("a-new", "new_tracker", "Claim CLM-DEMO-4821 (Form 31): Claim Submitted At Portal", "2026-07-03", "Claim Submitted At Portal", "CLM-DEMO-4821", "Form 31"), artifact("a-old", "old_tracker", "Claim CLM-DEMO-4821: Under Process", "2026-07-03", "Under Process", "CLM-DEMO-4821", "Form 31"), artifact("a-passbook", "passbook", "Claim CLM-DEMO-4821 status: Pending", "2026-07-04", "Pending", "CLM-DEMO-4821", "Form 31"), artifact("a-sms", "sms", "Your EPFO claim has been received and is under process. Claim: CLM-DEMO-4821", "2026-07-05", "Under Process", "CLM-DEMO-4821", "Form 31"),
  ] },
  CASE_B: { caseId: "CASE_B", memberName: "Asha Verma", artifacts: [artifact("b-submit", "new_tracker", "Claim CLM-DEMO-7318 submitted", "2026-07-07", "Submitted", "CLM-DEMO-7318"), artifact("b-old", "old_tracker", "Claim CLM-DEMO-7318: Under Process", "2026-07-08", "Under Process", "CLM-DEMO-7318"), artifact("b-settled", "new_tracker", "Claim CLM-DEMO-7318 Settled", "2026-07-12", "Settled", "CLM-DEMO-7318"), artifact("b-bank", "bank", "Synthetic bank credit for EPFO claim CLM-DEMO-7318 received", "2026-07-13", "Credit received", "CLM-DEMO-7318")] },
  CASE_C: { caseId: "CASE_C", memberName: null, artifacts: [artifact("c-vague", "sms", "Your request has been received.", null, null, null)] },
};
