"use client";
import React, { useState } from "react";
import Link from "next/link";

interface Stage {
  id: string;
  name: string;
  category: "INPUT" | "AI" | "VALIDATION" | "REASONING" | "OUTPUT";
  summary: string;
  does: string[];
  doesNot: string[];
}

const ARCHITECTURE_STAGES: Stage[] = [
  {
    id: "evidence",
    name: "1. Citizen Evidence",
    category: "INPUT",
    summary: "Screenshots, passbook entries, claim tracker records, and SMS notices provided by the citizen.",
    does: [
      "Accept user-provided images, screenshots, and text messages",
      "Preserve original artifacts and source types unmodified",
      "Protect citizen privacy by operating without live login credentials"
    ],
    doesNot: [
      "Query live government servers or connect to EPFO databases",
      "Mutate or file any real claims",
      "Store private citizen credentials"
    ]
  },
  {
    id: "ai-extraction",
    name: "2. AI Evidence Extraction",
    category: "AI",
    summary: "Multimodal vision & language extraction converts messy artifacts into candidate observations.",
    does: [
      "Extract explicit dates, claim IDs, raw status strings, and monetary amounts",
      "Record provenance pointers directly back to the originating artifact",
      "Preserve textual ambiguity and explicit uncertainties"
    ],
    doesNot: [
      "Decide the official claim outcome or final claim state",
      "Hallucinate or infer missing facts not present in the record",
      "Give free-form unconstrained advice to the citizen"
    ]
  },
  {
    id: "validation",
    name: "3. Validated Structured Facts",
    category: "VALIDATION",
    summary: "Rigorous runtime schema validation (Zod) rejects malformed or unverified model outputs.",
    does: [
      "Enforce strict typing on every extracted observation",
      "Reject malformed dates, invalid currencies, and schema drift",
      "Drop observations that fail structural integrity checks"
    ],
    doesNot: [
      "Allow loose or unparsed AI JSON into the reconciliation pipeline",
      "Modify the underlying extracted values during validation"
    ]
  },
  {
    id: "identity-chronology",
    name: "4. Identity + Chronology",
    category: "REASONING",
    summary: "Group records by verified claim identifier and sequence them into a strict chronological timeline.",
    does: [
      "Check identifier matching across different sources (Portal vs SMS vs Passbook)",
      "Flag claims with missing or discordant identifiers",
      "Sort dated events from earliest to latest"
    ],
    doesNot: [
      "Assume records belong to the same claim if IDs directly contradict",
      "Rely on file upload order instead of explicit event dates"
    ]
  },
  {
    id: "event-semantics",
    name: "5. Event Semantics",
    category: "REASONING",
    summary: "Map raw source phrases into clear lifecycle semantics (In-Flight vs Terminal vs Financial).",
    does: [
      "Classify stages: In-Flight (Submitted, Under Process), Terminal (Approved, Rejected, Settled), Financial (Credited)",
      "Recognize that a Passbook credit represents post-settlement financial evidence"
    ],
    doesNot: [
      "Treat all statuses as equally authoritative regardless of stage",
      "Conflate procedural processing with final disbursement"
    ]
  },
  {
    id: "conflict-stale",
    name: "6. Conflict / Stale Checks",
    category: "REASONING",
    summary: "Detect outdated records superseded by newer outcomes and surface true terminal contradictions.",
    does: [
      "Mark earlier in-flight records as superseded by later terminal states",
      "Detect impossible terminal contradictions (e.g. definitive rejection vs bank credit)",
      "Highlight when older portals lag behind newer financial records"
    ],
    doesNot: [
      "Silently discard contradictions to force a tidy answer",
      "Allow an older 'Under Process' banner to overturn a later credit"
    ]
  },
  {
    id: "deterministic-reconciliation",
    name: "7. Deterministic Reconciliation",
    category: "REASONING",
    summary: "Pure rule-based state machine evaluates all facts to select the best-supported claim state.",
    does: [
      "Evaluate chronology, identity, contradictions, and evidence quality",
      "Emit an exact mathematical confidence score (High, Medium, Low)",
      "Safely refuse with CONFLICT or UNKNOWN when evidence is contradictory or insufficient"
    ],
    doesNot: [
      "Invent facts or guess outcomes",
      "Rely on probabilistic token generation for the final decision",
      "Change answers across repeated runs with the same input"
    ]
  },
  {
    id: "evidence-ledger",
    name: "8. Evidence Ledger",
    category: "OUTPUT",
    summary: "Construct an auditable, timestamped ledger linking every conclusion directly to supporting records.",
    does: [
      "Show citizens the chronological timeline of what each source claimed",
      "Tag records clearly: 'Later outcome', 'Earlier record', 'Superseded'",
      "Provide complete provenance for technical and grievance review"
    ],
    doesNot: [
      "Present 'black-box' assertions without citation",
      "Hide discordant evidence from the citizen"
    ]
  },
  {
    id: "answer-action",
    name: "9. Plain-Language Answer + Action",
    category: "OUTPUT",
    summary: "Deliver the 4 critical citizen answers: What happened, Why, What proves it, and What to do next.",
    does: [
      "Answer in plain, accessible language in under 5 seconds",
      "State clear recommended next actions and critical 'Don't do this yet' warnings",
      "Provide a collapsed technical audit trace for reviewers"
    ],
    doesNot: [
      "Use bureaucratic jargon or technical error codes in primary view",
      "Encourage premature duplicate claims or costly grievance filings"
    ]
  }
];

