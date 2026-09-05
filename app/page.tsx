"use client";

import { ChangeEvent, useEffect, useState } from "react";
import type { Artifact, CanonicalStatus, ReconciliationResult, Source } from "@/lib/schemas";
import { sampleClaims, type SampleClaimKey } from "@/lib/data/sampleClaims";

const stateDisplay: Record<CanonicalStatus, { headline: string; label: string }> = {
  CREDITED: { headline: "Your money appears credited.", label: "Bank credit received" },
  SETTLED: { headline: "Your claim is marked settled.", label: "Settled" },
  PROCESSING: { headline: "Your claim is under process.", label: "Under Process" },
  APPROVED: { headline: "Your claim has been approved.", label: "Approved" },
  SUBMITTED: { headline: "Your claim is submitted.", label: "Submitted" },
  REJECTED: { headline: "Your claim was rejected.", label: "Rejected" },
  UNKNOWN: { headline: "We don't have enough information yet.", label: "Not enough evidence" }
};

const sourceLabel: Record<Source, string> = {
  new_tracker: "Unified Portal Tracker",
  old_tracker: "Legacy EPFO Tracker",
  passbook: "E-Passbook / Ledger",
  sms: "SMS Notification",
  bank: "Bank Statement",
  other: "Uploaded Evidence"
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

type View = "landing" | "sample" | "custom" | "loading" | "result";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [caseId, setCaseId] = useState<SampleClaimKey>("CASE_A");
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(false);
  const [pasted, setPasted] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (view !== "loading") return;
    const timer = setInterval(() => setStep(s => Math.min(s + 1, 3)), 650);
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
      setView(origin === "custom" ? "custom" : "sample");
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
  };

  if (view === "loading") {
    return (
      <main className="shell loading" aria-live="polite">
        <div className="spinner" />
        <p className="eyebrow">EVIDENCE RECONCILIATION ENGINE</p>
        <h1>
          {
            [
              "Extracting facts from evidence…",
              "Checking claim identity & amounts…",
              "Building chronological timeline…",
              "Reconciling conflicts & stale signals…"
            ][step]
          }
        </h1>
        <p className="muted">Deterministic audit in progress. Based only on the evidence provided.</p>
      </main>
    );
  }

  if (view === "result" && result) {
    return <Result result={result} details={details} setDetails={setDetails} reset={reset} />;
  }

  return (
    <main className="shell">
      <header>
        <button className="brand" onClick={() => setView("landing")}>
          Claim<span>Clarity</span>
        </button>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="/architecture" className="fine" style={{ textDecoration: "underline" }}>
            Technical Architecture
          </a>
          <span className="demo-pill">Evidence Reconciliation</span>
        </div>
      </header>

      {view === "landing" ? (
        <Landing sample={() => setView("sample")} custom={() => setView("custom")} />
      ) : view === "sample" ? (
        <Sample
          caseId={caseId}
          choose={setCaseId}
          analyze={analyze}
          back={() => setView("landing")}
          error={error}
        />
      ) : (
        <Custom
          pasted={pasted}
          setPasted={setPasted}
          artifacts={artifacts}
          addPasted={() => {
            if (!pasted.trim()) return setError("Paste some evidence before adding it.");
            setArtifacts(x => [...x, makeArtifact(pasted.trim())]);
            setPasted("");
          }}
          addFile={addFile}
          analyze={analyze}
          back={() => setView("landing")}
          error={error}
        />
      )}
      <Disclosure />
    </main>
  );
}

function Landing({ sample, custom }: { sample: () => void; custom: () => void }) {
  return (
    <div className="landing-copy">
      <p className="eyebrow">MANY SIGNALS. ONE EVIDENCE-BACKED ANSWER.</p>
      <h1>
        One claim.<br />
        <em>One reconciled state.</em>
      </h1>
      <p className="lead">
        Your EPFO claim shouldn&apos;t be a guessing game. When your portal, SMS, and passbook say different things,
        ClaimClarity deterministically reconciles what happened and what to do next.
      </p>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        <button className="primary" onClick={sample} id="btn-sample-claim">
          Try sample scenarios <span>→</span>
        </button>
        <button className="secondary" onClick={custom} id="btn-custom-evidence">
          Add my evidence
        </button>
      </div>
      <p className="fine">No login. No live EPFO access. Prototype runs on synthetic evidence.</p>
    </div>
  );
}

