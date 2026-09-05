import {
  ReconciliationResultSchema,
  type Artifact,
  type CanonicalStatus,
  type ClaimEvent,
  type ClaimIdentity,
  type CompetingStateEvaluation,
  type Conflict,
  type EventType,
  type ReconciliationResult,
  type ReconciliationTrace,
  type SemanticClass,
  type Source
} from "@/lib/schemas";

export const STATUS_NORMALIZATION: Array<[RegExp, CanonicalStatus]> = [
  [/bank\s+credit|credit|credited|amount.*received/i, "CREDITED"],
  [/reject|denied|not\s+approved|returned/i, "REJECTED"],
  [/settled|disburs|payment\s+made/i, "SETTLED"],
  [/approved|sanction/i, "APPROVED"],
  [/process|pending|verification/i, "PROCESSING"],
  [/submit|lodged|registered|claim.*received/i, "SUBMITTED"]
];

export function normalizeStatus(value: string | null | undefined): CanonicalStatus {
  if (!value) return "UNKNOWN";
  const matched = STATUS_NORMALIZATION.find(([pattern]) => pattern.test(value));
  return matched ? matched[1] : "UNKNOWN";
}

export function getSemanticClass(status: CanonicalStatus): SemanticClass {
  if (status === "SUBMITTED" || status === "PROCESSING" || status === "APPROVED") return "IN_FLIGHT";
  if (status === "SETTLED" || status === "CREDITED" || status === "REJECTED") return "TERMINAL";
  return "UNKNOWN";
}

export function getEventType(status: CanonicalStatus, source: Source): EventType {
  if (status === "CREDITED" || source === "bank") return "financial_outcome";
  if (status === "SETTLED" || status === "REJECTED") return "terminal_outcome";
  if (status === "SUBMITTED" || status === "PROCESSING" || status === "APPROVED") return "lifecycle_milestone";
  return "informational";
}

