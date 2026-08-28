import { z } from "zod";

export const CanonicalStatusSchema = z.enum(["SUBMITTED", "PROCESSING", "APPROVED", "SETTLED", "REJECTED", "CREDITED", "UNKNOWN"]);
export type CanonicalStatus = z.infer<typeof CanonicalStatusSchema>;
export const SourceSchema = z.enum(["new_tracker", "old_tracker", "passbook", "sms", "bank", "other"]);
export type Source = z.infer<typeof SourceSchema>;
export const ArtifactSchema = z.object({
  id: z.string().min(1).max(80), source: SourceSchema, text: z.string().min(1).max(20_000),
  date: z.string().date().nullable().default(null), status: z.string().max(160).nullable().default(null), claimId: z.string().max(100).nullable().default(null), claimType: z.string().max(100).nullable().default(null), amount: z.string().max(60).nullable().default(null), ambiguity: z.string().max(500).nullable().default(null), fileName: z.string().max(180).nullable().default(null), mimeType: z.string().max(100).nullable().default(null), dataBase64: z.string().max(7_000_000).nullable().default(null),
}).strict();
export type Artifact = z.infer<typeof ArtifactSchema>;
export const AnalyzeRequestSchema = z.object({ caseId: z.enum(["CASE_A", "CASE_B", "CASE_C"]).optional(), artifacts: z.array(ArtifactSchema).min(1).max(8).optional() }).strict().refine(value => value.caseId || value.artifacts, "Choose a sample or add evidence to analyze.");
export const ClaimEventSchema = z.object({ artifactId: z.string(), source: SourceSchema, date: z.string().nullable(), rawStatus: z.string().nullable(), normalizedState: CanonicalStatusSchema, detail: z.string(), ambiguity: z.string().nullable() });
export type ClaimEvent = z.infer<typeof ClaimEventSchema>;
export const ClaimIdentitySchema = z.object({ claimId: z.string().nullable(), claimType: z.string().nullable(), amount: z.string().nullable() });
export type ClaimIdentity = z.infer<typeof ClaimIdentitySchema>;
export const ConflictSchema = z.object({ type: z.enum(["DIFFERENT_STAGES", "STALE_OBSERVATION", "IDENTIFIER_MISMATCH"]), message: z.string(), artifactIds: z.array(z.string()).min(1) });
export type Conflict = z.infer<typeof ConflictSchema>;
export const ReconciliationResultSchema = z.object({ claimIdentity: ClaimIdentitySchema, memberName: z.string().nullable(), events: z.array(ClaimEventSchema), conflicts: z.array(ConflictSchema), bestSupportedState: CanonicalStatusSchema, confidence: z.enum(["high", "medium", "low"]), reasons: z.array(z.string()), recommendedAction: z.string(), doNotDo: z.string().nullable(), uncertainties: z.array(z.string()), ruleFired: z.string(), evidenceCount: z.number().int().nonnegative(), analysisMode: z.enum(["demo", "gemini"]) });
export type ReconciliationResult = z.infer<typeof ReconciliationResultSchema>;