function Sample({
  caseId,
  choose,
  analyze,
  back,
  error
}: {
  caseId: SampleClaimKey;
  choose: (x: SampleClaimKey) => void;
  analyze: () => void;
  back: () => void;
  error: string;
}) {
  const current = sampleClaims[caseId];

  return (
    <section className="workflow">
      <button className="back" onClick={back}>
        ← Back
      </button>
      <p className="eyebrow">RECONCILIATION SCENARIOS</p>
      <h1>{current.title}</h1>
      <p className="muted" style={{ margin: "0 0 15px" }}>
        {current.subtitle}
      </p>

      <div className="case-select">
        {(Object.keys(sampleClaims) as SampleClaimKey[]).map(id => (
          <button
            key={id}
            className={caseId === id ? "selected" : ""}
            onClick={() => choose(id)}
            id={`case-btn-${id}`}
          >
            {id === "CASE_A"
              ? "A: Records Disagree"
              : id === "CASE_B"
              ? "B: Paid vs Processing"
              : id === "CASE_C"
              ? "C: Vague Signal"
              : "Conflict (Adversarial)"}
          </button>
        ))}
      </div>

      <div className="cards">
        {current.artifacts.map(a => (
          <article className="evidence" key={a.id}>
            <div>
              <b>{sourceLabel[a.source]}</b>
              <small>{a.date || "No reliable date"}</small>
              {a.claimId && <small style={{ color: "var(--green)" }}>{a.claimId}</small>}
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>{a.status || "Unstated status"}</strong>
              {a.amount && <small style={{ display: "block", color: "var(--green)", fontWeight: "bold" }}>{a.amount}</small>}
            </div>
          </article>
        ))}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" onClick={analyze} id="btn-analyze-claim">
        Analyze this claim <span>→</span>
      </button>
    </section>
  );
}

