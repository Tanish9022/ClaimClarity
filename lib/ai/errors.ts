export class EvidenceExtractionError extends Error {
  constructor(public readonly code: "TIMEOUT" | "RATE_LIMIT" | "PROVIDER" | "MALFORMED", message: string) {
    super(message);
    this.name = "EvidenceExtractionError";
  }
}
