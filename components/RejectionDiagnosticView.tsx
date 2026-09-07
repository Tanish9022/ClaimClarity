"use client";

import React from "react";
import type { RejectionDiagnostic } from "@/lib/schemas";
import { translations, type Language } from "@/lib/i18n";

export interface RejectionDiagnosticViewProps {
  lang: Language;
  diagnostic: RejectionDiagnostic;
}

export function RejectionDiagnosticView({ lang, diagnostic }: RejectionDiagnosticViewProps) {
  const t = translations[lang];
  const { stage, prerequisites, action, doNotDo, escalationCondition } = diagnostic.resolutionGuidance;

  return (
    <div className="result-section" style={{ borderLeft: "4px solid var(--amber)", background: "rgba(217, 119, 6, 0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span className="eyebrow" style={{ color: "var(--amber)", margin: 0 }}>
          {t.result.diagnostic.eyebrow}
        </span>
        <span className="confidence-pill low" style={{ fontSize: "11px", padding: "2px 8px" }}>
          {diagnostic.certainty.toUpperCase()}
        </span>
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800 }}>
        {diagnostic.diagnosticTitle[lang]}
      </h3>

      <p style={{ margin: "0 0 12px", fontSize: "14.5px", color: "var(--ink)", lineHeight: 1.5 }}>
        {diagnostic.interpretation[lang]}
      </p>

      {/* Raw fact provenance */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "6px", padding: "8px 12px", marginBottom: "14px" }}>
        <small style={{ color: "var(--ink-muted)", display: "block", fontSize: "11.5px", fontWeight: 700, marginBottom: "2px" }}>
          {t.result.diagnostic.rawObservationLabel}
        </small>
        <code style={{ fontSize: "12.5px", color: "var(--ink-secondary)", display: "block", wordBreak: "break-word" }}>
          &ldquo;{diagnostic.rawText}&rdquo;
        </code>
      </div>

      {/* Resolution Guidance Box */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.04em", background: "var(--amber)", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
            {stage}
          </span>
          <b style={{ fontSize: "13px", color: "var(--ink)" }}>
            {t.result.diagnostic.recommendedStepLabel}
          </b>
        </div>

        <p style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.5 }}>
          {action[lang]}
        </p>

        {prerequisites.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <small style={{ fontWeight: 700, color: "var(--ink-muted)", fontSize: "11.5px" }}>
              {t.result.diagnostic.prerequisitesLabel}
            </small>
            <ul style={{ margin: "4px 0 0", paddingLeft: "18px", fontSize: "13px", color: "var(--ink-secondary)" }}>
              {prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {doNotDo && (
          <div style={{ marginTop: "10px", padding: "8px 10px", background: "rgba(180, 83, 9, 0.08)", borderRadius: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--amber)", display: "block", marginBottom: "2px" }}>
              {t.result.dontDoThisYet}
            </span>
            <span style={{ fontSize: "13px", color: "var(--ink)" }}>{doNotDo[lang]}</span>
          </div>
        )}

        {escalationCondition && (
          <div style={{ marginTop: "8px", fontSize: "12.5px", color: "var(--ink-secondary)" }}>
            <b style={{ color: "var(--ink)" }}>{t.result.diagnostic.escalationNoticeLabel} </b>
            {escalationCondition[lang]}
          </div>
        )}
      </div>
    </div>
  );
}
