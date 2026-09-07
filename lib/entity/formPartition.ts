import type {
  Artifact,
  ClaimContext,
  ContextResolutionStatus,
  EvidencePartitionResult,
  FormType
} from "@/lib/schemas";

/**
 * FORM TYPE DETECTION PATTERNS
 */
const FORM_PATTERNS: Array<{ form: FormType; regex: RegExp }> = [
  { form: "Form 19", regex: /\bform\s*19\b/i },
  { form: "Form 10C", regex: /\bform\s*10\s*c\b/i },
  { form: "Form 31", regex: /\bform\s*31\b/i },
  { form: "Form 13", regex: /\bform\s*13\b/i },
  { form: "Form 10D", regex: /\bform\s*10\s*d\b/i },
  { form: "Form 20", regex: /\bform\s*20\b/i }
];

export function extractFormType(text: string | null | undefined, explicitClaimType?: string | null): FormType {
  if (explicitClaimType) {
    const trimmed = explicitClaimType.trim();
    for (const { form, regex } of FORM_PATTERNS) {
      if (regex.test(trimmed)) return form;
    }
  }

  if (text) {
    for (const { form, regex } of FORM_PATTERNS) {
      if (regex.test(text)) return form;
    }
  }

  return "FORM_UNSPECIFIED";
}

/**
 * SAFE IDENTIFIER NORMALIZATION
 * Preserves canonical characters while standardizing whitespace and case.
 */
export function normalizeIdentifier(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Standardize uppercase and condense internal whitespace
  return trimmed.toUpperCase().replace(/\s+/g, " ");
}

/**
 * EXTRACT CLAIM ID FROM TEXT OR METADATA
 */
export function extractClaimIdentifier(
  explicitId: string | null | undefined,
  text: string
): { rawId: string | null; normalizedId: string | null } {
  if (explicitId && explicitId.trim()) {
    const raw = explicitId.trim();
    return { rawId: raw, normalizedId: normalizeIdentifier(raw) };
  }

  // Regex patterns to capture claim numbers (e.g., CLM-DEMO-4821, CLM12345, MHBAN0012345, etc.)
  const match = text.match(/\b(CLM[-_]?[A-Z0-9]+|\b[A-Z]{2}\/[A-Z0-9]{3,5}\/\d+\/\d+\/\d+)\b/i);
  if (match && match[1]) {
    const raw = match[1].trim();
    return { rawId: raw, normalizedId: normalizeIdentifier(raw) };
  }

  return { rawId: null, normalizedId: null };
}

interface ArtifactExtractedInfo {
  artifact: Artifact;
  rawClaimId: string | null;
  normalizedClaimId: string | null;
  formType: FormType;
  memberId: string | null;
  establishmentId: string | null;
}

/**
 * PARTITION EVIDENCE INTO CANDIDATE CLAIM CONTEXTS
 * Deterministic multi-stage partitioning without AI hallucination.
 */
