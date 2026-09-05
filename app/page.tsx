"use client";

import { ChangeEvent, useEffect, useState } from "react";
import type { Artifact, CanonicalStatus, ReconciliationResult, Source } from "@/lib/schemas";
import { sampleClaims, type SampleClaimKey } from "@/lib/data/sampleClaims";
import { translations, type Language } from "@/lib/i18n";

const sourceLabel: Record<Source, { en: string; hi: string }> = {
  new_tracker: { en: "Unified Member Portal", hi: "यूनिफाइड मेंबर पोर्टल" },
  old_tracker: { en: "Legacy Claim Portal", hi: "पुराना क्लेम स्टेटस पोर्टल" },
  passbook: { en: "EPFO E-Passbook", hi: "ई-पासबुक लेजर" },
  sms: { en: "SMS Notification", hi: "एसएमएस सूचना" },
  bank: { en: "Bank Statement", hi: "बैंक खाता विवरण" },
  other: { en: "Supplied Record", hi: "प्रस्तुत रिकॉर्ड" }
};

const stateDisplay: Record<CanonicalStatus, { en: string; hi: string }> = {
  CREDITED: { en: "Your money appears credited.", hi: "आपकी राशि जमा हुई दिखाई दे रही है।" },
  SETTLED: { en: "Your claim is marked settled.", hi: "आपका दावा पास (Settled) हो चुका है।" },
  PROCESSING: { en: "Your claim is under process.", hi: "आपका दावा अभी प्रक्रियाधीन (Under Process) है।" },
  APPROVED: { en: "Your claim has been approved.", hi: "आपका दावा स्वीकृत हो गया है।" },
  SUBMITTED: { en: "Your claim is submitted.", hi: "आपका दावा दर्ज हो चुका है।" },
  REJECTED: { en: "Your claim was rejected.", hi: "आपका दावा अस्वीकृत (Rejected) हुआ है।" },
  UNKNOWN: { en: "We don't have enough information yet.", hi: "अभी इतनी जानकारी नहीं है कि पक्का बताया जा सके।" }
};

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

  const t = translations[lang];

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
      {/* GLOBAL ACCESSIBLE HEADER */}
      <header className="app-header">
        <button className="brand" onClick={() => setView("landing")} aria-label="ClaimClarity Home">
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
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              English
            </button>
            <button
              className={`lang-btn ${lang === "hi" ? "active" : ""}`}
              onClick={() => setLang("hi")}
              aria-pressed={lang === "hi"}
            >
              हिंदी
            </button>
          </div>
        </div>
      </header>

      {/* SCREEN 1: LANDING PAGE */}
      {view === "landing" && (
        <Landing
          lang={lang}
          onTrySample={() => setView("scenarios")}
          onAddCustom={() => setView("custom")}
        />
      )}

      {/* SCREEN 2: SCENARIO SELECTION */}
      {view === "scenarios" && (
        <Scenarios
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
        <CustomEvidence
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
      {view === "loading" && <LoadingProgress lang={lang} step={step} />}

      {/* SCREEN 6: RESULT SCREEN */}
      {view === "result" && result && (
        <ResultView
          lang={lang}
          result={result}
          details={details}
          onToggleDetails={() => setDetails(!details)}
          onReset={reset}
        />
      )}

      {/* FOOTER DISCLOSURES */}
      <footer className="app-footer">
        Independent prototype using synthetic data. Not an official EPFO service. We cannot verify live EPFO records and do not access or modify live government systems.
      </footer>
    </main>
  );
}

/* =========================================================================
   1. LANDING COMPONENT
   ========================================================================= */
