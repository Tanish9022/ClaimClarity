import { GoogleGenAI } from "@google/genai";
import { ArtifactSchema, type Artifact } from "@/lib/schemas";
import { EvidenceExtractionError } from "@/lib/ai/errors";

const instruction = `You are an evidence extraction engine for ClaimClarity.
Your ONLY role is extracting explicit facts directly present in the supplied user evidence.
NEVER decide the final claim state.
NEVER extrapolate or invent dates, statuses, claim IDs, claim types, government actions, or outcomes.
If information is missing, set it to null.
If evidence is vague or ambiguous, explicitly note the ambiguity in the ambiguity field.
Assign extractionConfidence as "high", "medium", or "low" based on how legible and explicit the original record is.

Return strict JSON with an "artifacts" array. Each artifact must strictly match this structure:
{
  "id": string,
  "source": "new_tracker" | "old_tracker" | "passbook" | "sms" | "bank" | "other",
  "channelDetail": string | null,
  "text": string,
  "date": string | null (ISO format YYYY-MM-DD if date is explicit, otherwise null),
  "status": string | null (exact status phrase in the evidence),
  "claimId": string | null,
  "claimType": string | null,
  "amount": string | null,
  "ambiguity": string | null,
  "extractionConfidence": "high" | "medium" | "low",
  "fileName": string | null,
  "mimeType": string | null,
  "dataBase64": null
}`;

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new EvidenceExtractionError("TIMEOUT", "Gemini took too long to analyze this evidence. Please try again.")),
        ms
      )
    )
  ]);
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function extractEvidence(artifacts: Artifact[]): Promise<Artifact[]> {
  if (!process.env.GEMINI_API_KEY) return artifacts;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts = artifacts.flatMap(a => {
    const text = { text: `Artifact metadata and pasted text:\n${JSON.stringify({ ...a, dataBase64: null })}` };
    return a.dataBase64 && a.mimeType
      ? [text, { inlineData: { mimeType: a.mimeType, data: a.dataBase64 } }]
      : [text];
  });

  try {
    const response = await timeout(
      ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: instruction,
          responseMimeType: "application/json"
        }
      }),
      60_000
    );

    if (!response.text?.trim()) {
      throw new EvidenceExtractionError("MALFORMED", "Gemini returned no usable evidence extraction. Please try again.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(response.text);
    } catch {
      throw new EvidenceExtractionError("MALFORMED", "Gemini returned an unreadable evidence extraction. Please try again.");
    }

    const validated = ArtifactSchema.array().safeParse((parsed as { artifacts?: unknown }).artifacts);
    if (!validated.success) {
      throw new EvidenceExtractionError("MALFORMED", "Gemini returned evidence in an unexpected format. Please try again.");
    }

    return validated.data.map((artifact, index) => ({
      ...artifact,
      id: artifacts[index]?.id || artifact.id,
      fileName: artifacts[index]?.fileName || artifact.fileName,
      mimeType: artifacts[index]?.mimeType || artifact.mimeType,
      dataBase64: null
    }));
  } catch (error) {
    if (error instanceof EvidenceExtractionError) throw error;
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status: unknown }).status) : 0;
    if (status === 429) throw new EvidenceExtractionError("RATE_LIMIT", "Analysis is temporarily busy. Please try again in a moment.");
    throw new EvidenceExtractionError("PROVIDER", "Gemini could not analyze this evidence right now. Please try again.");
  }
}
