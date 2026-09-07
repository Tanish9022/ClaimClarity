import { describe, expect, it } from "vitest";
import { reconcileClaim } from "@/lib/reconciliation/reconcileClaim";
import { generateDossierPDF } from "@/lib/documents/dossierGenerator";
import type { Artifact } from "@/lib/schemas";

describe("Package 5: Dossier PDF Generator & Integrity", () => {
  const sampleArtifacts: Artifact[] = [
    {
      id: "art-1",
      source: "new_tracker",
      text: "Claim ID CLM-DEMO-4821 Form 19 Settled on 2026-02-10",
      date: "2026-02-10",
      status: "Settled",
      claimId: "CLM-DEMO-4821",
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
      text: "NEFT-EPFO ₹45,000 credited on 2026-02-12 for CLM-DEMO-4821",
      date: "2026-02-12",
      status: "Credited",
      claimId: "CLM-DEMO-4821",
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

  it("generates a valid, well-formed PDF 1.4 binary buffer", () => {
    const result = reconcileClaim(sampleArtifacts, "Ramesh Kumar");
    const pdfBuffer = generateDossierPDF(result, "en");

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    const pdfString = pdfBuffer.toString("binary");

    // Standard PDF 1.4 header
    expect(pdfString.startsWith("%PDF-1.4")).toBe(true);

    // Standard PDF structural elements
    expect(pdfString).toContain("/Type /Catalog");
    expect(pdfString).toContain("/Type /Pages");
    expect(pdfString).toContain("/Type /Page");
    expect(pdfString).toContain("xref");
    expect(pdfString).toContain("trailer");
    expect(pdfString).toContain("%%EOF");
  });

  it("includes required dossier sections, title, and independent disclaimer", () => {
    const result = reconcileClaim(sampleArtifacts, "Ramesh Kumar");
    const pdfBuffer = generateDossierPDF(result, "en");
    const pdfString = pdfBuffer.toString("binary");

    // Title and headings
    expect(pdfString).toContain("CLAIMCLARITY EVIDENCE & GRIEVANCE SUPPORT DOSSIER");
    expect(pdfString).toContain("CASE SUMMARY");
    expect(pdfString).toContain("RECONCILIATION ASSESSMENT");
    expect(pdfString).toContain("VERIFICATION MATRIX");
    expect(pdfString).toContain("EVIDENCE SOURCE INDEX");

    // Independent disclaimer
    expect(pdfString).toContain("independent evidence");
    expect(pdfString).toContain("Not an official EPFO");
  });

  it("generates PDF in Hindi without crash or corruption", () => {
    const result = reconcileClaim(sampleArtifacts, "रमेश कुमार");
    const pdfBuffer = generateDossierPDF(result, "hi");

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.toString("binary").startsWith("%PDF-1.4")).toBe(true);
  });

  it("is deterministic across repeated invocations", () => {
    const result = reconcileClaim(sampleArtifacts, "Ramesh Kumar");
    const buffer1 = generateDossierPDF(result, "en");
    const buffer2 = generateDossierPDF(result, "en");

    expect(buffer1.length).toBe(buffer2.length);
    expect(buffer1.toString("binary")).toBe(buffer2.toString("binary"));
  });

  it("contains ZERO forbidden Gemini / prototype / MVP terms in generated PDF output", () => {
    const result = reconcileClaim(sampleArtifacts, "Ramesh Kumar");
    const pdfBuffer = generateDossierPDF(result, "en");
    const pdfString = pdfBuffer.toString("binary");

    expect(pdfString).not.toMatch(/\b(Google\s+)?Gemini\b/i);
    expect(pdfString).not.toMatch(/\bprototypes?\b/i);
    expect(pdfString).not.toMatch(/\bMVP\b/i);
    expect(pdfString).not.toMatch(/\bminimum\s+viable\s+product\b/i);
  });
});
