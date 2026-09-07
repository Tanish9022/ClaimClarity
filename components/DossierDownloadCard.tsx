"use client";

import React, { useState } from "react";
import type { ReconciliationResult } from "@/lib/schemas";
import { translations, type Language } from "@/lib/i18n";

export interface DossierDownloadCardProps {
  lang: Language;
  result: ReconciliationResult;
}

export function DossierDownloadCard({ lang, result }: DossierDownloadCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const t = translations[lang];

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, lang })
      });

      if (!response.ok) {
        throw new Error("Failed to generate dossier");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename =
        lang === "hi"
          ? "ClaimClarity-Evidence-Dossier-HI.pdf"
          : "ClaimClarity-Evidence-Dossier.pdf";

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Dossier download failed", err);
      setDownloadError(
        lang === "hi"
          ? "डोजियर तैयार नहीं हो सका। कृपया पुनः प्रयास करें।"
          : "We could not prepare the document right now. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="result-section"
      style={{
        borderLeft: "4px solid var(--primary, #0369a1)",
        background: "rgba(3, 105, 161, 0.03)"
      }}
      id="dossier-download-section"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ maxWidth: "550px" }}>
          <span className="eyebrow" style={{ margin: "0 0 4px", fontSize: "11px" }}>
            {t.result.dossier.eyebrow}
          </span>
          <h2 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 800 }}>
            {t.result.dossier.title}
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
            {t.result.dossier.subtitle}
          </p>
          <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--ink-muted)", fontStyle: "italic" }}>
            {t.result.dossier.disclaimerNotice}
          </div>
        </div>

        <div>
          <button
            className="reconcile-btn"
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: downloading ? "wait" : "pointer"
            }}
            onClick={handleDownload}
            disabled={downloading}
            id="btn-download-dossier"
          >
            {downloading ? t.result.dossier.generatingBtn : t.result.dossier.downloadBtn}
          </button>
        </div>
      </div>

      {downloadError && (
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--amber)", fontWeight: 600 }}>
          {downloadError}
        </p>
      )}
    </div>
  );
}
