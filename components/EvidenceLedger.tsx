"use client";

import React from "react";
import type { ReconciliationResult } from "@/lib/schemas";
import { translations, type Language } from "@/lib/i18n";
import { sourceLabel } from "@/lib/uiLabels";

export interface EvidenceLedgerProps {
  lang: Language;
  events: ReconciliationResult["events"];
}

export function EvidenceLedger({ lang, events }: EvidenceLedgerProps) {
  const t = translations[lang];

  return (
    <div className="result-section">
      <h2 style={{ margin: "0 0 4px" }}>{t.result.whatProvesIt}</h2>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: "13px",
          color: "var(--ink-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em"
        }}
      >
        {t.result.evidenceLedger}
      </h3>

      <ol className="ledger-timeline">
        {events.map((e) => {
          const isLaterOutcome =
            e.normalizedState === "CREDITED" || e.normalizedState === "SETTLED";
          return (
            <li
              key={e.artifactId}
              className={`ledger-item ${e.isStale ? "earlier" : ""}`}
            >
              <span className="ledger-date">{e.date || "Undated"}</span>
              <div className="ledger-content">
                <b>
                  {sourceLabel[e.source]?.[lang] || e.source} · {e.rawStatus || e.normalizedState}
                </b>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                  {e.isStale && (
                    <span
                      className="stale-badge"
                      title="An older record may no longer reflect the latest update"
                    >
                      {t.result.earlierRecord} · {t.result.superseded}
                    </span>
                  )}
                  {isLaterOutcome && (
                    <span className="stale-badge later" title="Later financial/terminal record">
                      {t.result.laterOutcome}
                    </span>
                  )}
                </div>
              </div>
              <p className="ledger-detail">{e.detail}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
