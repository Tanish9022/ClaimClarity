"use client";

import React from "react";
import { translations, type Language } from "@/lib/i18n";

export interface FooterProps {
  lang?: Language;
}

export function Footer({ lang = "en" }: FooterProps) {
  const t = translations[lang];
  return (
    <footer className="app-footer">
      {t.footer.disclaimer}
    </footer>
  );
}

