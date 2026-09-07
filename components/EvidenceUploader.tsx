"use client";

import React, { type ChangeEvent } from "react";
import type { Artifact } from "@/lib/schemas";
import { translations, type Language } from "@/lib/i18n";

export interface EvidenceUploaderProps {
  lang: Language;
  pasted: string;
  setPasted: (v: string) => void;
  artifacts: Artifact[];
  onAddPasted: () => void;
  onAddFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onBack: () => void;
  error: string;
}

export function EvidenceUploader({
  lang,
  pasted,
  setPasted,
  artifacts,
  onAddPasted,
  onAddFile,
  onAnalyze,
  onBack,
  error
}: EvidenceUploaderProps) {
  const t = translations[lang];

  return (
    <section className="workflow-section">
      <button className="back-btn" onClick={onBack}>
        {t.custom.backBtn}
      </button>
      <p className="eyebrow">{t.review.header}</p>
      <h1>{t.custom.title}</h1>
      <p className="subhead">
        {t.custom.subtitleText}
        <br />
        <span style={{ fontSize: "12.5px", color: "var(--ink-muted)" }}>
          {t.custom.privacyTip}
        </span>
      </p>

      <label htmlFor="custom-paste" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
        {t.custom.pasteLabel}
      </label>
      <textarea
        id="custom-paste"
        value={pasted}
        onChange={(e) => setPasted(e.target.value)}
        placeholder={t.custom.pastePlaceholder}
        rows={4}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          background: "var(--surface)",
          fontSize: "14.5px"
        }}
      />
      <button
        className="secondary"
        style={{ margin: "10px 0 20px", minHeight: "42px", padding: "8px 18px" }}
        onClick={onAddPasted}
        id="btn-add-pasted"
      >
        {t.custom.addPasted}
      </button>

      <label
        style={{
          display: "block",
          border: "1.5px dashed var(--line)",
          padding: "14px 18px",
          borderRadius: "8px",
          background: "var(--surface)",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        {t.custom.uploadLabel}
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.txt,image/png,image/jpeg,application/pdf,text/plain"
          onChange={onAddFile}
          style={{ display: "block", marginTop: "8px", fontSize: "13px" }}
        />
      </label>

      {artifacts.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <b style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>{t.custom.addedRecordsLabel}</b>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--ink-secondary)", fontSize: "14px" }}>
            {artifacts.map((a) => (
              <li key={a.id}>{a.fileName || a.text.slice(0, 60) + "…"}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p style={{ color: "#8c3526", fontWeight: "bold", margin: "10px 0" }} role="alert">
          {error}
        </p>
      )}

      <button
        className="primary"
        disabled={artifacts.length === 0}
        onClick={onAnalyze}
        id="btn-analyze-custom"
      >
        {t.custom.reconcileBtn} <span>→</span>
      </button>
    </section>
  );
}