function deduplicateArtifacts(artifacts: Artifact[]): Artifact[] {
  const seen = new Set<string>();
  const deduped: Artifact[] = [];
  for (const a of artifacts) {
    const key = `${a.source}|${a.date ?? ""}|${a.claimId ?? ""}|${a.status ?? ""}|${a.amount ?? ""}|${a.text.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(a);
    }
  }
  return deduped;
}

function getChannelDetail(source: Source): string {
  switch (source) {
    case "new_tracker": return "Unified Member Portal Tracker";
    case "old_tracker": return "Legacy EPFO Claim Status Portal";
    case "passbook": return "EPFO E-Passbook / Ledger Record";
    case "sms": return "EPFO SMS Notification";
    case "bank": return "Bank Account Statement / SMS";
    case "other": return "Uploaded / Pasted Document";
  }
}

export function reconcileClaim(
  rawArtifacts: Artifact[],
  memberName: string | null,
  analysisMode: "demo" | "gemini"
): ReconciliationResult {
  const artifacts = deduplicateArtifacts(rawArtifacts);

  // 1. Map raw artifacts to typed ClaimEvents preserving provenance & original text
  const rawEvents: ClaimEvent[] = artifacts.map(a => {
    const norm = normalizeStatus(a.status || a.text);
    return {
      artifactId: a.id,
      source: a.source,
      channelDetail: a.channelDetail || getChannelDetail(a.source),
      date: a.date || null,
      rawStatus: a.status || null,
      normalizedState: norm,
      semanticClass: getSemanticClass(norm),
      eventType: getEventType(norm, a.source),
      claimId: a.claimId || null,
      claimType: a.claimType || null,
      amount: a.amount || null,
      ambiguity: a.ambiguity || null,
      extractionConfidence: a.extractionConfidence || "high",
      provenance: {
        source: a.source,
        channelDetail: a.channelDetail || getChannelDetail(a.source),
        rawSnippet: a.text,
        artifactId: a.id,
        extractionConfidence: a.extractionConfidence || "high"
      },
      detail: a.text,
      isStale: false
    };
  });

  // Chronological sort: dated items in ascending order (YYYY-MM-DD), followed by undated items
  const events = [...rawEvents].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return 0;
  });

  // 2. Identity Reconciliation
  const explicitIds = [...new Set(artifacts.map(a => a.claimId).filter((id): id is string => Boolean(id?.trim())))];
  const claimTypes = [...new Set(artifacts.map(a => a.claimType).filter((t): t is string => Boolean(t?.trim())))];
  const amounts = [...new Set(artifacts.map(a => a.amount).filter((m): m is string => Boolean(m?.trim())))];

  const identityStatus: ClaimIdentity["identityStatus"] =
    explicitIds.length > 1 ? "CONFLICT" : explicitIds.length === 1 ? "MATCHED" : "INCOMPLETE";

  const claimIdentity: ClaimIdentity = {
    claimId: explicitIds.length === 1 ? explicitIds[0] : null,
    claimType: claimTypes.length > 0 ? claimTypes[0] : null,
    amount: amounts.length > 0 ? amounts[0] : null,
    identityStatus
  };

  const conflicts: Conflict[] = [];
  const uncertainties: string[] = [];
  const rulesFired: string[] = [];

  // Ambiguities from extraction
  artifacts.forEach(a => {
    if (a.ambiguity?.trim()) uncertainties.push(a.ambiguity.trim());
  });

  // Identity checks
  if (identityStatus === "CONFLICT") {
    conflicts.push({
      type: "IDENTIFIER_MISMATCH",
      severity: "blocking",
      message: `The supplied evidence contains different claim identifiers (${explicitIds.join(", ")}), so records may not all relate to one single claim.`,
      artifactIds: artifacts.filter(a => a.claimId).map(a => a.id)
    });
    uncertainties.push(`Multiple conflicting claim IDs detected: ${explicitIds.join(", ")}.`);
    rulesFired.push("IDENTIFIER_MISMATCH_DETECTED");
  } else if (identityStatus === "INCOMPLETE") {
    uncertainties.push("No explicit claim ID was found in the evidence.");
  }

  // Check undated records
  const undatedEvents = events.filter(e => !e.date);
  if (undatedEvents.length > 0 && events.length > 1) {
    uncertainties.push(`${undatedEvents.length} record(s) lack a verified date, which limits exact timeline ordering.`);
  }

  const knownEvents = events.filter(e => e.normalizedState !== "UNKNOWN");
  const terminalEvents = events.filter(e => e.semanticClass === "TERMINAL");
  const inFlightEvents = events.filter(e => e.semanticClass === "IN_FLIGHT");

  // 3. Evaluate Evidence Sufficiency Floor
  const isVagueOrEmpty =
    artifacts.length === 0 ||
    (artifacts.length === 1 && (!artifacts[0].date || !artifacts[0].claimId) && knownEvents.length === 0) ||
    (artifacts.length === 1 && !artifacts[0].date && !artifacts[0].claimId) ||
    (knownEvents.length === 0 && !artifacts.some(a => a.claimId));

  if (isVagueOrEmpty) {
    rulesFired.push("INSUFFICIENT_EVIDENCE_REFUSAL");
    uncertainties.push("Missing claim ID", "Missing verifiable dates", "No conclusive status outcome stated");

    const trace: ReconciliationTrace = {
      supportingObservations: [],
      staleObservations: [],
      conflictsFound: conflicts,
      uncertainties,
      rulesFired,
      winningStateRationale: "Supplied evidence lacks explicit dates, claim identifiers, or verifiable status signals.",
      competingStatesEvaluated: [
        { state: "UNKNOWN", evaluated: true, status: "selected", reasonNotChosen: "Selected because available evidence is insufficient to verify any claim lifecycle milestone.", relevantArtifactIds: artifacts.map(a => a.id) },
        { state: "SUBMITTED", evaluated: true, status: "unsupported", reasonNotChosen: "No explicit submission record or dated portal intake.", relevantArtifactIds: [] },
        { state: "PROCESSING", evaluated: true, status: "unsupported", reasonNotChosen: "No active processing milestone verified.", relevantArtifactIds: [] },
        { state: "APPROVED", evaluated: true, status: "unsupported", reasonNotChosen: "No sanction or approval record found.", relevantArtifactIds: [] },
        { state: "SETTLED", evaluated: true, status: "unsupported", reasonNotChosen: "No settlement record found.", relevantArtifactIds: [] },
        { state: "CREDITED", evaluated: true, status: "unsupported", reasonNotChosen: "No bank or passbook credit found.", relevantArtifactIds: [] },
        { state: "REJECTED", evaluated: true, status: "unsupported", reasonNotChosen: "No rejection record found.", relevantArtifactIds: [] }
      ]
    };

    return ReconciliationResultSchema.parse({
      finalState: "UNKNOWN",
      confidence: "low",
      reason: "We don't have enough information to determine the claim state yet.",
      supportingEvidence: [],
      conflictingEvidence: conflicts,
      uncertainties,
      rulesFired,
      recommendedAction: "Add another dated claim record, official status notification, or passbook entry.",
      doNotDo: "Do not submit another claim based on this vague or incomplete evidence.",
      reconciliationTrace: trace,
      bestSupportedState: "UNKNOWN",
      reasons: ["We don't have enough information to determine the claim state yet."],
      ruleFired: "INSUFFICIENT_EVIDENCE_REFUSAL",
      events,
      conflicts,
      claimIdentity,
      memberName,
      evidenceCount: artifacts.length,
      analysisMode
    });
  }

  // 4. Contradiction Analysis: Check for Terminal Contradictions
  const rejectedEvents = terminalEvents.filter(e => e.normalizedState === "REJECTED");
  const settledOrCreditedEvents = terminalEvents.filter(e => e.normalizedState === "SETTLED" || e.normalizedState === "CREDITED");

  let hasTerminalContradiction = false;
  if (rejectedEvents.length > 0 && settledOrCreditedEvents.length > 0) {
    hasTerminalContradiction = true;
    conflicts.push({
      type: "TERMINAL_CONTRADICTION",
      severity: "blocking",
      message: "The supplied records contain contradictory terminal outcomes (rejection vs settlement/credit) for this claim.",
      artifactIds: [...rejectedEvents, ...settledOrCreditedEvents].map(e => e.artifactId)
    });
    uncertainties.push("Incompatible terminal outcomes detected: One record indicates rejection while another indicates settlement/credit.");
    rulesFired.push("TERMINAL_CONTRADICTION_DETECTED");
  }

  // Check Chronology Regression (e.g. In-Flight Processing dated strictly AFTER a Settled/Credited event)
  const latestTerminal = terminalEvents.length > 0 ? terminalEvents[terminalEvents.length - 1] : null;
  if (latestTerminal && latestTerminal.date) {
    const postTerminalInFlight = inFlightEvents.filter(e => e.date && e.date > (latestTerminal.date as string));
    if (postTerminalInFlight.length > 0) {
      conflicts.push({
        type: "CHRONOLOGY_REGRESSION",
        severity: "warning",
        message: "An in-flight status appears with a date later than a recorded terminal outcome, indicating potential record latency or out-of-order notifications.",
        artifactIds: [latestTerminal.artifactId, ...postTerminalInFlight.map(e => e.artifactId)]
      });
      uncertainties.push("A status update is dated after the recorded settlement/credit.");
      rulesFired.push("CHRONOLOGY_REGRESSION_DETECTED");
    }
  }

  // 5. In-flight Stage Discordance (e.g. Submitted vs Processing vs Approved)
  const inFlightStages = [...new Set(inFlightEvents.map(e => e.normalizedState))];
  if (inFlightStages.length > 1 && terminalEvents.length === 0) {
    conflicts.push({
      type: "DIFFERENT_STAGES",
      severity: "warning",
      message: "These records report different active stages of processing across different channels (e.g. portal vs SMS vs passbook).",
      artifactIds: inFlightEvents.map(e => e.artifactId)
    });
    rulesFired.push("DIFFERENT_STAGES_DETECTED");
  }

  // 6. Outcome Selection Logic
  let finalState: CanonicalStatus = "UNKNOWN";
  let winningRationale = "";
  let reason = "";
  let recommendedAction = "";
  let doNotDo: string | null = null;
  let confidence: "high" | "medium" | "low" = "medium";
  const staleObservationIds: string[] = [];
  const supportingObservationIds: string[] = [];

  if (hasTerminalContradiction) {
    finalState = "UNKNOWN";
    confidence = "low";
    rulesFired.push("TERMINAL_CONTRADICTION_REFUSAL");
    winningRationale = "Refused to declare final state because supplied evidence contains mutually incompatible terminal outcomes (Rejection and Settlement/Credit).";
    reason = "Your supplied records contain two incompatible outcomes. We cannot safely confirm whether the credit resolves the same claim as the rejection record.";
    recommendedAction = "Verify the official claim outcome directly through your EPFO regional office or grievance portal before taking another action.";
    doNotDo = "Do not submit another claim or assume payment until the rejection and credit records are officially clarified.";
  } else if (terminalEvents.length > 0) {
    // Check CREDITED vs SETTLED vs REJECTED
    const creditEvent = terminalEvents.find(e => e.normalizedState === "CREDITED");
    const settledEvent = terminalEvents.find(e => e.normalizedState === "SETTLED");
    const rejectEvent = terminalEvents.find(e => e.normalizedState === "REJECTED");

    if (creditEvent) {
      finalState = "CREDITED";
      rulesFired.push("LATER_CREDIT_EVIDENCE_WINS");
      supportingObservationIds.push(creditEvent.artifactId);
      if (settledEvent) supportingObservationIds.push(settledEvent.artifactId);

      // Flag earlier in-flight observations as stale
      inFlightEvents.forEach(e => {
        if (!creditEvent.date || !e.date || e.date <= creditEvent.date) {
          e.isStale = true;
          staleObservationIds.push(e.artifactId);
        }
      });

      if (staleObservationIds.length > 0) {
        conflicts.push({
          type: "STALE_OBSERVATION",
          severity: "informational",
          message: "A newer record shows bank credit received. Earlier records showing Under Process or Submitted are superseded by this outcome.",
          artifactIds: [creditEvent.artifactId, ...staleObservationIds]
        });
        rulesFired.push("STALE_OBSERVATION_SUPERSEDED");
      }

      winningRationale = `Bank credit record (${creditEvent.artifactId}) provides explicit financial proof of disbursement, superseding earlier in-flight records.`;
      const amountStr = claimIdentity.amount ? ` of ${claimIdentity.amount}` : "";
      const dateStr = creditEvent.date ? ` on ${creditEvent.date}` : "";
      reason = `A newer record shows bank credit${amountStr} received${dateStr}. Earlier records still showing Under Process or Submitted are superseded.`;
      recommendedAction = "Verify the credit received in your bank passbook or statement; no duplicate claim or follow-up is needed.";
      doNotDo = "Do not submit another claim just because an older tracker or SMS still shows Under Process.";
      confidence = identityStatus === "CONFLICT" ? "low" : "high";
    } else if (settledEvent) {
      finalState = "SETTLED";
      rulesFired.push("LATER_SETTLEMENT_EVIDENCE_WINS");
      supportingObservationIds.push(settledEvent.artifactId);

      inFlightEvents.forEach(e => {
        if (!settledEvent.date || !e.date || e.date <= settledEvent.date) {
          e.isStale = true;
          staleObservationIds.push(e.artifactId);
        }
      });

      if (staleObservationIds.length > 0) {
        conflicts.push({
          type: "STALE_OBSERVATION",
          severity: "informational",
          message: "Official tracker record confirms settlement, superseding earlier processing notices.",
          artifactIds: [settledEvent.artifactId, ...staleObservationIds]
        });
        rulesFired.push("STALE_OBSERVATION_SUPERSEDED");
      }

      winningRationale = `Official settlement record (${settledEvent.artifactId}) establishes terminal lifecycle completion over earlier in-flight observations.`;
      const dateStr = settledEvent.date ? ` on ${settledEvent.date}` : "";
      reason = `Official records confirm this claim was settled${dateStr}. Processing has finished.`;
      recommendedAction = "Check your bank account for disbursement credit within 2 to 3 working days.";
      doNotDo = "Do not file a duplicate claim; the supplied evidence already confirms official settlement.";
      confidence = identityStatus === "CONFLICT" ? "low" : "high";
    } else if (rejectEvent) {
      finalState = "REJECTED";
      rulesFired.push("OFFICIAL_REJECTION_RECORDED");
      supportingObservationIds.push(rejectEvent.artifactId);

      inFlightEvents.forEach(e => {
        if (!rejectEvent.date || !e.date || e.date <= rejectEvent.date) {
          e.isStale = true;
          staleObservationIds.push(e.artifactId);
        }
      });

      winningRationale = `Official rejection notice (${rejectEvent.artifactId}) is the definitive terminal outcome.`;
      reason = "Official records indicate this claim was rejected by the field office.";
      recommendedAction = "Review the rejection reason in your official EPFO portal before taking any corrective step.";
      doNotDo = "Do not submit an identical claim without rectifying the stated rejection reason.";
      confidence = identityStatus === "CONFLICT" ? "low" : "high";
    }
  } else if (inFlightEvents.length > 0) {
    // In-flight progression
    const approvedEvent = inFlightEvents.find(e => e.normalizedState === "APPROVED");
    const processingEvents = inFlightEvents.filter(e => e.normalizedState === "PROCESSING");
    const submittedEvents = inFlightEvents.filter(e => e.normalizedState === "SUBMITTED");

    if (approvedEvent) {
      finalState = "APPROVED";
      rulesFired.push("CLAIM_APPROVED_IN_FLIGHT");
      supportingObservationIds.push(approvedEvent.artifactId);
      winningRationale = `Approval milestone (${approvedEvent.artifactId}) verified; awaiting final settlement and bank transmission.`;
      reason = "Your claim has been approved by the EPFO authority and is awaiting disbursement.";
      recommendedAction = "Wait for payment settlement to be dispatched to your bank account.";
      doNotDo = "Do not re-submit your claim; it is already sanctioned.";
      confidence = identityStatus === "CONFLICT" ? "low" : "medium";
    } else if (processingEvents.length > 0) {
      finalState = "PROCESSING";
      rulesFired.push("PROCESSING_IN_FLIGHT_RECONCILED");
      processingEvents.forEach(e => supportingObservationIds.push(e.artifactId));
      winningRationale = "Active processing milestones confirmed across evidence; no terminal settlement record observed.";
      reason = "Based on the evidence provided, processing has started, but the supplied records do not establish final settlement yet.";
      recommendedAction = "Wait and monitor the existing claim rather than submitting a duplicate request.";
      doNotDo = "Don't submit another claim just because one source still shows an older or incomplete state.";
      confidence = identityStatus === "CONFLICT" ? "low" : "medium";
    } else if (submittedEvents.length > 0) {
      finalState = "SUBMITTED";
      rulesFired.push("SUBMISSION_RECORDED");
      submittedEvents.forEach(e => supportingObservationIds.push(e.artifactId));
      winningRationale = "Submission record verified at portal intake; processing not yet reflected.";
      reason = "Your claim submission has been recorded at the portal.";
      recommendedAction = "Allow 3 to 7 working days for processing updates to reflect on the portal.";
      doNotDo = "Do not re-apply while the initial submission is in queue.";
      confidence = identityStatus === "CONFLICT" ? "low" : "medium";
    }
  } else {
    finalState = "UNKNOWN";
    confidence = "low";
    rulesFired.push("INCONCLUSIVE_EVIDENCE");
    winningRationale = "No conclusive lifecycle state could be reconciled from the supplied evidence.";
    reason = "The supplied records do not contain a recognized claim status.";
    recommendedAction = "Add more detailed claim records or tracker screenshots.";
    doNotDo = "Do not submit duplicate claims without confirming your current status.";
  }

  // Calibrate confidence if single uncorroborated source
  if (artifacts.length === 1 && confidence === "high") {
    confidence = "medium";
  }
  if (identityStatus === "CONFLICT") {
    confidence = "low";
  }

  // 7. Competing States Evaluation
  const allStates: CanonicalStatus[] = ["SUBMITTED", "PROCESSING", "APPROVED", "SETTLED", "REJECTED", "CREDITED", "UNKNOWN"];
  const competingStatesEvaluated: CompetingStateEvaluation[] = allStates.map(st => {
    if (st === finalState) {
      return {
        state: st,
        evaluated: true,
        status: "selected",
        reasonNotChosen: `Selected as best-supported outcome (${rulesFired[0] || "RULE_MATCH"}).`,
        relevantArtifactIds: supportingObservationIds
      };
    }

    const matchingEvents = events.filter(e => e.normalizedState === st);
    const matchingIds = matchingEvents.map(e => e.artifactId);

    if (hasTerminalContradiction && (st === "REJECTED" || st === "SETTLED" || st === "CREDITED")) {
      return {
        state: st,
        evaluated: true,
        status: "conflicted",
        reasonNotChosen: "Contradicted by another terminal outcome in the same evidence set.",
        relevantArtifactIds: matchingIds
      };
    }

    if (matchingEvents.length > 0) {
      if (matchingEvents.some(e => e.isStale)) {
        return {
          state: st,
          evaluated: true,
          status: "superseded",
          reasonNotChosen: `Earlier observation superseded by later supported outcome (${finalState}).`,
          relevantArtifactIds: matchingIds
        };
      }
      return {
        state: st,
        evaluated: true,
        status: "unsupported",
        reasonNotChosen: `Present in evidence but outweighed by final state logic (${finalState}).`,
        relevantArtifactIds: matchingIds
      };
    }

    return {
      state: st,
      evaluated: true,
      status: "unsupported",
      reasonNotChosen: "No supporting evidence for this state was found in the supplied records.",
      relevantArtifactIds: []
    };
  });

  const reconciliationTrace: ReconciliationTrace = {
    supportingObservations: supportingObservationIds,
    staleObservations: staleObservationIds,
    conflictsFound: conflicts,
    uncertainties,
    rulesFired,
    winningStateRationale: winningRationale,
    competingStatesEvaluated
  };

  const supportingEvidence = events.filter(e => supportingObservationIds.includes(e.artifactId));
  const conflictingEvidence = conflicts;

  return ReconciliationResultSchema.parse({
    finalState,
    confidence,
    reason,
    supportingEvidence,
    conflictingEvidence,
    uncertainties,
    rulesFired,
    recommendedAction,
    doNotDo,
    reconciliationTrace,
    bestSupportedState: finalState,
    reasons: [reason],
    ruleFired: rulesFired[0] || "RECONCILED",
    events,
    conflicts,
    claimIdentity,
    memberName,
    evidenceCount: artifacts.length,
    analysisMode
  });
}