function Custom({
  pasted,
  setPasted,
  artifacts,
  addPasted,
  addFile,
  analyze,
  back,
  error
}: {
  pasted: string;
  setPasted: (x: string) => void;
  artifacts: Artifact[];
  addPasted: () => void;
  addFile: (e: ChangeEvent<HTMLInputElement>) => void;
  analyze: () => void;
  back: () => void;
  error: string;
}) {
  return (
    <section className="workflow">
      <button className="back" onClick={back}>
        ← Back
      </button>
      <p className="eyebrow">SYNTHETIC EVIDENCE LEDGER</p>
      <h1>Add evidence for one claim.</h1>
      <label htmlFor="paste">Paste claim text</label>
      <textarea
        id="paste"
        value={pasted}
        onChange={e => setPasted(e.target.value)}
        placeholder="Paste a synthetic tracker snippet, SMS text, passbook entry, or bank message…"
      />
      <button className="secondary" onClick={addPasted} id="btn-add-pasted">
        Add pasted evidence
      </button>

      <label className="file-label">
        Upload PNG, JPG, PDF, or TXT (max 3 MB)
        <input
          aria-label="Upload evidence"
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.txt,image/png,image/jpeg,application/pdf,text/plain"
          onChange={addFile}
        />
      </label>

      {artifacts.length > 0 && (
        <ul className="uploads">
          {artifacts.map(a => (
            <li key={a.id}>{a.fileName || "Pasted observation"}</li>
          ))}
        </ul>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" disabled={!artifacts.length} onClick={analyze} id="btn-analyze-custom">
        Reconcile evidence <span>→</span>
      </button>
      <p className="fine">Custom evidence extraction is powered by Gemini when configured server-side.</p>
    </section>
  );
}

function Result({
  result,
  details,
  setDetails,
  reset
}: {
  result: ReconciliationResult;
  details: boolean;
  setDetails: (x: boolean) => void;
  reset: () => void;
}) {
  const isTerminalConflict = result.conflicts.some(c => c.type === "TERMINAL_CONTRADICTION");
  const isUnknown = result.finalState === "UNKNOWN" && !isTerminalConflict;
  const headline = isTerminalConflict
    ? "Conflict detected: Incompatible outcomes"
    : stateDisplay[result.finalState].headline;

  return (
    <main className="shell result">
      <header>
        <button className="brand" onClick={reset}>
          Claim<span>Clarity</span>
        </button>
        <button className="text-btn" onClick={reset} id="btn-reset-demo">
          Reset demo
        </button>
      </header>

      {/* 1. ANSWER (Hero card) */}
      <section className="hero-card" aria-labelledby="result-headline">
        <p className="eyebrow">RECONCILED CLAIM STATUS</p>
        <span className={`badge ${result.confidence}`}>{result.confidence} confidence</span>
        <h1 id="result-headline">{headline}</h1>
        <p>{result.reason}</p>
      </section>

      {/* 2. WHY THIS ANSWER */}
      <Section title="Why this answer?">
        <div style={{ background: "white", padding: "16px", borderRadius: "10px", border: "1px solid var(--line)" }}>
          <p style={{ margin: "0 0 10px", fontWeight: "600" }}>{result.reconciliationTrace.winningStateRationale}</p>
          {result.conflicts.length > 0 ? (
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
              <span className="eyebrow" style={{ color: "#8c3526" }}>WHY RECORDS LOOK CONFUSING:</span>
              <ul style={{ margin: "6px 0 0", paddingLeft: "18px", color: "var(--muted)", fontSize: "14px" }}>
                {result.conflicts.map((c, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{c.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="fine" style={{ margin: 0 }}>All supplied records consistently point toward this milestone.</p>
          )}
        </div>
      </Section>

      {/* SPECIAL CALLOUTS FOR CONFLICT OR UNKNOWN */}
      {isTerminalConflict && (
        <Section title="What we know vs cannot confirm">
          <div className="action" style={{ background: "#fff", border: "1px solid #f5c2bc", marginBottom: "12px" }}>
            <strong style={{ color: "var(--green)" }}>WHAT WE KNOW:</strong>
            <p style={{ margin: "4px 0 0", fontSize: "14px" }}>A credit or settlement record appears in the evidence.</p>
          </div>
          <div className="warning">
            <strong>WHAT WE CANNOT CONFIRM:</strong>
            <p style={{ margin: "4px 0 0", fontSize: "14px" }}>We cannot safely confirm whether the credit resolves the same claim as the official rejection notice without regional office verification.</p>
          </div>
        </Section>
      )}

      {isUnknown && result.uncertainties.length > 0 && (
        <Section title="Missing information">
          <div className="warning">
            <strong>We need more details to safely determine the claim state:</strong>
            <ul style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "14px" }}>
              {result.uncertainties.map((u, idx) => (
                <li key={idx}>{u}</li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* 3. PROOF / EVIDENCE LEDGER */}
      <Section title="Evidence Ledger (Proof)">
        <div className="cards">
          {result.events.map(e => (
            <article
              className="evidence"
              key={e.artifactId}
              style={{
                borderColor: e.isStale ? "var(--line)" : "var(--green)",
                opacity: e.isStale ? 0.75 : 1,
                position: "relative"
              }}
            >
              <div>
                <b>{sourceLabel[e.source]}</b>
                <small>{e.date || "No reliable date"}</small>
                <small style={{ color: "var(--muted)" }}>{e.channelDetail}</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>{e.rawStatus || "No stated status"}</strong>
                {e.amount && <strong style={{ display: "block", color: "var(--green)" }}>{e.amount}</strong>}
                {e.isStale && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      fontSize: "11px",
                      background: "#f0f2f1",
                      color: "var(--muted)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    Superseded by later outcome
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 4. TIMELINE */}
      <Section title="Chronological Timeline">
        <ol className="timeline">
          {result.events.map(e => (
            <li key={e.artifactId}>
              <span>{e.date || "Undated observation"}</span>
              <b>{stateDisplay[e.normalizedState].label}</b>
              <p>
                {sourceLabel[e.source]} · {e.detail}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5. SAFE ACTIONS */}
      <Section title="What should I do?">
        <div className="action">
          {result.recommendedAction}
          <small>Based on deterministic reconciliation of your supplied evidence.</small>
        </div>
      </Section>

      {result.doNotDo && (
        <Section title="Don’t do this yet">
          <div className="warning">{result.doNotDo}</div>
        </Section>
      )}

      {/* 6. EXPANDABLE TECHNICAL AUDIT TRACE */}
      <button
        className="details"
        onClick={() => setDetails(!details)}
        aria-expanded={details}
        id="btn-toggle-trace"
        style={{ margin: "25px 0 10px", display: "inline-block" }}
      >
        {details ? "Hide deterministic reconciliation trace" : "Show deterministic reconciliation trace"}
      </button>

      {details && (
        <div style={{ marginTop: "10px" }}>
          <pre>
            {JSON.stringify(
              {
                finalState: result.finalState,
                confidence: result.confidence,
                rulesFired: result.rulesFired,
                reconciliationTrace: result.reconciliationTrace,
                claimIdentity: result.claimIdentity,
                supportingObservations: result.reconciliationTrace.supportingObservations,
                staleObservations: result.reconciliationTrace.staleObservations
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      <Disclosure />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Disclosure() {
  return (
    <footer>
      Independent prototype using synthetic data. Not an official EPFO service. We cannot verify live EPFO records and
      do not access or modify live EPFO systems.
    </footer>
  );
}

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  bytes.forEach(x => (binary += String.fromCharCode(x)));
  return btoa(binary);
}
