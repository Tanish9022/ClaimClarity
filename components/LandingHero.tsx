"use client";

import React from "react";
import { translations, type Language } from "@/lib/i18n";

export interface LandingHeroProps {
  lang: Language;
  onTrySample: () => void;
  onAddCustom: () => void;
}

export function LandingHero({ lang, onTrySample, onAddCustom }: LandingHeroProps) {
  const t = translations[lang];

  return (
    <section className="landing-hero">
      <p className="eyebrow">{t.hero.eyebrow}</p>
      <h1>
        {t.hero.headlineFirst}
        <br />
        <em>{t.hero.headlineSecond}</em>
      </h1>
      <p className="lead-text">{t.hero.supporting}</p>

      <div className="hero-actions">
        <button className="primary" onClick={onTrySample} id="btn-sample-claim">
          {t.hero.trySample} <span style={{ marginLeft: "10px" }}>→</span>
        </button>
        <button className="secondary" onClick={onAddCustom} id="btn-custom-evidence">
          {t.hero.addCustom}
        </button>
      </div>

      {/* Contradiction Visual Demo */}
      <div className="hero-preview-box" aria-hidden="true">
        <div className="hero-preview-grid">
          <div className="preview-col">
            <span>PORTAL</span>
            <strong>Under Process</strong>
          </div>
          <div className="preview-col">
            <span>SMS</span>
            <strong>Under Process</strong>
          </div>
          <div className="preview-col accent">
            <span>PASSBOOK</span>
            <strong>₹45,000 credited</strong>
          </div>
        </div>
        <div className="hero-preview-notice">
          <span>→</span> {t.hero.reconcilesNotice}
        </div>
      </div>

      <p className="disclosures-strip">{t.hero.disclaimer}</p>
    </section>
  );
}
