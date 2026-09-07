"use client";

import React from "react";
import { translations, type Language } from "@/lib/i18n";

export interface HeaderProps {
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onBrandClick: () => void;
}

export function Header({ lang, onSelectLang, onBrandClick }: HeaderProps) {
  const t = translations[lang];

  return (
    <header className="app-header">
      <button className="brand" onClick={onBrandClick} aria-label="ClaimClarity Home">
        Claim<span>Clarity</span>
      </button>

      <div className="header-controls">
        <a href="/architecture" className="back-btn" style={{ margin: 0, fontSize: "13px" }}>
          {t.nav.howItWorks}
        </a>

        {/* BILINGUAL TOGGLE */}
        <div className="lang-toggle" role="group" aria-label="Language selection">
          <button
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => onSelectLang("en")}
            aria-pressed={lang === "en"}
          >
            English
          </button>
          <button
            className={`lang-btn ${lang === "hi" ? "active" : ""}`}
            onClick={() => onSelectLang("hi")}
            aria-pressed={lang === "hi"}
          >
            हिंदी
          </button>
        </div>
      </div>
    </header>
  );
}
