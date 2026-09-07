"use client";

import React, { useState } from "react";
import type { ReconciliationResult } from "@/lib/schemas";
import { translations, type Language } from "@/lib/i18n";
import { buildVerificationMatrix, type MatrixCheckStatus } from "@/lib/documents/dossierModel";

export interface VerificationMatrixProps {
  lang: Language;
  result: ReconciliationResult;
}

export function VerificationMatrix({ lang, result }: VerificationMatrixProps) {
  const [expanded, setExpanded] = useState(false);
  const t = translations[lang];
  const matrix = buildVerificationMatrix(result, lang);

  const getStatusBadge = (status: MatrixCheckStatus) => {
    switch (status) {
      case "VERIFIED":
        return {
          label: t.result.matrix.statusVerified,
          bg: "var(--green)",
          color: "#fff"
        };
      case "SUPPORTED":
        return {
          label: t.result.matrix.statusSupported,
          bg: "rgba(16, 185, 129, 0.15)",
          color: "var(--green)"
        };
      case "NEEDS_REVIEW":
        return {
          label: t.result.matrix.statusNeedsReview,
          bg: "rgba(245, 158, 11, 0.15)",
          color: "var(--amber)"
        };
      case "UNCLEAR":
        return {
          label: t.result.matrix.statusUnclear,
          bg: "rgba(100, 116, 139, 0.15)",
          color: "var(--ink-secondary)"
        };
      case "CONFLICT":
        return {
          label: t.result.matrix.statusConflict,
          bg: "var(--amber)",
          color: "#fff"
        };
      case "SUPERSEDED":
        return {
          label: t.result.matrix.statusSuperseded,
          bg: "rgba(0, 0, 0, 0.06)",
          color: "var(--ink-muted)"
        };
    }
  };

  return (
    <div className="result-section" style={{ borderLeft: "4px solid var(--primary, #0369a1)" }} id="verification-matrix-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <span className="eyebrow" style={{ margin: "0 0 4px", fontSize: "11px" }}>
            {t.result.matrix.eyebrow}
          </span>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
            {t.result.matrix.title}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--ink-secondary)" }}>
            {t.result.matrix.subtitle}
          </p>
        </div>

        <button
          className="back-btn"
          style={{ margin: 0, padding: "6px 12px", fontSize: "12px" }}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          id="btn-toggle-matrix"
        >
          {expanded ? t.result.matrix.toggleHide : t.result.matrix.toggleShow}
        </button>
      </div>

      {/* SUMMARY BADGES */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
        <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "4px", background: "rgba(0,0,0,0.05)", border: "1px solid var(--border)" }}>
          <strong>Total Checks:</strong> {matrix.totalChecks}
        </span>
        <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "4px", background: "rgba(16, 185, 129, 0.1)", color: "var(--green)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <strong>Verified / Supported:</strong> {matrix.verifiedCount}
        </span>
        {matrix.conflictsCount > 0 && (
          <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "4px", background: "rgba(245, 158, 11, 0.1)", color: "var(--amber)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <strong>Conflicts:</strong> {matrix.conflictsCount}
          </span>
        )}
        {matrix.unresolvedCount > 0 && (
          <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "4px", background: "rgba(100, 116, 139, 0.1)", color: "var(--ink-secondary)", border: "1px solid var(--border)" }}>
            <strong>Unresolved / Review:</strong> {matrix.unresolvedCount}
          </span>
        )}
      </div>

      {/* COLLAPSIBLE STRUCTURED MATRIX TABLE */}
      {expanded && (
        <div style={{ marginTop: "16px", overflowX: "auto" }}>
          {matrix.groups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: "16px" }}>
              {matrix.groups.length > 1 && (
                <div style={{ padding: "6px 10px", background: "rgba(0,0,0,0.04)", borderRadius: "4px 4px 0 0", border: "1px solid var(--border)", borderBottom: "none", fontWeight: 700, fontSize: "13px" }}>
                  {group.contextTitle}
                </div>
              )}

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  background: "#fff",
                  border: "1px solid var(--border)"
                }}
              >
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.03)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>{t.result.matrix.colCheck}</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>{t.result.matrix.colSource}</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>{t.result.matrix.colObserved}</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>{t.result.matrix.colFinding}</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700, textAlign: "center" }}>{t.result.matrix.colStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row, rIdx) => {
                    const badge = getStatusBadge(row.status);
                    return (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: rIdx % 2 === 1 ? "rgba(0,0,0,0.015)" : "#fff"
                        }}
                      >
                        <td style={{ padding: "8px 10px", fontWeight: 600, verticalAlign: "top" }}>
                          {row.category}
                        </td>
                        <td style={{ padding: "8px 10px", color: "var(--ink-secondary)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                          <div>{row.sourceType}</div>
                          {row.observedDate && <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>{row.observedDate}</div>}
                        </td>
                        <td style={{ padding: "8px 10px", verticalAlign: "top" }}>
                          <code>{row.observedFact}</code>
                        </td>
                        <td style={{ padding: "8px 10px", verticalAlign: "top" }}>
                          {row.interpretation}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", verticalAlign: "top" }}>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: badge.bg,
                              color: badge.color,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
