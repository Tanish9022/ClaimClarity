"use client";

import React from "react";
import type { ReconciliationResult } from "@/lib/schemas";
import { translations, translateEngineText, type Language } from "@/lib/i18n";
import { stateDisplay } from "@/lib/uiLabels";
import { EvidenceLedger } from "./EvidenceLedger";
import { RejectionDiagnosticView } from "./RejectionDiagnosticView";
import { VerificationMatrix } from "./VerificationMatrix";
import { DossierDownloadCard } from "./DossierDownloadCard";

export interface ResultCardProps {
  lang: Language;
  result: ReconciliationResult;
  details: boolean;
  onToggleDetails: () => void;
  onReset: () => void;
}

export function ResultCard({
  lang,
  result,
  details,
  onToggleDetails,
  onReset
}: ResultCardProps) {
  const t = translations[lang];
  const isTerminalConflict = result.conflicts.some((c) => c.type === "TERMINAL_CONTRADICTION");
  const isUnknown = result.finalState === "UNKNOWN" && !isTerminalConflict;

  const displayState = isTerminalConflict
    ? t.result.conflict.headline
    : stateDisplay[result.finalState]?.[lang] || result.finalState;

  // Find competing state evaluation for "Why this state, not another?"
  const competingSuperseded = result.reconciliationTrace.competingStatesEvaluated.find(
    (s) => s.status === "superseded"
  );

  return (
    <section className="result-shell">
      {/* RESULT HEADER ACTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow" style={{ margin: 0 }}>
          {t.result.eyebrow}
        </span>
        <button className="back-btn" style={{ margin: 0 }} onClick={onReset} id="btn-reset-demo">
          {t.result.resetDemo}
        </button>
      </div>

      {/* 1. ANSWER */}
      <div
        className={`answer-card ${
          isTerminalConflict ? "conflict-mode" : isUnknown ? "unknown-mode" : ""
        }`}
      >
        <span
          className={`confidence-pill ${
            result.confidence === "high" ? "high" : result.confidence === "medium" ? "medium" : "low"
          }`}
        >
          {result.confidence === "high"
            ? t.result.highConfidence
            : result.confidence === "medium"
            ? t.result.mediumConfidence
            : t.result.lowConfidence}
        </span>
        <h1>{displayState}</h1>
        <p className="answer-summary">
          {isTerminalConflict
            ? t.result.conflict.subtext
            : isUnknown
            ? t.result.unknown.subtext
            : translateEngineText(result.reason, lang)}
        </p>
      </div>

      {/* 2. WHY? */}
      <div className="result-section">
        <h2>{t.result.whyHeading}</h2>
        <p className="why-highlight">
          {isTerminalConflict
            ? t.result.conflict.whyHighlight
            : translateEngineText(result.reconciliationTrace.winningStateRationale, lang)}
        </p>

        {result.conflicts.length > 0 && !isTerminalConflict && (
          <div className="conflict-callout-list">
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--amber)" }}>
              {t.result.whyConfusingHeader}
            </span>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
              {result.conflicts.map((c, i) => (
                <li key={i}>{translateEngineText(c.message, lang)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SPECIAL CALLOUTS: CONFLICT (WHAT WE KNOW VS CANNOT CONFIRM) */}
      {isTerminalConflict && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--amber)" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: "var(--green)", letterSpacing: "0.03em" }}>
              {t.result.conflict.whatWeKnow}
            </h3>
            <p style={{ margin: 0, fontSize: "15px", color: "var(--ink)" }}>
              {t.result.conflict.whatWeKnowText}
            </p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: "var(--amber)", letterSpacing: "0.03em" }}>
              {t.result.conflict.whatWeCannotConfirm}
            </h3>
            <p style={{ margin: 0, fontSize: "15px", color: "var(--ink-secondary)" }}>
              {t.result.conflict.whatWeCannotConfirmText}
            </p>
          </div>
        </div>
      )}

      {/* SPECIAL CALLOUTS: UNKNOWN (WHAT'S MISSING?) */}
      {isUnknown && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--ink-muted)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.03em", margin: "0 0 8px" }}>
            {t.result.unknown.whatsMissing}
          </h2>
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px", color: "var(--ink)", lineHeight: 1.6 }}>
            <li>{t.result.unknown.missingClaimId}</li>
            <li>{t.result.unknown.missingDate}</li>
            <li>{t.result.unknown.missingOutcome}</li>
          </ul>
        </div>
      )}

      {/* REJECTION DIAGNOSTIC INTELLIGENCE (PACKAGE 3) */}
      {result.diagnostic && (
        <RejectionDiagnosticView lang={lang} diagnostic={result.diagnostic} />
      )}

      {/* TIMING BENCHMARK NOTICE (PACKAGE 3) */}
      {result.timingAssessment?.timingNotice && !isTerminalConflict && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--ink-secondary)", background: "rgba(0,0,0,0.02)" }}>
          <span className="eyebrow" style={{ margin: "0 0 4px", fontSize: "11px" }}>
            {t.result.timing?.eyebrow}
          </span>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--ink)" }}>
            {result.timingAssessment.timingNotice[lang]}
          </p>
        </div>
      )}

      {/* MULTI-CLAIM / MULTI-FORM PARTITION BANNER (PACKAGE 4) */}
      {result.partitionResult && (result.partitionResult.hasMultiClaim || result.partitionResult.hasMultiForm || result.partitionResult.unresolvedArtifactIds.length > 0) && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--ink-secondary)", background: "rgba(0,0,0,0.02)" }}>
          <span className="eyebrow" style={{ margin: "0 0 4px", fontSize: "11px" }}>
            {t.result.partition?.eyebrow}
          </span>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--ink)", fontWeight: 600 }}>
            {result.partitionResult.partitionSummary[lang]}
          </p>
          {result.partitionResult.contexts.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              {result.partitionResult.contexts.map(ctx => (
                <span
                  key={ctx.contextId}
                  style={{
                    fontSize: "12px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <strong>{ctx.contextId}:</strong> {ctx.claimReference || "Unreferenced"} ({ctx.formType})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PAYMENT ATTRIBUTION & VERIFICATION (PACKAGE 4) */}
      {result.paymentAttribution && result.paymentAttribution.payments.length > 0 && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--green)", background: "rgba(0,0,0,0.02)" }}>
          <span className="eyebrow" style={{ margin: "0 0 4px", fontSize: "11px" }}>
            {t.result.attribution?.eyebrow}
          </span>
          {result.paymentAttribution.payments.map((p, idx) => (
            <div key={idx} style={{ marginTop: idx > 0 ? "8px" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background:
                      p.attributionStatus === "ATTRIBUTED"
                        ? "var(--green)"
                        : p.attributionStatus === "CANDIDATE"
                        ? "var(--amber)"
                        : "var(--ink-muted)",
                    color: "#fff"
                  }}
                >
                  {p.attributionStatus === "ATTRIBUTED"
                    ? t.result.attribution.badgeVerified
                    : p.attributionStatus === "CANDIDATE"
                    ? t.result.attribution.badgeCandidate
                    : p.attributionStatus === "CONFLICTED"
                    ? t.result.attribution.badgeConflicted
                    : t.result.attribution.badgeUnlinked}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
                  {p.amount ? `${p.amount} ${t.result.attribution.observed}` : t.result.attribution.creditObserved}
                  {p.date ? ` on ${p.date}` : ""}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-secondary)" }}>
                {p.explanation[lang]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 3. WHAT PROVES IT? (EVIDENCE LEDGER TIMELINE) */}
      <EvidenceLedger lang={lang} events={result.events} />

      {/* 4. STRUCTURED VERIFICATION MATRIX (PACKAGE 5) */}
      <VerificationMatrix lang={lang} result={result} />

      {/* 5. WHAT SHOULD I DO? */}
      <div className="action-box">
        <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, letterSpacing: "0.02em" }}>
          {t.result.whatShouldIDo}
        </h2>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.5 }}>
          {isTerminalConflict ? t.result.conflict.action : translateEngineText(result.recommendedAction, lang)}
        </p>
      </div>

      {/* 6. DON'T DO THIS YET */}
      {result.doNotDo && (
        <div className="warning-box">
          <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 800, color: "var(--amber)", letterSpacing: "0.02em" }}>
            {t.result.dontDoThisYet}
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
            {translateEngineText(result.doNotDo, lang)}
          </p>
        </div>
      )}

      {/* 7. EVIDENCE & GRIEVANCE SUPPORT DOSSIER DOWNLOAD (PACKAGE 5) */}
      <DossierDownloadCard lang={lang} result={result} />

      {/* 8. "WHY THIS STATE, NOT ANOTHER?" */}
      {competingSuperseded && !isTerminalConflict && (
        <div className="competing-state-box">
          <h3 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 800, color: "var(--green)", letterSpacing: "0.03em" }}>
            {lang === "hi"
              ? `${stateDisplay[result.finalState]?.hi || result.finalState} क्यों, ${stateDisplay[competingSuperseded.state]?.hi || competingSuperseded.state} क्यों नहीं?`
              : `WHY ${result.finalState} INSTEAD OF ${competingSuperseded.state}?`}
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
            {translateEngineText(competingSuperseded.reasonNotChosen, lang)}
          </p>
        </div>
      )}

      {/* 9. TECHNICAL TRACE ACCORDION */}
      <div>
        <button
          className="trace-toggle-btn"
          onClick={onToggleDetails}
          aria-expanded={details}
          id="btn-toggle-trace"
        >
          {details ? t.result.traceCtaHide : t.result.traceCtaShow}
        </button>

        {details && (
          <div className="trace-panel">
            <div className="trace-checks">
              <span className="trace-check-item">{t.result.traceChecks.identity}</span>
              <span className="trace-check-item">{t.result.traceChecks.chronology}</span>
              <span className="trace-check-item">{t.result.traceChecks.outcome}</span>
              <span className="trace-check-item">{t.result.traceChecks.superseded}</span>
              <span className="trace-check-item">
                {isTerminalConflict ? t.result.traceChecks.conflictFlagged : t.result.traceChecks.noConflict}
              </span>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(
                {
                  finalState: result.finalState,
                  confidence: result.confidence,
                  rulesFired: result.rulesFired,
                  claimIdentity: result.claimIdentity,
                  partitionResult: result.partitionResult,
                  paymentAttribution: result.paymentAttribution,
                  reconciliationTrace: {
                    supportingObservations: result.reconciliationTrace.supportingObservations,
                    staleObservations: result.reconciliationTrace.staleObservations,
                    winningStateRationale: result.reconciliationTrace.winningStateRationale,
                    competingStatesEvaluated: result.reconciliationTrace.competingStatesEvaluated
                  }
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}

