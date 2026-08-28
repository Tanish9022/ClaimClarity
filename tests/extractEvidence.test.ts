import { describe, expect, it } from "vitest";
import { ArtifactSchema } from "@/lib/schemas";
describe("AI extraction guardrail", () => { it("rejects malformed extracted evidence before reconciliation", () => { expect(ArtifactSchema.array().safeParse([{ source:"sms", text:"x" }]).success).toBe(false); expect(ArtifactSchema.array().safeParse([{ id:"x", source:"sms", text:"x", date:null,status:null,claimId:null,claimType:null,amount:null,ambiguity:null,fileName:null,mimeType:null,dataBase64:null,unexpected:true }]).success).toBe(false); }); });
