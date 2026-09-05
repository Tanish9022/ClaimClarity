import { describe, expect, it } from "vitest";
import { ArtifactSchema } from "@/lib/schemas";

describe("AI extraction guardrail & schema integrity", () => {
  it("rejects malformed extracted evidence before reconciliation", () => {
    // Missing required fields
    expect(ArtifactSchema.array().safeParse([{ source: "sms", text: "x" }]).success).toBe(false);

    // Unexpected extraneous fields injected
    expect(
      ArtifactSchema.array().safeParse([
        {
          id: "x",
          source: "sms",
          channelDetail: null,
          text: "x",
          date: null,
          status: null,
          claimId: null,
          claimType: null,
          amount: null,
          ambiguity: null,
          extractionConfidence: "high",
          fileName: null,
          mimeType: null,
          dataBase64: null,
          unexpected: true
        }
      ]).success
    ).toBe(false);
  });

  it("validates properly typed extracted observations", () => {
    const valid = ArtifactSchema.safeParse({
      id: "art-1",
      source: "new_tracker",
      channelDetail: "Unified Member Portal Tracker",
      text: "Claim CLM-DEMO-4821 Settled",
      date: "2026-07-12",
      status: "Settled",
      claimId: "CLM-DEMO-4821",
      claimType: "Form 31",
      amount: "₹45,000",
      ambiguity: null,
      extractionConfidence: "high",
      fileName: null,
      mimeType: null,
      dataBase64: null
    });
    expect(valid.success).toBe(true);
  });
});
