"use client";

import React from "react";
import { translations, type Language } from "@/lib/i18n";

export interface LoadingStateProps {
  lang: Language;
  step: number;
}

export function LoadingState({ lang, step }: LoadingStateProps) {
  const t = translations[lang];

  return (
    <section className="loading-box" aria-live="polite">
      <p className="eyebrow">VERIFYING YOUR RECORDS</p>
      <h1 style={{ fontSize: "26px", margin: "8px 0" }}>Checking claim records</h1>
      <p className="subhead" style={{ margin: 0 }}>{t.loading.caption}</p>

      <ul className="loading-steps">
        {t.loading.steps.map((text, idx) => {
          const isDone = idx < step;
          const isActive = idx === step;
          return (
            <li
              key={idx}
              className={`loading-step-item ${isActive ? "active" : isDone ? "done" : ""}`}
            >
              <span>{isDone ? "✓" : isActive ? "→" : "·"}</span>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
