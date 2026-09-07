"use client";

import React from "react";
import { sampleClaims, type SampleClaimKey } from "@/lib/data/sampleClaims";
import { translations, type Language } from "@/lib/i18n";

export interface ExampleScenariosProps {
  lang: Language;
  caseId: SampleClaimKey;
  onSelectCase: (key: SampleClaimKey) => void;
  onBack: () => void;
}

export function ExampleScenarios({
  lang,
  caseId,
  onSelectCase,
  onBack
}: ExampleScenariosProps) {
  const t = translations[lang];

  return (
    <section className="workflow-section">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <p className="eyebrow">{t.scenarios.eyebrow}</p>
      <h1>{t.scenarios.title}</h1>
      <p className="subhead">{t.scenarios.subtitle}</p>

      <div className="scenarios-grid">
        {(Object.keys(sampleClaims) as SampleClaimKey[]).map((key, idx) => {
          const s = sampleClaims[key];
          const isSelected = caseId === key;
          return (
            <div
              key={key}
              className={`scenario-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectCase(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectCase(key)}
              id={`scenario-card-${key}`}
            >
              <h3>
                {idx + 1}. {s.title}
              </h3>
              <p>{s.subtitle}</p>
              <div className="conflict-preview">{s.conflictPreview}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
