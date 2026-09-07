import { describe, expect, it } from "vitest";
import { reconcileClaim } from "@/lib/reconciliation/reconcileClaim";
import { buildVerificationMatrix, buildDossierData, maskSensitivePII } from "@/lib/documents/dossierModel";
import type { Artifact } from "@/lib/schemas";

describe("Package 5: Dossier Model & Verification Matrix", () => {
  describe("maskSensitivePII", () => {
    it("masks 12-digit Aadhaar-like numbers", () => {
      expect(maskSensitivePII("Member Aadhaar 1234 5678 9012 linked")).toBe("Member Aadhaar XXXX-XXXX-9012 linked");
      expect(maskSensitivePII("Aadhaar 123456789012")).toBe("Aadhaar XXXX-XXXX-9012");
    });

    it("masks 10-character PAN-like numbers", () => {
      expect(maskSensitivePII("PAN ABCDE1234F verified")).toBe("PAN XXXXX1234F verified");
    });

    it("masks 10-digit Indian phone numbers", () => {
      expect(maskSensitivePII("SMS sent to 9876543210")).toBe("SMS sent to XXXXXX3210");
    });

    it("masks long bank account numbers", () => {
      expect(maskSensitivePII("A/C 12345678901234 credited")).toBe("A/C XXXXXX1234 credited");
    });

    it("preserves claim IDs and form names", () => {
      expect(maskSensitivePII("Claim ID CLM-DEMO-4821 for Form 19")).toBe("Claim ID CLM-DEMO-4821 for Form 19");
    });
  });

  describe("buildVerificationMatrix", () => {
    it("constructs structured verification matrix for single claim", () => {
      const artifacts: Artifact[] = [
        {
          id: "art-1",
          source: "new_tracker",
          text: "Claim ID CLM-4821 Form 19 status Settled on 2026-02-10",
          date: "2026-02-10",
          status: "Settled",
          claimId: "CLM-4821",
          claimType: "Form 19",
          amount: "₹45,000",
          ambiguity: null,
          extractionConfidence: "high",
          channelDetail: "Portal",
          fileName: null,
          mimeType: null,
          dataBase64: null
        },
        {
          id: "art-2",
          source: "bank",
          text: "NEFT-EPFO ₹45,000 credited on 2026-02-12 for CLM-4821",
          date: "2026-02-12",
          status: "Credited",
          claimId: "CLM-4821",
          claimType: null,
          amount: "₹45,000",
          ambiguity: null,
          extractionConfidence: "high",
          channelDetail: "Passbook",
          fileName: null,
          mimeType: null,
          dataBase64: null
        }
      ];

      const result = reconcileClaim(artifacts, "Ramesh Kumar");
      const matrix = buildVerificationMatrix(result, "en");

      expect(matrix.totalChecks).toBeGreaterThanOrEqual(3);
      expect(matrix.verifiedCount).toBeGreaterThanOrEqual(2);
      expect(matrix.conflictsCount).toBe(0);

      // Check Claim Reference Row
      const claimRow = matrix.groups[0].rows.find(r => r.category.includes("Claim Reference"));
      expect(claimRow).toBeDefined();
      expect(claimRow?.observedFact).toContain("CLM-4821");
      expect(claimRow?.status).toBe("VERIFIED");

      // Check Payment Attribution Row
      const payRow = matrix.groups[0].rows.find(r => r.category.includes("Payment Attribution"));
      expect(payRow).toBeDefined();
      expect(payRow?.status).toBe("VERIFIED");
    });

    it("handles multi-claim contexts with separated matrix groups", () => {
      const artifacts: Artifact[] = [
        {
          id: "art-1",
          source: "new_tracker",
          text: "Claim CLM-AAA Form 19 Settled on 2026-01-10",
          date: "2026-01-10",
          status: "Settled",
          claimId: "CLM-AAA",
          claimType: "Form 19",
          amount: "₹30,000",
          ambiguity: null,
          extractionConfidence: "high",
          channelDetail: null,
          fileName: null,
          mimeType: null,
          dataBase64: null
        },
        {
          id: "art-2",
          source: "sms",
          text: "Claim CLM-BBB Form 10C Rejected due to signature mismatch on 2026-01-15",
          date: "2026-01-15",
          status: "Rejected",
          claimId: "CLM-BBB",
          claimType: "Form 10C",
          amount: null,
          ambiguity: null,
          extractionConfidence: "high",
          channelDetail: null,
          fileName: null,
          mimeType: null,
          dataBase64: null
        }
      ];

      const result = reconcileClaim(artifacts);
      const matrix = buildVerificationMatrix(result, "en");

      expect(matrix.groups.length).toBeGreaterThanOrEqual(2);
      expect(matrix.groups[0].claimReference).toBe("CLM-AAA");
      expect(matrix.groups[1].claimReference).toBe("CLM-BBB");
    });
  });

  describe("buildDossierData", () => {
    it("assembles complete 11-section structured dossier data", () => {
      const artifacts: Artifact[] = [
        {
          id: "art-1",
          source: "old_tracker",
          text: "Claim ID CLM-8888 Form 31 Submitted on 2026-01-01",
          date: "2026-01-01",
          status: "Submitted",
          claimId: "CLM-8888",
          claimType: "Form 31",
          amount: null,
          ambiguity: null,
          extractionConfidence: "high",
          channelDetail: null,
          fileName: null,
          mimeType: null,
          dataBase64: null
        }
      ];

      const result = reconcileClaim(artifacts, "Sita Sharma");
      const dossier = buildDossierData(result, "en");

      expect(dossier.title).toBe("ClaimClarity Evidence & Grievance Support Dossier");
      expect(dossier.caseSummary.length).toBeGreaterThanOrEqual(5);
      expect(dossier.timeline.length).toBe(1);
      expect(dossier.sourceIndex.length).toBe(1);
      expect(dossier.disclaimer).toContain("independent evidence-organizing aid");
      expect(dossier.disclaimer).toContain("not an official EPFiGMS submission");
    });
  });
});
