"use client";

import { ChangeEvent, useEffect, useState } from "react";
import type { Artifact, ReconciliationResult } from "@/lib/schemas";
import type { SampleClaimKey } from "@/lib/data/sampleClaims";
import type { Language } from "@/lib/i18n";
import {
  Header,
  LandingHero,
  ExampleScenarios,
  EvidenceReview,
  EvidenceUploader,
  LoadingState,
  ResultCard,
  Footer
} from "@/components";

const makeArtifact = (text: string): Artifact => ({
  id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  source: "other",
  channelDetail: null,
  text,
  date: null,
  status: null,
  claimId: null,
  claimType: null,
  amount: null,
  ambiguity: null,
  extractionConfidence: "high",
  fileName: null,
  mimeType: null,
  dataBase64: null
});

type View = "landing" | "scenarios" | "review" | "custom" | "loading" | "result";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [view, setView] = useState<View>("landing");
  const [caseId, setCaseId] = useState<SampleClaimKey>("CASE_A");
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(false);
  const [showRawFacts, setShowRawFacts] = useState(false);
  const [pasted, setPasted] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (view !== "loading") return;
    const timer = setInterval(() => setStep(s => Math.min(s + 1, 4)), 550);
    return () => clearInterval(timer);
  }, [view]);

  async function analyze() {
    const origin = view;
    setError("");
    setStep(0);
    setView("loading");
    try {
      const body = origin === "custom" ? { artifacts } : { caseId };
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Analysis could not be completed.");
      setResult(data);
      setView("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis could not be completed.");
      setView(origin === "custom" ? "custom" : "review");
    }
  }

  async function addFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      return setError("Unsupported file. Please add a PNG, JPG, JPEG, PDF, or TXT file.");
    }
    if (file.size > 3 * 1024 * 1024) {
      return setError("This file is too large. Please use a file smaller than 3 MB.");
    }
    const text = file.type === "text/plain" ? await file.text() : `[Attached ${file.name}]`;
    const dataBase64 = file.type === "text/plain" ? null : await fileToBase64(file);
    setArtifacts(x => [
      ...x,
      {
        ...makeArtifact(text || `[Attached ${file.name}]`),
        fileName: file.name,
        mimeType: file.type,
        dataBase64
      }
    ]);
    setError("");
  }

  const reset = () => {
    setView("landing");
    setResult(null);
    setArtifacts([]);
    setError("");
    setDetails(false);
    setShowRawFacts(false);
  };

  return (
    <main className="shell">
      {/* GLOBAL HEADER */}
      <Header
        lang={lang}
        onSelectLang={setLang}
        onBrandClick={() => setView("landing")}
      />

      {/* SCREEN 1: LANDING HERO */}
      {view === "landing" && (
        <LandingHero
          lang={lang}
          onTrySample={() => setView("scenarios")}
          onAddCustom={() => setView("custom")}
        />
      )}

      {/* SCREEN 2: SCENARIOS SELECTION */}
      {view === "scenarios" && (
        <ExampleScenarios
          lang={lang}
          caseId={caseId}
          onSelectCase={(id) => {
            setCaseId(id);
            setView("review");
          }}
          onBack={() => setView("landing")}
        />
      )}

      {/* SCREEN 3: EVIDENCE REVIEW */}
      {view === "review" && (
        <EvidenceReview
          lang={lang}
          caseId={caseId}
          showRawFacts={showRawFacts}
          onToggleRawFacts={() => setShowRawFacts(!showRawFacts)}
          onAnalyze={analyze}
          onBack={() => setView("scenarios")}
          error={error}
        />
      )}

      {/* SCREEN 4: CUSTOM EVIDENCE INPUT */}
      {view === "custom" && (
        <EvidenceUploader
          lang={lang}
          pasted={pasted}
          setPasted={setPasted}
          artifacts={artifacts}
          onAddPasted={() => {
            if (!pasted.trim()) return setError("Please paste some claim text first.");
            setArtifacts(x => [...x, makeArtifact(pasted.trim())]);
            setPasted("");
          }}
          onAddFile={addFile}
          onAnalyze={analyze}
          onBack={() => setView("landing")}
          error={error}
        />
      )}

      {/* SCREEN 5: LOADING / PROGRESS */}
      {view === "loading" && <LoadingState lang={lang} step={step} />}

      {/* SCREEN 6: RESULT SCREEN */}
      {view === "result" && result && (
        <ResultCard
          lang={lang}
          result={result}
          details={details}
          onToggleDetails={() => setDetails(!details)}
          onReset={reset}
        />
      )}

      {/* FOOTER DISCLOSURES */}
      <Footer />
    </main>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  bytes.forEach((x) => (binary += String.fromCharCode(x)));
  return btoa(binary);
}
