"use client";

import React from "react";
import { sampleClaims, type SampleClaimKey } from "@/lib/data/sampleClaims";
import { translations, type Language } from "@/lib/i18n";
import { sourceLabel } from "@/lib/uiLabels";

export interface EvidenceReviewProps {
  lang: Language;
  caseId: SampleClaimKey;
  showRawFacts: boolean;
  onToggleRawFacts: () => void;
  onAnalyze: () => void;
  onBack: () => void;
  error: string;
}

export function EvidenceReview({
  lang,
  caseId,
  showRawFacts,
  onToggleRawFacts,
  onAnalyze,
  onBack,
  error
}: EvidenceReviewProps) {
  const t = translations[lang];
  const claim = sampleClaims[caseId];

  return (
    <section className="workflow-section">
      <button className="back-btn" onClick={onBack}>
        ← Back to scenarios
      </button>
      <p className="eyebrow">{claim.title}</p>
      <h1>{t.review.header}</h1>
      <p className="subhead">{t.review.subtext}</p>

      <div className="evidence-cards-list">
        {claim.artifacts.map((a) => (
          <article className="evidence-row-card" key={a.id}>
            <div className="evidence-left">
              <b>{sourceLabel[a.source]?.[lang] || a.source}</b>
              <small>{a.date || "Undated observation"}</small>
              {a.claimId && <span className="claim-id-tag">{a.claimId}</span>}
              <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "var(--ink-secondary)" }}>
                {a.text}
              </p>
            </div>
            <div className="evidence-right">
              <strong>{a.status || "Unstated status"}</strong>
              {a.amount && <span className="amount-highlight">{a.amount}</span>}
            </div>
          </article>
        ))}
      </div>

      <div style={{ margin: "16px 0" }}>
        <button
          className="back-btn"
          style={{ fontSize: "13px", textDecoration: "underline" }}
          onClick={onToggleRawFacts}
          type="button"
        >
          {showRawFacts ? t.review.hideFields : t.review.viewFields}
        </button>

        {showRawFacts && (
          <pre className="trace-panel">
            {JSON.stringify(
              claim.artifacts.map((a) => ({
                source: a.source,
                date: a.date,
                status: a.status,
                claimId: a.claimId,
                amount: a.amount
              })),
              null,
              2
            )}
          </pre>
        )}
      </div>

      {error && (
        <p style={{ color: "#8c3526", fontWeight: "bold", margin: "10px 0" }} role="alert">
          {error}
        </p>
      )}

      <button className="primary" onClick={onAnalyze} id="btn-analyze-claim">
        {t.review.reconcileBtn} <span style={{ marginLeft: "10px" }}>→</span>
      </button>
    </section>
  );
}
