import { z } from "zod";

export const CanonicalStatusSchema = z.enum([
  "SUBMITTED",
  "PROCESSING",
  "APPROVED",
  "SETTLED",
  "REJECTED",
  "CREDITED",
  "UNKNOWN"
]);
export type CanonicalStatus = z.infer<typeof CanonicalStatusSchema>;

export const SemanticClassSchema = z.enum(["IN_FLIGHT", "TERMINAL", "UNKNOWN"]);
export type SemanticClass = z.infer<typeof SemanticClassSchema>;

export const EventTypeSchema = z.enum([
  "informational",
  "lifecycle_milestone",
  "terminal_outcome",
  "financial_outcome"
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const SourceSchema = z.enum([
  "new_tracker",
  "old_tracker",
  "passbook",
  "sms",
  "bank",
  "other"
]);
export type Source = z.infer<typeof SourceSchema>;

export const ProvenanceSchema = z.object({
  source: SourceSchema,
  channelDetail: z.string().nullable().default(null),
  rawSnippet: z.string().max(20_000),
  artifactId: z.string().max(80),
  extractionConfidence: ConfidenceLevelSchema.default("high")
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const ArtifactSchema = z.object({
  id: z.string().min(1).max(80),
  source: SourceSchema,
  channelDetail: z.string().max(200).nullable().default(null),
  text: z.string().min(1).max(20_000),
  date: z.string().nullable().default(null),
  status: z.string().max(160).nullable().default(null),
  claimId: z.string().max(100).nullable().default(null),
  claimType: z.string().max(100).nullable().default(null),
  amount: z.string().max(60).nullable().default(null),
  ambiguity: z.string().max(500).nullable().default(null),
  extractionConfidence: ConfidenceLevelSchema.nullable().default("high"),
  fileName: z.string().max(180).nullable().default(null),
  mimeType: z.string().max(100).nullable().default(null),
  dataBase64: z.string().max(7_000_000).nullable().default(null)
}).strict();
export type Artifact = z.infer<typeof ArtifactSchema>;

export const AnalyzeRequestSchema = z.object({
  caseId: z.enum(["CASE_A", "CASE_B", "CASE_C", "CASE_CONFLICT"]).optional(),
  artifacts: z.array(ArtifactSchema).min(1).max(12).optional()
}).strict().refine(value => value.caseId || value.artifacts, "Choose a sample or add evidence to analyze.");

export const ClaimEventSchema = z.object({
  artifactId: z.string(),
  source: SourceSchema,
  channelDetail: z.string().nullable().default(null),
  date: z.string().nullable(),
  rawStatus: z.string().nullable(),
  normalizedState: CanonicalStatusSchema,
  semanticClass: SemanticClassSchema,
  eventType: EventTypeSchema,
  claimId: z.string().nullable().default(null),
  claimType: z.string().nullable().default(null),
  amount: z.string().nullable().default(null),
  ambiguity: z.string().nullable().default(null),
  extractionConfidence: ConfidenceLevelSchema.default("high"),
  provenance: ProvenanceSchema,
  detail: z.string(), // Preserved original/raw text snippet
  isStale: z.boolean().default(false)
});
export type ClaimEvent = z.infer<typeof ClaimEventSchema>;

export const ClaimIdentitySchema = z.object({
  claimId: z.string().nullable(),
  claimType: z.string().nullable(),
  amount: z.string().nullable(),
  identityStatus: z.enum(["MATCHED", "INCOMPLETE", "CONFLICT"])
});
export type ClaimIdentity = z.infer<typeof ClaimIdentitySchema>;

export const ConflictSchema = z.object({
  type: z.enum([
    "DIFFERENT_STAGES",
    "STALE_OBSERVATION",
    "IDENTIFIER_MISMATCH",
    "TERMINAL_CONTRADICTION",
    "CHRONOLOGY_REGRESSION",
    "MISSING_IDENTITY"
  ]),
  severity: z.enum(["blocking", "warning", "informational"]).default("warning"),
  message: z.string(),
  artifactIds: z.array(z.string()).min(1)
});
export type Conflict = z.infer<typeof ConflictSchema>;

export const CompetingStateEvaluationSchema = z.object({
  state: CanonicalStatusSchema,
  evaluated: z.boolean(),
  status: z.enum(["selected", "superseded", "unsupported", "conflicted"]),
  reasonNotChosen: z.string(),
  relevantArtifactIds: z.array(z.string())
});
export type CompetingStateEvaluation = z.infer<typeof CompetingStateEvaluationSchema>;

export const ReconciliationTraceSchema = z.object({
  supportingObservations: z.array(z.string()),
  staleObservations: z.array(z.string()),
  conflictsFound: z.array(ConflictSchema),
  uncertainties: z.array(z.string()),
  rulesFired: z.array(z.string()),
  winningStateRationale: z.string(),
  competingStatesEvaluated: z.array(CompetingStateEvaluationSchema)
});
export type ReconciliationTrace = z.infer<typeof ReconciliationTraceSchema>;

export const ReconciliationResultSchema = z.object({
  finalState: CanonicalStatusSchema,
  confidence: ConfidenceLevelSchema,
  reason: z.string(),
  supportingEvidence: z.array(ClaimEventSchema),
  conflictingEvidence: z.array(ConflictSchema),
  uncertainties: z.array(z.string()),
  rulesFired: z.array(z.string()),
  recommendedAction: z.string(),
  doNotDo: z.string().nullable(),
  reconciliationTrace: ReconciliationTraceSchema,

  // Full backward compatibility aliases for existing UI and API callers
  bestSupportedState: CanonicalStatusSchema,
  reasons: z.array(z.string()),
  ruleFired: z.string(),
  events: z.array(ClaimEventSchema),
  conflicts: z.array(ConflictSchema),
  claimIdentity: ClaimIdentitySchema,
  memberName: z.string().nullable(),
  evidenceCount: z.number().int().nonnegative(),
  analysisMode: z.enum(["demo", "gemini"])
});
export type ReconciliationResult = z.infer<typeof ReconciliationResultSchema>;
