import type {
  Artifact,
  EvidencePartitionResult,
  PaymentAttributionOutcome,
  PaymentAttributionResult,
  PaymentEvent
} from "@/lib/schemas";

/**
 * PARSE NUMERIC AMOUNT FROM STRING
 * Examples: "₹45,000", "45000", "Rs. 52,000.00" -> 45000
 */
export function parseNumericAmount(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹,\s]|Rs\.?|INR/gi, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : Math.round(num);
}

/**
 * DETECT SENDER / DISBURSEMENT REFERENCE
 */
export function extractSenderReference(text: string): string | null {
  const match = text.match(/\b(NEFT[-_]?EPFO|EPFO[-_]?NEFT|EPFO|CBIC|NACH[-_]?EPFO|GOVT[-_]?EPFO|PF\s*DISBURSEMENT)\b/i);
  if (!match) return null;
  const val = match[0].toUpperCase();
  if (val.includes("NEFT") && val.includes("EPFO")) return "EPFO-NEFT";
  return val;
}

/**
 * EXTRACT TRANSACTION / UTR REFERENCE
 */
export function extractTransactionReference(text: string): string | null {
  const match = text.match(/\b(UTR[:\s]*[A-Z0-9]{8,22}|TXN[:\s]*[A-Z0-9]{8,22}|REF[:\s]*[A-Z0-9]{8,22})\b/i);
  return match ? match[0] : null;
}

/**
 * CHECK IF ARTIFACT IS A FINANCIAL PAYMENT / CREDIT EVENT
 */
export function isPaymentArtifact(artifact: Artifact): boolean {
  if (artifact.source === "bank") return true;
  const text = `${artifact.status || ""} ${artifact.text}`.toLowerCase();
  return (
    /bank\s*credit|credited|amount.*received|transferred\s*to\s*bank|disbursed\s*to\s*account/i.test(text) &&
    !/rejected|denied/i.test(text)
  );
}

/**
 * ATTRIBUTE PAYMENTS TO CANDIDATE CLAIM CONTEXTS
 * Core principle: Bank credit existence != Claim attribution.
 */