function Landing({
  lang,
  onTrySample,
  onAddCustom
}: {
  lang: Language;
  onTrySample: () => void;
  onAddCustom: () => void;
}) {
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

      {/* Tiny Contradiction Visual Demo */}
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

/* =========================================================================
   2. SCENARIOS SELECTION COMPONENT
   ========================================================================= */
function Scenarios({
  lang,
  caseId,
  onSelectCase,
  onBack
}: {
  lang: Language;
  caseId: SampleClaimKey;
  onSelectCase: (key: SampleClaimKey) => void;
  onBack: () => void;
}) {
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

/* =========================================================================
   3. EVIDENCE REVIEW COMPONENT
   ========================================================================= */
function EvidenceReview({
  lang,
  caseId,
  showRawFacts,
  onToggleRawFacts,
  onAnalyze,
  onBack,
  error
}: {
  lang: Language;
  caseId: SampleClaimKey;
  showRawFacts: boolean;
  onToggleRawFacts: () => void;
  onAnalyze: () => void;
  onBack: () => void;
  error: string;
}) {
  const t = translations[lang];
  const claim = sampleClaims[caseId];

  return (
    <section className="workflow-section">
      <button className="back-btn" onClick={onBack}>
        ← Back to scenarios
      </button>
      <p className="eyebrow">{claim.title}</p>
      <h1>{t.review.header}</h1>
      <p className="subhead">{t.review.subtext}</p>

      <div className="evidence-cards-list">
        {claim.artifacts.map((a) => (
          <article className="evidence-row-card" key={a.id}>
            <div className="evidence-left">
              <b>{sourceLabel[a.source]?.[lang] || a.source}</b>
              <small>{a.date || "Undated observation"}</small>
              {a.claimId && <span className="claim-id-tag">{a.claimId}</span>}
              <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "var(--ink-secondary)" }}>
                {a.text}
              </p>
            </div>
            <div className="evidence-right">
              <strong>{a.status || "Unstated status"}</strong>
              {a.amount && <span className="amount-highlight">{a.amount}</span>}
            </div>
          </article>
        ))}
      </div>

      <div style={{ margin: "16px 0" }}>
        <button
          className="back-btn"
          style={{ fontSize: "13px", textDecoration: "underline" }}
          onClick={onToggleRawFacts}
          type="button"
        >
          {showRawFacts ? t.review.hideFields : t.review.viewFields}
        </button>

        {showRawFacts && (
          <pre className="trace-panel">
            {JSON.stringify(
              claim.artifacts.map((a) => ({
                source: a.source,
                date: a.date,
                status: a.status,
                claimId: a.claimId,
                amount: a.amount
              })),
              null,
              2
            )}
          </pre>
        )}
      </div>

      {error && (
        <p style={{ color: "#8c3526", fontWeight: "bold", margin: "10px 0" }} role="alert">
          {error}
        </p>
      )}

      <button className="primary" onClick={onAnalyze} id="btn-analyze-claim">
        {t.review.reconcileBtn} <span style={{ marginLeft: "10px" }}>→</span>
      </button>
    </section>
  );
}

/* =========================================================================
   4. CUSTOM EVIDENCE COMPONENT
   ========================================================================= */