export default function ArchitecturePage() {
  const [expandedStage, setExpandedStage] = useState<string | null>("ai-extraction");

  const toggleStage = (id: string) => {
    setExpandedStage(expandedStage === id ? null : id);
  };

  return (
    <main className="cc-shell" style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "80px" }}>
      {/* HEADER */}
      <header className="cc-header">
        <Link href="/" className="cc-brand">
          <span className="cc-brand-symbol">◈</span>
          ClaimClarity
        </Link>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/" className="cc-btn cc-btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }}>
            ← Back to App
          </Link>
          <Link href="/" className="cc-btn cc-btn-primary" style={{ padding: "8px 16px", fontSize: "14px" }}>
            Try a sample
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "40px 0 32px" }}>
        <p className="cc-eyebrow" style={{ justifyContent: "center" }}>
          SYSTEM DESIGN & SPECIFICATION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 800, color: "var(--cc-ink)", margin: "12px 0", letterSpacing: "-0.03em" }}>
          How ClaimClarity works
        </h1>
        <p style={{ fontSize: "18px", color: "var(--cc-text-muted)", maxWidth: "640px", margin: "0 auto", lineHeight: 1.5 }}>
          AI extracts evidence. Deterministic rules reconcile it. The citizen sees the proof.
        </p>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
          <span className="cc-tag">Synthetic test data</span>
          <span className="cc-tag">No live EPFO access</span>
          <span className="cc-tag">Deterministic state machine</span>
          <span className="cc-tag">Auditable trace</span>
        </div>
      </section>

      {/* CORE BOUNDARY PRINCIPLE */}
      <section style={{
        background: "var(--cc-surface)",
        border: "1px solid var(--cc-border)",
        borderLeft: "4px solid var(--cc-forest)",
        borderRadius: "12px",
        padding: "20px 24px",
        margin: "0 0 40px"
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "var(--cc-forest)" }}>
          THE ARCHITECTURAL BOUNDARY
        </h3>
        <p style={{ margin: 0, fontSize: "15px", color: "var(--cc-ink)", lineHeight: 1.5 }}>
          Large language and vision models are exceptional at parsing messy, unstructured artifacts into typed observations.
          However, <strong>the final claim reconciliation decision must never be generated by an LLM</strong>.
          ClaimClarity enforces a strict separation: AI performs evidence extraction only; a pure, deterministic engine performs reconciliation.
        </p>
      </section>

      {/* PIPELINE ARCHITECTURE DIAGRAM */}
      <section style={{ marginBottom: "50px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
            End-to-End Reconciliation Pipeline
          </h2>
          <span style={{ fontSize: "13px", color: "var(--cc-text-muted)" }}>
            Click any stage to inspect what it does & does not do
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ARCHITECTURE_STAGES.map((stage, idx) => {
            const isExpanded = expandedStage === stage.id;
            return (
              <div
                key={stage.id}
                style={{
                  background: isExpanded ? "var(--cc-surface)" : "white",
                  border: isExpanded ? "1px solid var(--cc-forest)" : "1px solid var(--cc-border)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isExpanded ? "var(--cc-shadow-sm)" : "none"
                }}
                onClick={() => toggleStage(stage.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleStage(stage.id); } }}
                aria-expanded={isExpanded}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: stage.category === "AI" ? "#e8effc" : stage.category === "REASONING" ? "#e6f4ea" : "#f1f3f4",
                      color: stage.category === "AI" ? "#1a73e8" : stage.category === "REASONING" ? "var(--cc-forest)" : "#3c4043",
                      letterSpacing: "0.05em"
                    }}>
                      {stage.category}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--cc-ink)" }}>
                      {stage.name}
                    </h3>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--cc-forest)" }}>
                    {isExpanded ? "Collapse ▲" : "Inspect ▼"}
                  </span>
                </div>

                <p style={{ margin: "8px 0 0", fontSize: "14px", color: "var(--cc-text-muted)", lineHeight: 1.4 }}>
                  {stage.summary}
                </p>

                {isExpanded && (
                  <div style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--cc-border)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px"
                  }}>
                    <div style={{ background: "#f8fdf9", padding: "14px", borderRadius: "8px", border: "1px solid #d2ecd9" }}>
                      <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--cc-forest)", fontWeight: 700, letterSpacing: "0.04em" }}>
                        ✓ WHAT IT DOES
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--cc-ink)", lineHeight: 1.6 }}>
                        {stage.does.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: "#fcf8f8", padding: "14px", borderRadius: "8px", border: "1px solid #f2d6d6" }}>
                      <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#8c3526", fontWeight: 700, letterSpacing: "0.04em" }}>
                        ✕ WHAT IT DOES NOT DO
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--cc-ink)", lineHeight: 1.6 }}>
                        {stage.doesNot.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY THIS ARCHITECTURE? */}
      <section style={{
        background: "white",
        border: "1px solid var(--cc-border)",
        borderRadius: "16px",
        padding: "32px",
        marginBottom: "50px"
      }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 12px", color: "var(--cc-ink)" }}>
          WHY THIS ARCHITECTURE?
        </h2>
        <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--cc-ink)", margin: "0 0 20px" }}>
          LLMs are useful for turning messy evidence into structured observations.
          The final reconciliation decision remains deterministic and auditable.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          <div style={{ padding: "16px", background: "var(--cc-surface)", borderRadius: "10px", border: "1px solid var(--cc-border)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700 }}>1. Zero Decision Hallucination</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--cc-text-muted)", lineHeight: 1.5 }}>
              By restricting generative models to extraction, the system is mathematically incapable of hallucinating a settled or credited claim status that is not supported by chronological evidence.
            </p>
          </div>
          <div style={{ padding: "16px", background: "var(--cc-surface)", borderRadius: "10px", border: "1px solid var(--cc-border)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700 }}>2. Complete Grievance Auditability</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--cc-text-muted)", lineHeight: 1.5 }}>
              Every output produces a deterministic audit trace of fired rules, chronological ordering, and identifier checks. If a citizen files a grievance, the exact proof chain can be reproduced.
            </p>
          </div>
          <div style={{ padding: "16px", background: "var(--cc-surface)", borderRadius: "10px", border: "1px solid var(--cc-border)" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700 }}>3. Safe Refusal by Design</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--cc-text-muted)", lineHeight: 1.5 }}>
              When evidence is missing or fundamentally incompatible, the engine explicitly outputs <code>UNKNOWN</code> or <code>CONFLICT</code> instead of generating plausible-sounding but dangerous advice.
            </p>
          </div>
        </div>
      </section>

      {/* TANGIBLE EXAMPLE SECTION */}
      <section style={{
        background: "#faf9f6",
        border: "1px solid var(--cc-border)",
        borderRadius: "16px",
        padding: "32px",
        marginBottom: "50px"
      }}>
        <p className="cc-eyebrow" style={{ color: "var(--cc-forest)" }}>CONCRETE EXAMPLE WALKTHROUGH</p>
        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "8px 0 16px", color: "var(--cc-ink)" }}>
          How a contradictory claim is resolved
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          alignItems: "stretch"
        }}>
          {/* Step 1: Input Evidence */}
          <div style={{ background: "white", padding: "16px", borderRadius: "10px", border: "1px solid var(--cc-border)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--cc-text-muted)" }}>1. RAW EVIDENCE</span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "13px", padding: "8px", background: "var(--cc-surface)", borderRadius: "6px" }}>
                <b>Portal</b> (03 Jul)<br />
                <span style={{ color: "#8c4e0b" }}>Processing</span>
              </div>
              <div style={{ fontSize: "13px", padding: "8px", background: "var(--cc-surface)", borderRadius: "6px" }}>
                <b>SMS</b> (05 Jul)<br />
                <span style={{ color: "#8c4e0b" }}>Processing</span>
              </div>
              <div style={{ fontSize: "13px", padding: "8px", background: "#e8f5ed", borderRadius: "6px" }}>
                <b>Passbook</b> (13 Jul)<br />
                <span style={{ color: "var(--cc-forest)", fontWeight: 700 }}>₹45,000 credited</span>
              </div>
            </div>
          </div>

          {/* Step 2: Reconciliation */}
          <div style={{ background: "white", padding: "16px", borderRadius: "10px", border: "1px solid var(--cc-border)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--cc-forest)" }}>2. RECONCILIATION</span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "var(--cc-text-muted)" }}>
              <div style={{ padding: "8px", background: "var(--cc-surface)", borderRadius: "6px" }}>
                ✓ <b>Chronology:</b> 13 Jul &gt; 05 Jul &gt; 03 Jul
              </div>
              <div style={{ padding: "8px", background: "var(--cc-surface)", borderRadius: "6px" }}>
                ✓ <b>Status precedence:</b> Later financial credit supersedes earlier in-flight processing
              </div>
              <div style={{ padding: "8px", background: "var(--cc-surface)", borderRadius: "6px" }}>
                ✓ <b>Tagged:</b> Portal & SMS marked <em>Superseded</em>
              </div>
            </div>
          </div>

          {/* Step 3: Final Supported State */}
          <div style={{ background: "white", padding: "16px", borderRadius: "10px", border: "2px solid var(--cc-forest)" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--cc-forest)" }}>3. CITIZEN ANSWER</span>
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--cc-text-muted)" }}>Supported state:</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cc-forest)", margin: "4px 0 8px" }}>
                CREDITED
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--cc-ink)", lineHeight: 1.4 }}>
                <strong>Why:</strong> Later financial evidence supports a completed outcome. Older portal records reflect delayed sync.
              </p>
              <div style={{ marginTop: "10px", padding: "6px 8px", background: "#fef9ee", borderRadius: "6px", fontSize: "11px", color: "#8c4e0b" }}>
                <strong>Action:</strong> Check bank account; do not reapply.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL DISCLOSURE & SPECIFICATION FOOTER */}
      <section style={{
        padding: "24px",
        borderTop: "1px solid var(--cc-border)",
        color: "var(--cc-text-muted)",
        fontSize: "13px",
        lineHeight: 1.6
      }}>
        <h4 style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: "var(--cc-ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Technical Disclosure & Implementation Notes
        </h4>
        <p style={{ margin: "0 0 10px" }}>
          Evidence extraction uses Google Gemini 2.5 Flash with structured output schemas (JSON Mode + Zod) on the backend.
          The reconciliation engine is implemented in pure TypeScript without external model dependencies, guaranteeing deterministic execution across serverless environments.
        </p>
        <p style={{ margin: 0 }}>
          ClaimClarity is an independent public-utility prototype developed for civic decision support. It is not affiliated with, endorsed by, or integrated with the Employees&apos; Provident Fund Organisation (EPFO).
        </p>
      </section>
    </main>
  );
}