export function attributePayments(
  artifacts: Artifact[],
  partitionResult: EvidencePartitionResult
): PaymentAttributionResult {
  const paymentArtifacts = artifacts.filter(isPaymentArtifact);

  if (paymentArtifacts.length === 0) {
    return {
      payments: [],
      hasUnattributedPayment: false,
      hasConflictedPayment: false,
      hasCandidatePayment: false,
      hasAttributedPayment: false
    };
  }

  const { contexts } = partitionResult;
  const payments: PaymentEvent[] = [];

  let paymentIndex = 1;

  for (const artifact of paymentArtifacts) {
    const rawNarration = artifact.text;
    const amountStr = artifact.amount;
    const numericAmount = parseNumericAmount(amountStr) || parseNumericAmount(rawNarration);
    const date = artifact.date || null;
    const senderRef = extractSenderReference(rawNarration);
    const txnRef = extractTransactionReference(rawNarration);

    const matchedSignals: string[] = [];
    const unmatchedSignals: string[] = [];

    // 1. Check explicit claim reference matches across contexts
    const explicitMatchingContexts = contexts.filter(ctx => {
      if (!ctx.claimReference) return false;
      const regex = new RegExp(`\\b${ctx.claimReference.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      return regex.test(rawNarration) || regex.test(artifact.claimId || "");
    });

    let attributionStatus: PaymentAttributionOutcome = "UNATTRIBUTED";
    let attributedContextId: string | null = null;
    let candidateContextIds: string[] = [];
    let enExplanation = "";
    let hiExplanation = "";

    if (explicitMatchingContexts.length === 1) {
      // Direct explicit claim ID match in payment narration
      const target = explicitMatchingContexts[0];
      attributionStatus = "ATTRIBUTED";
      attributedContextId = target.contextId;
      candidateContextIds = [target.contextId];
      matchedSignals.push("SIGNAL_EXPLICIT_CLAIM_REF");
      if (senderRef) matchedSignals.push("SIGNAL_EPFO_SENDER");
      if (numericAmount) matchedSignals.push("SIGNAL_AMOUNT_MATCH");

      enExplanation = `Payment explicitly references claim ID ${target.claimReference || target.contextId}.`;
      hiExplanation = `भुगतान विवरण में दावा संख्या ${target.claimReference || target.contextId} का सीधा उल्लेख है।`;
    } else if (explicitMatchingContexts.length > 1) {
      // Contradictory explicit claim IDs in one payment
      attributionStatus = "CONFLICTED";
      candidateContextIds = explicitMatchingContexts.map(c => c.contextId);
      matchedSignals.push("SIGNAL_MULTIPLE_EXPLICIT_REFS");
      unmatchedSignals.push("SIGNAL_UNAMBIGUOUS_CLAIM_REF");

      enExplanation = "Payment narration contains multiple conflicting claim identifiers.";
      hiExplanation = "भुगतान विवरण में परस्पर विरोधी दावा संख्याएं पाई गईं।";
    } else {
      // No explicit claim ID found in payment narration
      unmatchedSignals.push("SIGNAL_EXPLICIT_CLAIM_REF");

      if (contexts.length === 0) {
        // No claim contexts exist
        attributionStatus = "UNATTRIBUTED";
        enExplanation = "Payment received, but no claim context was found in the supplied records.";
        hiExplanation = "बैंक में राशि जमा हुई, लेकिन रिकॉर्ड्स में कोई दावा संदर्भ नहीं मिला।";
      } else if (contexts.length === 1) {
        const singleContext = contexts[0];
        const hasCorroboratingSettlement = artifacts.some(
          a =>
            a.id !== artifact.id &&
            singleContext.evidenceArtifactIds.includes(a.id) &&
            /settled|disbursed|approved/i.test(`${a.status || ""} ${a.text}`)
        );

        if (senderRef) matchedSignals.push("SIGNAL_EPFO_SENDER");
        if (hasCorroboratingSettlement) matchedSignals.push("SIGNAL_CORROBORATING_SETTLEMENT");

        // Amount comparison if available
        let amountMatches = false;
        if (numericAmount) {
          const otherAmounts = artifacts
            .filter(a => a.id !== artifact.id && singleContext.evidenceArtifactIds.includes(a.id))
            .map(a => parseNumericAmount(a.amount) || parseNumericAmount(a.text))
            .filter((n): n is number => n !== null);

          amountMatches = otherAmounts.some(a => a === numericAmount);
          if (amountMatches) matchedSignals.push("SIGNAL_AMOUNT_MATCH");
        }

        if (senderRef && hasCorroboratingSettlement) {
          // Single claim context + explicit EPFO sender + settlement corroboration
          attributionStatus = "ATTRIBUTED";
          attributedContextId = singleContext.contextId;
          candidateContextIds = [singleContext.contextId];
          enExplanation = `Payment verified from ${senderRef} corroborated by settlement record in ${singleContext.contextId}.`;
          hiExplanation = `${senderRef} से प्राप्त भुगतान को ${singleContext.contextId} के निपटान रिकॉर्ड द्वारा सत्यापित किया गया।`;
        } else if (senderRef || (hasCorroboratingSettlement && amountMatches)) {
          // Candidate link (plausible, but lacks definitive claim ID or corroboration)
          attributionStatus = "CANDIDATE";
          candidateContextIds = [singleContext.contextId];
          enExplanation = "Payment amount and timing are compatible with this claim, but direct claim reference is missing.";
          hiExplanation = "जमा राशि और समय इस दावे से मेल खाते हैं, लेकिन दावा संख्या का सीधा संदर्भ गायब है।";
        } else {
          // Generic bank credit without EPFO sender or settlement corroboration
          attributionStatus = "UNATTRIBUTED";
          unmatchedSignals.push("SIGNAL_EPFO_SENDER", "SIGNAL_CORROBORATING_SETTLEMENT");
          enExplanation = "A bank credit was observed, but lacks EPFO sender identification or direct claim reference.";
          hiExplanation = "बैंक में जमा प्रविष्टि देखी गई, लेकिन इसमें ईपीएफओ प्रेषक या दावा संदर्भ का अभाव है।";
        }
      } else {
        // MULTIPLE claim contexts exist (e.g. Form 19 vs Form 10C or CLM-1 vs CLM-2)
        // Check which contexts have matching amount or form details
        const matchingAmountContexts = contexts.filter(ctx => {
          const ctxArtifacts = artifacts.filter(a => ctx.evidenceArtifactIds.includes(a.id));
          const ctxAmounts = ctxArtifacts
            .map(a => parseNumericAmount(a.amount) || parseNumericAmount(a.text))
            .filter((n): n is number => n !== null);
          return numericAmount !== null && ctxAmounts.some(amt => amt === numericAmount);
        });

        if (matchingAmountContexts.length === 1 && senderRef) {
          // Exactly one context matches amount + EPFO sender, but no claim ID in narration
          // Stays CANDIDATE because amount alone is not decisive ownership!
          attributionStatus = "CANDIDATE";
          candidateContextIds = [matchingAmountContexts[0].contextId];
          matchedSignals.push("SIGNAL_AMOUNT_MATCH", "SIGNAL_EPFO_SENDER");
          unmatchedSignals.push("SIGNAL_EXPLICIT_CLAIM_REF");
          enExplanation = `Payment matches amount for ${matchingAmountContexts[0].contextId}, but cannot be definitively attributed without claim reference.`;
          hiExplanation = `भुगतान राशि ${matchingAmountContexts[0].contextId} से मेल खाती है, लेकिन दावा संख्या के बिना निश्चित जुड़ाव संभव नहीं है।`;
        } else if (matchingAmountContexts.length > 1) {
          attributionStatus = "CONFLICTED";
          candidateContextIds = matchingAmountContexts.map(c => c.contextId);
          matchedSignals.push("SIGNAL_AMOUNT_MATCH");
          unmatchedSignals.push("SIGNAL_EXPLICIT_CLAIM_REF");
          enExplanation = "Payment amount matches multiple active claims; attribution is ambiguous.";
          hiExplanation = "भुगतान राशि कई सक्रिय दावों से मेल खाती है; दावा जुड़ाव अस्पष्ट है।";
        } else {
          attributionStatus = "UNATTRIBUTED";
          unmatchedSignals.push("SIGNAL_EXPLICIT_CLAIM_REF", "SIGNAL_DISTINCT_AMOUNT_MATCH");
          enExplanation = "Payment cannot be linked to any specific claim context among the multiple claims found.";
          hiExplanation = "प्राप्त भुगतान को मिले हुए कई दावों में से किसी विशिष्ट दावे से नहीं जोड़ा जा सका।";
        }
      }
    }

    payments.push({
      eventId: `PAY-${paymentIndex++}`,
      sourceArtifactId: artifact.id,
      amount: amountStr || (numericAmount ? `₹${numericAmount.toLocaleString("en-IN")}` : null),
      numericAmount,
      date,
      transactionReference: txnRef,
      rawNarration,
      senderReference: senderRef,
      attributionStatus,
      attributedContextId,
      candidateContextIds,
      matchedSignals,
      unmatchedSignals,
      explanation: {
        en: enExplanation,
        hi: hiExplanation
      }
    });
  }

  const hasUnattributedPayment = payments.some(p => p.attributionStatus === "UNATTRIBUTED");
  const hasConflictedPayment = payments.some(p => p.attributionStatus === "CONFLICTED");
  const hasCandidatePayment = payments.some(p => p.attributionStatus === "CANDIDATE");
  const hasAttributedPayment = payments.some(p => p.attributionStatus === "ATTRIBUTED");

  return {
    payments,
    hasUnattributedPayment,
    hasConflictedPayment,
    hasCandidatePayment,
    hasAttributedPayment
  };
}