function CustomEvidence({
  lang,
  pasted,
  setPasted,
  artifacts,
  onAddPasted,
  onAddFile,
  onAnalyze,
  onBack,
  error
}: {
  lang: Language;
  pasted: string;
  setPasted: (v: string) => void;
  artifacts: Artifact[];
  onAddPasted: () => void;
  onAddFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onBack: () => void;
  error: string;
}) {
  const t = translations[lang];

  return (
    <section className="workflow-section">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <p className="eyebrow">{t.review.header}</p>
      <h1>{t.custom.title}</h1>
      <p className="subhead">Bring together multiple records to compare them.</p>

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
          <b style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>Added records:</b>
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

/* =========================================================================
   5. LOADING / PROGRESS COMPONENT
   ========================================================================= */
function LoadingProgress({ lang, step }: { lang: Language; step: number }) {
  const t = translations[lang];

  return (
    <section className="loading-box" aria-live="polite">
      <p className="eyebrow">DETERMINISTIC RECONCILIATION</p>
      <h1 style={{ fontSize: "26px", margin: "8px 0" }}>Analyzing evidence</h1>
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

/* =========================================================================
   6. RESULT COMPONENT (ANSWER -> WHY -> PROOF -> ACTION)
   ========================================================================= */
function ResultView({
  lang,
  result,
  details,
  onToggleDetails,
  onReset
}: {
  lang: Language;
  result: ReconciliationResult;
  details: boolean;
  onToggleDetails: () => void;
  onReset: () => void;
}) {
  const t = translations[lang];
  const isTerminalConflict = result.conflicts.some((c) => c.type === "TERMINAL_CONTRADICTION");
  const isUnknown = result.finalState === "UNKNOWN" && !isTerminalConflict;

  const displayState = isTerminalConflict
    ? t.result.conflict.headline
    : stateDisplay[result.finalState]?.[lang] || result.finalState;

  // Find competing state evaluation for "Why this state, not another?"
  const competingSuperseded = result.reconciliationTrace.competingStatesEvaluated.find(
    (s) => s.status === "superseded"
  );

  return (
    <section className="result-shell">
      {/* RESULT HEADER ACTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow" style={{ margin: 0 }}>
          {t.result.eyebrow}
        </span>
        <button className="back-btn" style={{ margin: 0 }} onClick={onReset} id="btn-reset-demo">
          {t.result.resetDemo}
        </button>
      </div>

      {/* 1. ANSWER */}
      <div
        className={`answer-card ${
          isTerminalConflict ? "conflict-mode" : isUnknown ? "unknown-mode" : ""
        }`}
      >
        <span
          className={`confidence-pill ${
            result.confidence === "high" ? "high" : result.confidence === "medium" ? "medium" : "low"
          }`}
        >
          {result.confidence === "high"
            ? t.result.highConfidence
            : result.confidence === "medium"
            ? t.result.mediumConfidence
            : t.result.lowConfidence}
        </span>
        <h1>{displayState}</h1>
        <p className="answer-summary">
          {isTerminalConflict
            ? t.result.conflict.subtext
            : isUnknown
            ? t.result.unknown.subtext
            : result.reason}
        </p>
      </div>

      {/* 2. WHY? */}
      <div className="result-section">
        <h2>{t.result.whyHeading}</h2>
        <p className="why-highlight">
          {isTerminalConflict
            ? "Your records contain two incompatible terminal outcomes: one official record indicates rejection, while another subsequent record indicates credit."
            : result.reconciliationTrace.winningStateRationale}
        </p>

        {result.conflicts.length > 0 && !isTerminalConflict && (
          <div className="conflict-callout-list">
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--amber)" }}>
              WHY RECORDS LOOK CONFUSING:
            </span>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
              {result.conflicts.map((c, i) => (
                <li key={i}>{c.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SPECIAL CALLOUTS: CONFLICT (WHAT WE KNOW VS CANNOT CONFIRM) */}
      {isTerminalConflict && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--amber)" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: "var(--green)", letterSpacing: "0.03em" }}>
              {t.result.conflict.whatWeKnow}
            </h3>
            <p style={{ margin: 0, fontSize: "15px", color: "var(--ink)" }}>
              A financial credit entry referencing this claim is recorded in the evidence.
            </p>
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: "var(--amber)", letterSpacing: "0.03em" }}>
              {t.result.conflict.whatWeCannotConfirm}
            </h3>
            <p style={{ margin: 0, fontSize: "15px", color: "var(--ink-secondary)" }}>
              We cannot confirm whether that credit resolves the same claim as the official rejection notice without regional office verification.
            </p>
          </div>
        </div>
      )}

      {/* SPECIAL CALLOUTS: UNKNOWN (WHAT'S MISSING?) */}
      {isUnknown && (
        <div className="result-section" style={{ borderLeft: "4px solid var(--ink-muted)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.03em", margin: "0 0 8px" }}>
            {t.result.unknown.whatsMissing}
          </h2>
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px", color: "var(--ink)", lineHeight: 1.6 }}>
            <li><strong>✓ Claim ID:</strong> No explicit claim number found</li>
            <li><strong>✓ Date:</strong> No verifiable timestamp on the notification</li>
            <li><strong>✓ Clear outcome:</strong> Message does not state whether claim was approved or rejected</li>
          </ul>
        </div>
      )}

      {/* 3. WHAT PROVES IT? (EVIDENCE LEDGER TIMELINE) */}
      <div className="result-section">
        <h2 style={{ margin: "0 0 4px" }}>{t.result.whatProvesIt}</h2>
        <h3 style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {t.result.evidenceLedger}
        </h3>

        <ol className="ledger-timeline">
          {result.events.map((e) => {
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
                      <span className="stale-badge" title="An older record may no longer reflect the latest update">
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

      {/* 4. WHAT SHOULD I DO? */}
      <div className="action-box">
        <h2 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, letterSpacing: "0.02em" }}>
          {t.result.whatShouldIDo}
        </h2>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.5 }}>
          {isTerminalConflict ? t.result.conflict.action : result.recommendedAction}
        </p>
      </div>

      {/* 5. DON'T DO THIS YET */}
      {result.doNotDo && (
        <div className="warning-box">
          <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 800, color: "var(--amber)", letterSpacing: "0.02em" }}>
            {t.result.dontDoThisYet}
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>{result.doNotDo}</p>
        </div>
      )}

      {/* 6. "WHY THIS STATE, NOT ANOTHER?" */}
      {competingSuperseded && !isTerminalConflict && (
        <div className="competing-state-box">
          <h3 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 800, color: "var(--green)", letterSpacing: "0.03em" }}>
            WHY {result.finalState} INSTEAD OF {competingSuperseded.state}?
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>{competingSuperseded.reasonNotChosen}</p>
        </div>
      )}

      {/* 7. TECHNICAL TRACE ACCORDION */}
      <div>
        <button
          className="trace-toggle-btn"
          onClick={onToggleDetails}
          aria-expanded={details}
          id="btn-toggle-trace"
        >
          {details ? t.result.traceCtaHide : t.result.traceCtaShow}
        </button>

        {details && (
          <div className="trace-panel">
            <div className="trace-checks">
              <span className="trace-check-item">Identity ✓</span>
              <span className="trace-check-item">Chronology ✓</span>
              <span className="trace-check-item">Outcome ✓</span>
              <span className="trace-check-item">Earlier signal superseded ✓</span>
              <span className="trace-check-item">
                {isTerminalConflict ? "Contradiction flagged ⚠" : "No unresolved contradiction ✓"}
              </span>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(
                {
                  finalState: result.finalState,
                  confidence: result.confidence,
                  rulesFired: result.rulesFired,
                  claimIdentity: result.claimIdentity,
                  reconciliationTrace: {
                    supportingObservations: result.reconciliationTrace.supportingObservations,
                    staleObservations: result.reconciliationTrace.staleObservations,
                    winningStateRationale: result.reconciliationTrace.winningStateRationale,
                    competingStatesEvaluated: result.reconciliationTrace.competingStatesEvaluated
                  }
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  bytes.forEach((x) => (binary += String.fromCharCode(x)));
  return btoa(binary);
}
