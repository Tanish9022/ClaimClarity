import { NextResponse } from "next/server";
import { EvidenceExtractionError } from "@/lib/ai/errors";
import { extractEvidence, isGeminiConfigured } from "@/lib/ai/extractEvidence";
import { sampleClaims } from "@/lib/data/sampleClaims";
import { reconcileClaim } from "@/lib/reconciliation/reconcileClaim";
import { AnalyzeRequestSchema } from "@/lib/schemas";
export const runtime = "nodejs";
const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });
export async function POST(request: Request) {
  try {
    const parsed = AnalyzeRequestSchema.safeParse(await request.json() as unknown);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "The evidence request is invalid.", 400);
    const sample = parsed.data.caseId ? sampleClaims[parsed.data.caseId] : null;
    const input = sample?.artifacts || parsed.data.artifacts;
    if (!input?.length) return jsonError("Add at least one piece of evidence.", 400);
    if (!sample && !isGeminiConfigured()) return jsonError("Adding your own evidence needs Gemini analysis. The sample claims work in demo mode without a key.", 503);
    const artifacts = (!sample && isGeminiConfigured()) ? await extractEvidence(input) : input;
    return NextResponse.json(reconcileClaim(artifacts, sample?.memberName || null, (!sample && isGeminiConfigured()) ? "gemini" : "demo"));
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError("We could not read that request. Please try again.", 400);
    if (error instanceof EvidenceExtractionError) return jsonError(error.message, error.code === "RATE_LIMIT" ? 429 : error.code === "TIMEOUT" ? 504 : 502);
    return jsonError("We couldn't analyze the evidence right now. Please try again.", 500);
  }
}
