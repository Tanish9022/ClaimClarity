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

export const RejectionCategorySchema = z.enum([
  "REJ_KYC_IDENTITY_MISMATCH",
  "REJ_BANK_ACCOUNT_MISMATCH",
  "REJ_SERVICE_ELIGIBILITY",
  "REJ_DUPLICATE_CLAIM",
  "REJ_MEMBER_SIGNATURE_DOCS",
  "REJ_CONTRIBUTION_WAGE_DISCREPANCY",
  "REJ_ESTABLISHMENT_CLOSED_UNATTACHED",
  "REJ_FORM_PURPOSE_INELIGIBLE",
  "REJ_FATHER_SPOUSE_NAME_MISMATCH",
  "REJ_TRANSFER_ANNEXURE_K",
  "REJ_TECHNICAL_SYSTEM_ERROR",
  "REJ_UNSPECIFIED"
]);
export type RejectionCategory = z.infer<typeof RejectionCategorySchema>;

export const RejectionCertaintySchema = z.enum(["exact", "supported", "probable", "unspecified"]);
export type RejectionCertainty = z.infer<typeof RejectionCertaintySchema>;

export const ResolutionStageSchema = z.enum(["INFORM", "PREVENT_PROTECT", "REMEDIATE", "ESCALATE"]);
export type ResolutionStage = z.infer<typeof ResolutionStageSchema>;

export const RejectionDiagnosticSchema = z.object({
  category: RejectionCategorySchema,
  rawText: z.string(),
  sourceArtifactId: z.string(),
  sourceType: SourceSchema,
  channelDetail: z.string().nullable(),
  certainty: RejectionCertaintySchema,
  matchingRuleId: z.string(),
  matchedKeywords: z.array(z.string()),
  diagnosticTitle: z.object({ en: z.string(), hi: z.string() }),
  interpretation: z.object({ en: z.string(), hi: z.string() }),
  resolutionGuidance: z.object({
    stage: ResolutionStageSchema,
    prerequisites: z.array(z.string()),
    action: z.object({ en: z.string(), hi: z.string() }),
    doNotDo: z.object({ en: z.string(), hi: z.string() }).nullable(),
    escalationCondition: z.object({ en: z.string(), hi: z.string() }).nullable()
  })
});
export type RejectionDiagnostic = z.infer<typeof RejectionDiagnosticSchema>;

export const TimingAssessmentSchema = z.object({
  submissionDate: z.string().nullable(),
  latestObservationDate: z.string().nullable(),
  elapsedDaysFromSubmission: z.number().nullable(),
  isBeyondBenchmark: z.boolean(),
  isStalePending: z.boolean(),
  isEscalationEligible: z.boolean(),
  benchmarkDays: z.number(),
  timingNotice: z.object({ en: z.string(), hi: z.string() }).nullable()
});
export type TimingAssessment = z.infer<typeof TimingAssessmentSchema>;

// Package 4: Multi-Form & Entity Partitioning Schemas
export const FormTypeSchema = z.enum([
  "Form 19",
  "Form 10C",
  "Form 31",
  "Form 13",
  "Form 10D",
  "Form 20",
  "FORM_UNSPECIFIED"
]);
export type FormType = z.infer<typeof FormTypeSchema>;

export const ContextResolutionStatusSchema = z.enum([
  "CONFIDENT",
  "PROBABLE",
  "UNRESOLVED",
  "CONFLICTED"
]);
export type ContextResolutionStatus = z.infer<typeof ContextResolutionStatusSchema>;

export const ClaimContextSchema = z.object({
  contextId: z.string(),
  claimReference: z.string().nullable(),
  rawClaimReference: z.string().nullable(),
  formType: FormTypeSchema,
  memberId: z.string().nullable().default(null),
  establishmentId: z.string().nullable().default(null),
  evidenceArtifactIds: z.array(z.string()),
  resolutionStatus: ContextResolutionStatusSchema,
  signals: z.array(z.string()),
  conflicts: z.array(z.string())
});
export type ClaimContext = z.infer<typeof ClaimContextSchema>;

export const EvidencePartitionResultSchema = z.object({
  contexts: z.array(ClaimContextSchema),
  unresolvedArtifactIds: z.array(z.string()),
  hasMultiClaim: z.boolean(),
  hasMultiForm: z.boolean(),
  hasConflictingEntities: z.boolean(),
  partitionSummary: z.object({ en: z.string(), hi: z.string() })
});
export type EvidencePartitionResult = z.infer<typeof EvidencePartitionResultSchema>;

// Package 4: Payment Attribution Schemas
export const PaymentAttributionOutcomeSchema = z.enum([
  "UNATTRIBUTED",
  "CANDIDATE",
  "ATTRIBUTED",
  "CONFLICTED"
]);
export type PaymentAttributionOutcome = z.infer<typeof PaymentAttributionOutcomeSchema>;

export const PaymentEventSchema = z.object({
  eventId: z.string(),
  sourceArtifactId: z.string(),
  amount: z.string().nullable(),
  numericAmount: z.number().nullable(),
  date: z.string().nullable(),
  transactionReference: z.string().nullable(),
  rawNarration: z.string(),
  senderReference: z.string().nullable(),
  attributionStatus: PaymentAttributionOutcomeSchema,
  attributedContextId: z.string().nullable(),
  candidateContextIds: z.array(z.string()),
  matchedSignals: z.array(z.string()),
  unmatchedSignals: z.array(z.string()),
  explanation: z.object({ en: z.string(), hi: z.string() })
});
export type PaymentEvent = z.infer<typeof PaymentEventSchema>;

export const PaymentAttributionResultSchema = z.object({
  payments: z.array(PaymentEventSchema),
  hasUnattributedPayment: z.boolean(),
  hasConflictedPayment: z.boolean(),
  hasCandidatePayment: z.boolean(),
  hasAttributedPayment: z.boolean()
});
export type PaymentAttributionResult = z.infer<typeof PaymentAttributionResultSchema>;

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

  // Package 3 Diagnostic & Timing extensions
  diagnostic: RejectionDiagnosticSchema.nullable().optional(),
  timingAssessment: TimingAssessmentSchema.nullable().optional(),

  // Package 4 Partitioning & Attribution extensions
  partitionResult: EvidencePartitionResultSchema.nullable().optional(),
  paymentAttribution: PaymentAttributionResultSchema.nullable().optional(),

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