export function partitionEvidence(artifacts: Artifact[]): EvidencePartitionResult {
  if (artifacts.length === 0) {
    return {
      contexts: [],
      unresolvedArtifactIds: [],
      hasMultiClaim: false,
      hasMultiForm: false,
      hasConflictingEntities: false,
      partitionSummary: {
        en: "No evidence artifacts provided for partitioning.",
        hi: "विभाजन के लिए कोई साक्ष्य रिकॉर्ड उपलब्ध नहीं है।"
      }
    };
  }

  // 1. Extract metadata from each artifact
  const extracted: ArtifactExtractedInfo[] = artifacts.map(a => {
    const idInfo = extractClaimIdentifier(a.claimId, a.text);
    const formType = extractFormType(a.text, a.claimType);
    return {
      artifact: a,
      rawClaimId: idInfo.rawId,
      normalizedClaimId: idInfo.normalizedId,
      formType,
      memberId: null,
      establishmentId: null
    };
  });

  // Group by distinct normalized claim identifiers
  const claimIdGroups = new Map<string, ArtifactExtractedInfo[]>();
  const unlinkedArtifacts: ArtifactExtractedInfo[] = [];

  for (const item of extracted) {
    if (item.normalizedClaimId) {
      const existing = claimIdGroups.get(item.normalizedClaimId) || [];
      existing.push(item);
      claimIdGroups.set(item.normalizedClaimId, existing);
    } else {
      unlinkedArtifacts.push(item);
    }
  }

  const contexts: ClaimContext[] = [];
  const unresolvedArtifactIds: string[] = [];

  // 2. Build contexts from explicit claim IDs
  let contextIndex = 1;
  const distinctClaimIds = Array.from(claimIdGroups.keys());

  for (const [normId, items] of claimIdGroups.entries()) {
    // Determine dominant form type for this claim context
    const formsPresent = items.map(i => i.formType).filter(f => f !== "FORM_UNSPECIFIED");
    const distinctForms = [...new Set(formsPresent)];
    const formType: FormType = distinctForms.length === 1 ? distinctForms[0] : distinctForms.length > 1 ? "FORM_UNSPECIFIED" : "FORM_UNSPECIFIED";

    const hasFormConflict = distinctForms.length > 1;
    const conflicts: string[] = [];
    if (hasFormConflict) {
      conflicts.push(`Records under claim ID ${normId} mention multiple conflicting forms: ${distinctForms.join(", ")}.`);
    }

    const resolutionStatus: ContextResolutionStatus = hasFormConflict
      ? "CONFLICTED"
      : items.length >= 1
      ? "CONFIDENT"
      : "PROBABLE";

    contexts.push({
      contextId: `CTX-${contextIndex++}`,
      claimReference: normId,
      rawClaimReference: items[0].rawClaimId,
      formType,
      memberId: items.find(i => i.memberId)?.memberId || null,
      establishmentId: items.find(i => i.establishmentId)?.establishmentId || null,
      evidenceArtifactIds: items.map(i => i.artifact.id),
      resolutionStatus,
      signals: ["EXPLICIT_CLAIM_ID_MATCH", ...(formType !== "FORM_UNSPECIFIED" ? ["FORM_TYPE_CORROBORATED"] : [])],
      conflicts
    });
  }

  // 3. Process unlinked artifacts (artifacts without explicit claim ID)
  if (unlinkedArtifacts.length > 0) {
    if (contexts.length === 0) {
      // No explicit claim ID found in any artifact. Check if distinct forms exist.
      const formGroups = new Map<FormType, ArtifactExtractedInfo[]>();
      for (const item of unlinkedArtifacts) {
        const existing = formGroups.get(item.formType) || [];
        existing.push(item);
        formGroups.set(item.formType, existing);
      }

      const distinctForms = Array.from(formGroups.keys()).filter(f => f !== "FORM_UNSPECIFIED");

      if (distinctForms.length > 1) {
        // Multiple distinct form types detected without claim ID (e.g. Form 19 vs Form 10C)
        for (const form of distinctForms) {
          const items = formGroups.get(form) || [];
          contexts.push({
            contextId: `CTX-${contextIndex++}`,
            claimReference: null,
            rawClaimReference: null,
            formType: form,
            memberId: null,
            establishmentId: null,
            evidenceArtifactIds: items.map(i => i.artifact.id),
            resolutionStatus: "PROBABLE",
            signals: ["FORM_TYPE_PARTITIONED"],
            conflicts: []
          });
        }

        // Add any unspecified items to unresolved
        const unspecified = formGroups.get("FORM_UNSPECIFIED") || [];
        unspecified.forEach(u => unresolvedArtifactIds.push(u.artifact.id));
      } else {
        // Single form type or all unspecified
        const singleForm = distinctForms.length === 1 ? distinctForms[0] : "FORM_UNSPECIFIED";
        contexts.push({
          contextId: `CTX-${contextIndex++}`,
          claimReference: null,
          rawClaimReference: null,
          formType: singleForm,
          memberId: null,
          establishmentId: null,
          evidenceArtifactIds: unlinkedArtifacts.map(i => i.artifact.id),
          resolutionStatus: singleForm !== "FORM_UNSPECIFIED" ? "PROBABLE" : "UNRESOLVED",
          signals: singleForm !== "FORM_UNSPECIFIED" ? ["FORM_TYPE_MATCH"] : ["GENERIC_UNLINKED_RECORD"],
          conflicts: []
        });
      }
    } else if (contexts.length === 1) {
      // Exactly ONE claim context exists.
      const singleContext = contexts[0];
      for (const item of unlinkedArtifacts) {
        // Check if item matches or is compatible with the single context
        if (item.formType === "FORM_UNSPECIFIED" || item.formType === singleContext.formType) {
          singleContext.evidenceArtifactIds.push(item.artifact.id);
          singleContext.signals.push("CROSS_DOCUMENT_CONTEXTUAL_LINKAGE");
        } else {
          // Explicitly different form type! Keep separate
          contexts.push({
            contextId: `CTX-${contextIndex++}`,
            claimReference: null,
            rawClaimReference: null,
            formType: item.formType,
            memberId: null,
            establishmentId: null,
            evidenceArtifactIds: [item.artifact.id],
            resolutionStatus: "PROBABLE",
            signals: ["DISTINCT_FORM_TYPE_WITHOUT_CLAIM_ID"],
            conflicts: []
          });
        }
      }
    } else {
      // MULTIPLE distinct claim contexts exist.
      // We must NOT arbitrarily attach unlinked artifacts.
      for (const item of unlinkedArtifacts) {
        if (item.formType !== "FORM_UNSPECIFIED") {
          // Check if exactly one context matches this form
          const matchingContexts = contexts.filter(c => c.formType === item.formType);
          if (matchingContexts.length === 1) {
            matchingContexts[0].evidenceArtifactIds.push(item.artifact.id);
            matchingContexts[0].signals.push("FORM_TYPE_MATCHED_TO_CLAIM_CONTEXT");
          } else {
            // Ambiguous between multiple contexts or none
            unresolvedArtifactIds.push(item.artifact.id);
          }
        } else {
          // Generic unlinked artifact across multiple claim contexts -> UNRESOLVED
          unresolvedArtifactIds.push(item.artifact.id);
        }
      }
    }
  }

  const hasMultiClaim = distinctClaimIds.length > 1;
  const allForms = contexts.map(c => c.formType).filter(f => f !== "FORM_UNSPECIFIED");
  const hasMultiForm = new Set(allForms).size > 1;
  const hasConflictingEntities = contexts.some(c => c.resolutionStatus === "CONFLICTED");

  let enSummary = "Single claim context identified.";
  let hiSummary = "एकल दावा संदर्भ की पहचान की गई।";

  if (hasMultiClaim && hasMultiForm) {
    enSummary = `Identified ${contexts.length} separate claim contexts across distinct claim IDs and form types.`;
    hiSummary = `विभिन्न दावा संख्याओं और फॉर्म प्रकारों में ${contexts.length} अलग-अलग दावा संदर्भों की पहचान की गई।`;
  } else if (hasMultiClaim) {
    enSummary = `Identified ${contexts.length} distinct claim references in the evidence records.`;
    hiSummary = `साक्ष्य रिकॉर्ड्स में ${contexts.length} अलग-अलग दावा संदर्भ संख्याओं की पहचान की गई।`;
  } else if (hasMultiForm) {
    enSummary = `Identified ${contexts.length} distinct form categories in the evidence records.`;
    hiSummary = `साक्ष्य रिकॉर्ड्स में ${contexts.length} अलग-अलग फॉर्म श्रेणियों की पहचान की गई।`;
  } else if (unresolvedArtifactIds.length > 0) {
    enSummary = `${contexts.length} claim context(s) identified; ${unresolvedArtifactIds.length} record(s) remain unresolved.`;
    hiSummary = `${contexts.length} दावा संदर्भ पहचाने गए; ${unresolvedArtifactIds.length} रिकॉर्ड असंबद्ध रहे।`;
  }

  return {
    contexts,
    unresolvedArtifactIds,
    hasMultiClaim,
    hasMultiForm,
    hasConflictingEntities,
    partitionSummary: {
      en: enSummary,
      hi: hiSummary
    }
  };
}
