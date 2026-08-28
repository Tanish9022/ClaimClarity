"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ArchitecturePage() {
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [geminiMode, setGeminiMode] = useState(false);

  const startTrace = (useGemini: boolean) => {
    setGeminiMode(useGemini);
    setIsTracing(true);
    setPipelineStep(1);
  };

  useEffect(() => {
    if (isTracing && pipelineStep > 0 && pipelineStep < 5) {
      const timer = setTimeout(() => setPipelineStep(pipelineStep + 1), 1000);
      return () => clearTimeout(timer);
    } else if (pipelineStep === 5) {
      const timer = setTimeout(() => setIsTracing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [pipelineStep, isTracing]);

  const getNodeClass = (stepNum: number) => {
    if (!isTracing && pipelineStep === 0) return "pipeline-node trace-node";
    if (pipelineStep > stepNum) return "pipeline-node trace-node done";
    if (pipelineStep === stepNum) return "pipeline-node trace-node active";
    return "pipeline-node trace-node";
  };

  const getConnectorClass = (stepNum: number) => {
    if (!isTracing && pipelineStep === 0) return "pipeline-connector trace-connector";
    if (pipelineStep >= stepNum) return "pipeline-connector trace-connector active";
    return "pipeline-connector trace-connector";
  };

  return (
    <main className="shell" style={{ maxWidth: '1000px', width: '100%' }}>
      <header style={{ marginBottom: "0px", paddingBottom: "10px", borderBottom: "1px solid var(--line)" }}>
        <Link href="/" className="back" style={{ textDecoration: 'none' }}>← Back to ClaimClarity</Link>
        <Link href="/" className="primary" style={{ padding: '8px 16px', fontSize: '14px', margin: 0, textDecoration: 'none' }}>Try the demo</Link>
      </header>

      {/* PAGE HERO */}
      <section className="arch-hero">
        <p className="eyebrow">TECHNICAL ARCHITECTURE</p>
        <h1>How ClaimClarity works</h1>
        <p className="lead" style={{ margin: '0 auto' }}>From fragmented evidence to one explainable claim state.</p>
        <div className="metadata">
          <span className="demo-pill">Synthetic data</span>
          <span className="demo-pill">No live EPFO access</span>
          <span className="demo-pill">Gemini + deterministic rules</span>
        </div>
      </section>

      {/* MAIN ARCHITECTURE DIAGRAM */}
      <section className="section" style={{ marginTop: '20px' }}>
        <div className="pipeline-container horizontal">
          {/* Node 1 */}
          <div className="pipeline-node">
            <span className="category">INPUT</span>
            <h3>Citizen Evidence</h3>
            <p>Screenshots, claim records and messages supplied by the user.</p>
            <span className="impl">EvidenceUploader</span>
          </div>

          <div className="pipeline-connector"><div className="arrow-down"></div></div>

          {/* Node 2 */}
          <div className="pipeline-node">
            <span className="category">FRONTEND</span>
            <h3>Next.js Client</h3>
            <p>Passes evidence and triggers the server-side analysis boundary.</p>
            <span className="impl">app/page.tsx</span>
          </div>

          <div className="pipeline-connector"><div className="arrow-down"></div></div>

          {/* AI GROUP */}
          <div className="pipeline-group" data-type="ai">
            <div className="pipeline-node" style={{ width: '100%', border: '1px solid #c4d7f5' }}>
              <span className="category" style={{ color: '#2e6bc2' }}>AI</span>
              <h3>Gemini Extraction</h3>
              <p>Extracts only facts explicitly present in supplied evidence.</p>
              <span className="impl">lib/ai/extractEvidence.ts</span>
            </div>
          </div>

          <div className="pipeline-connector">
            <span className="label">STRUCTURED EVIDENCE</span>
            <div className="arrow-down"></div>
          </div>

          {/* LOGIC GROUP */}
          <div className="pipeline-group" data-type="logic" style={{ flexDirection: 'column' }}>
            <div className="pipeline-node" style={{ border: '1px solid #cce3d8' }}>
              <span className="category" style={{ color: 'var(--green)' }}>VALIDATION</span>
              <h3>Zod Validation</h3>
              <p>Reject malformed model output strictly at runtime.</p>
              <span className="impl">lib/schemas</span>
            </div>

            <div className="pipeline-connector" style={{ minHeight: '30px' }}><div className="arrow-down"></div></div>

            <div className="pipeline-node" style={{ border: '1px solid #cce3d8' }}>
              <span className="category" style={{ color: 'var(--green)' }}>CORE LOGIC</span>
              <h3>Deterministic Engine</h3>
              <p>Match artifacts, build chronology, detect conflicts & calculate confidence.</p>
              <span className="impl">lib/reconciliation/reconcileClaim.ts</span>
            </div>
          </div>

          <div className="pipeline-connector">
            <span className="label">RECONCILIATION RESULT</span>
            <div className="arrow-down"></div>
          </div>

          {/* Node Output */}
          <div className="pipeline-node">
            <span className="category">OUTPUT</span>
            <h3>Citizen Answer</h3>
            <p>Best-supported state, timeline, uncertainty and safe next action.</p>
            <span className="impl">Result View</span>
          </div>
        </div>

        <div className="boundary-label">AI does not decide the final state.</div>
      </section>

      {/* REQUEST FLOW */}
      <section className="section">
        <h2>What happens when you click Analyze?</h2>
        <div className="journey-container">
          <div className="journey-step">
            <div className="num">01</div>
            <div><h4>Collect</h4><p>Citizen supplies evidence.</p></div>
          </div>
          <div className="journey-step">
            <div className="num">02</div>
            <div><h4>Extract</h4><p>Gemini converts messy input into structured observations.</p></div>
          </div>
          <div className="journey-step">
            <div className="num">03</div>
            <div><h4>Validate</h4><p>Zod rejects malformed output.</p></div>
          </div>
          <div className="journey-step">
            <div className="num">04</div>
            <div><h4>Reconcile</h4><p>Deterministic rules detect chronology, conflicts and stale signals.</p></div>
          </div>
          <div className="journey-step">
            <div className="num">05</div>
            <div><h4>Explain</h4><p>ClaimClarity presents the best-supported state and next safe action.</p></div>
          </div>
        </div>
      </section>

      {/* REAL DATA EXAMPLE */}
      <section className="section">
        <h2>See one claim move through the system</h2>
        <div className="data-flow pipeline-container horizontal" style={{ maxWidth: '100%', margin: 0 }}>
          <div className="pipeline-node">
            <span className="category">INPUT</span>
            <article className="evidence" style={{ padding: '8px', marginBottom: '4px' }}><div><b>New tracker</b></div><strong>Claim Submitted</strong></article>
            <article className="evidence" style={{ padding: '8px', marginBottom: '4px' }}><div><b>Old tracker</b></div><strong>Under Process</strong></article>
            <article className="evidence" style={{ padding: '8px', marginBottom: '4px' }}><div><b>Passbook</b></div><strong>Pending</strong></article>
            <article className="evidence" style={{ padding: '8px', marginBottom: '4px' }}><div><b>SMS</b></div><strong>Under Process</strong></article>
          </div>
          <div className="pipeline-connector"><div className="arrow-down"></div></div>
          <div className="pipeline-node">
            <span className="category">STRUCTURE (GEMINI)</span>
            <pre style={{ margin: 0, padding: '10px', fontSize: '11px', background: '#f7f6ef', color: 'var(--ink)' }}>
{`[
  {
    "source": "new_tracker",
    "status": "Claim Submitted",
    "date": "2026-07-03"
  },
  // ... 3 more facts
]`}
            </pre>
          </div>
          <div className="pipeline-connector"><div className="arrow-down"></div></div>
          <div className="pipeline-node">
            <span className="category">REASON (LOGIC)</span>
            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px', color: 'var(--muted)' }}>
              <li>4 observations validated</li>
              <li>Conflict detected</li>
              <li>Chronology built</li>
              <li>Confidence = Medium</li>
            </ul>
          </div>
          <div className="pipeline-connector"><div className="arrow-down"></div></div>
          <div className="pipeline-node" style={{ borderLeft: '4px solid var(--green)' }}>
            <span className="category">ANSWER</span>
            <p style={{ margin: '0 0 5px', fontSize: '13px' }}><b>Best-supported state:</b></p>
            <h3 style={{ margin: '0 0 10px' }}>UNDER PROCESS</h3>
            <p style={{ margin: '0 0 5px', fontSize: '13px' }}><b>Recommended:</b></p>
            <div className="action" style={{ padding: '8px', fontSize: '12px' }}>WAIT / MONITOR</div>
          </div>
        </div>
      </section>

      {/* AI VS DETERMINISTIC */}
      <section className="section" style={{ background: '#14231e', margin: '60px -20px', padding: '60px 20px', borderRadius: '24px', color: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--mint)', margin: 0, fontSize: 'clamp(28px, 5vw, 42px)' }}>AI handles extraction.<br/>Rules handle the decision.</h1>
        </div>
        <div className="comparison-grid">
          <div className="comp-card" style={{ background: '#1c312a', borderColor: '#27433a', color: 'white' }}>
            <span className="demo-pill" style={{ background: '#2e6bc2', color: 'white', marginBottom: '15px', display: 'inline-block' }}>AI INTERPRETATION</span>
            <h2 style={{ color: 'white' }}>Gemini</h2>
            <ul style={{ color: '#dff4e7' }}>
              <li><span className="check">✓</span> Extract facts</li>
              <li><span className="check">✓</span> Read messy evidence</li>
              <li><span className="check">✓</span> Interpret screenshots/text</li>
              <li><span className="check">✓</span> Identify ambiguity</li>
            </ul>
            <ul style={{ color: '#a5b5ab', marginTop: '20px', borderTop: '1px solid #27433a', paddingTop: '20px' }}>
              <li><span className="cross">✕</span> Decide official status</li>
              <li><span className="cross">✕</span> Invent missing facts</li>
              <li><span className="cross">✕</span> Choose final action</li>
            </ul>
          </div>
          <div className="comp-card" style={{ background: '#1c312a', borderColor: '#27433a', color: 'white' }}>
            <span className="demo-pill" style={{ marginBottom: '15px', display: 'inline-block' }}>DETERMINISTIC LOGIC</span>
            <h2 style={{ color: 'white' }}>Reconciliation Engine</h2>
            <ul style={{ color: '#dff4e7' }}>
              <li><span className="check">✓</span> Normalize states</li>
              <li><span className="check">✓</span> Build chronology</li>
              <li><span className="check">✓</span> Detect conflicts</li>
              <li><span className="check">✓</span> Detect stale signals</li>
              <li><span className="check">✓</span> Calculate confidence</li>
              <li><span className="check">✓</span> Choose safe action</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DEMO MODE VS GEMINI MODE */}
      <section className="section">
        <h2>Resilience Architecture</h2>
        <div className="branch-container">
          <div className="branch">
            <div className="branch-title">DEMO MODE</div>
            <div className="pipeline-container">
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center' }}>Synthetic facts</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center' }}>Reconciliation engine</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center', borderLeft: '4px solid var(--green)' }}>Result</div>
            </div>
            <p className="fine" style={{ textAlign: 'center' }}>No API key required.</p>
          </div>
          <div className="branch">
            <div className="branch-title">GEMINI MODE</div>
            <div className="pipeline-container">
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center' }}>Synthetic/user evidence</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center', borderColor: '#c4d7f5' }}>Gemini</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center' }}>Validation</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center' }}>Reconciliation</div>
              <div className="pipeline-connector" style={{ minHeight: '20px' }}><div className="arrow-down"></div></div>
              <div className="pipeline-node" style={{ padding: '10px', textAlign: 'center', borderLeft: '4px solid var(--green)' }}>Result</div>
            </div>
            <p className="fine" style={{ textAlign: 'center' }}>GEMINI_API_KEY available server-side.</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TRACE */}
      <section className="section" style={{ padding: '40px', background: '#f7f6ef', borderRadius: '16px', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
          <h2 style={{ margin: 0 }}>Trace this claim</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="secondary" onClick={() => startTrace(false)} disabled={isTracing} style={{ margin: 0, fontSize: '14px', padding: '10px 15px' }}>Run Demo pipeline</button>
            <button className="primary" onClick={() => startTrace(true)} disabled={isTracing} style={{ margin: 0, fontSize: '14px', padding: '10px 15px' }}>Run Gemini pipeline</button>
          </div>
        </div>

        <div className="pipeline-container horizontal">
          <div className={getNodeClass(1)}>
            <span className="category">01</span>
            <h3>Evidence</h3>
            {pipelineStep >= 1 && <span className="status-indicator" style={{ color: 'var(--green)' }}>✓</span>}
          </div>
          <div className={getConnectorClass(2)}><div className="arrow-down"></div></div>
          
          <div className={getNodeClass(2)}>
            <span className="category">02</span>
            <h3>{geminiMode ? "Gemini" : "Bypass (Demo)"}</h3>
            {pipelineStep >= 2 && <span className="status-indicator" style={{ color: 'var(--green)' }}>✓</span>}
          </div>
          <div className={getConnectorClass(3)}><div className="arrow-down"></div></div>

          <div className={getNodeClass(3)}>
            <span className="category">03</span>
            <h3>Validation</h3>
            {pipelineStep >= 3 && <span className="status-indicator" style={{ color: 'var(--green)' }}>✓</span>}
          </div>
          <div className={getConnectorClass(4)}><div className="arrow-down"></div></div>

          <div className={getNodeClass(4)}>
            <span className="category">04</span>
            <h3>Reconciliation</h3>
            {pipelineStep >= 4 && <span className="status-indicator" style={{ color: 'var(--green)' }}>✓</span>}
          </div>
          <div className={getConnectorClass(5)}><div className="arrow-down"></div></div>

          <div className={getNodeClass(5)} style={{ borderLeft: pipelineStep >= 5 ? '4px solid var(--green)' : '2px solid transparent' }}>
            <span className="category">05</span>
            <h3>Result</h3>
            {pipelineStep >= 5 && <span className="status-indicator" style={{ color: 'var(--green)' }}>✓</span>}
          </div>
        </div>

        {pipelineStep === 5 && (
          <div style={{ marginTop: '30px', textAlign: 'center', animation: 'fade-slide-in 0.5s ease' }}>
            <p className="eyebrow">PIPELINE COMPLETE</p>
            <div style={{ display: 'inline-block', background: 'white', padding: '15px 30px', borderRadius: '12px', border: '1px solid var(--green)' }}>
              <p style={{ margin: '0 0 5px' }}>Best-supported state: <b>Under Process</b></p>
              <p style={{ margin: 0 }}>Confidence: <span className="badge medium" style={{marginLeft: '5px'}}>Medium</span></p>
            </div>
          </div>
        )}
      </section>

      {/* IMPLEMENTATION MAP */}
      <section className="section">
        <h2 style={{ textAlign: 'center' }}>Implementation Map</h2>
        <div className="impl-map">
          <div className="impl-item">
            <div className="module">Frontend</div>
            <div className="file">app/page.tsx</div>
            <p className="desc">Citizen landing experience.</p>
          </div>
          <div className="impl-item">
            <div className="module">API</div>
            <div className="file">app/api/analyze/route.ts</div>
            <p className="desc">Analysis orchestration.</p>
          </div>
          <div className="impl-item">
            <div className="module">AI</div>
            <div className="file">lib/ai/extractEvidence.ts</div>
            <p className="desc">Gemini extraction wrapper.</p>
          </div>
          <div className="impl-item">
            <div className="module">Validation</div>
            <div className="file">lib/schemas/index.ts</div>
            <p className="desc">Zod schemas.</p>
          </div>
          <div className="impl-item">
            <div className="module">Rules</div>
            <div className="file">lib/reconciliation/reconcileClaim.ts</div>
            <p className="desc">Deterministic engine.</p>
          </div>
          <div className="impl-item">
            <div className="module">Synthetic data</div>
            <div className="file">lib/data/sampleClaims.ts</div>
            <p className="desc">Precomputed demo observations.</p>
          </div>
          <div className="impl-item">
            <div className="module">Tests</div>
            <div className="file">tests/</div>
            <p className="desc">Automated vitest/playwright suites.</p>
          </div>
        </div>
      </section>

      {/* SAFETY BOUNDARY */}
      <section className="section">
        <div className="safety-strip">
          <div className="safety-side no">
            <h3 style={{ color: '#8c3526' }}>ClaimClarity does NOT:</h3>
            <ul>
              <li><span className="cross" style={{ color: '#8c3526', marginRight: '8px' }}>✕</span> Live EPFO access</li>
              <li><span className="cross" style={{ color: '#8c3526', marginRight: '8px' }}>✕</span> EPFO mutation</li>
              <li><span className="cross" style={{ color: '#8c3526', marginRight: '8px' }}>✕</span> EPFO authentication</li>
              <li><span className="cross" style={{ color: '#8c3526', marginRight: '8px' }}>✕</span> Official status verification</li>
              <li><span className="cross" style={{ color: '#8c3526', marginRight: '8px' }}>✕</span> Real citizen credentials</li>
            </ul>
          </div>
          <div className="safety-side yes">
            <h3 style={{ color: 'var(--green)' }}>ClaimClarity DOES:</h3>
            <ul>
              <li><span className="check" style={{ color: 'var(--green)', marginRight: '8px' }}>✓</span> Reconcile supplied evidence</li>
              <li><span className="check" style={{ color: 'var(--green)', marginRight: '8px' }}>✓</span> Explain conflicts</li>
              <li><span className="check" style={{ color: 'var(--green)', marginRight: '8px' }}>✓</span> Show uncertainty</li>
              <li><span className="check" style={{ color: 'var(--green)', marginRight: '8px' }}>✓</span> Provide prototype-safe next action</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="section" style={{ textAlign: 'center', margin: '80px 0 40px' }}>
        <h1>See it in action</h1>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <Link href="/" className="primary" style={{ textDecoration: 'none' }}>Try ClaimClarity <span>→</span></Link>
          <button className="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to architecture</button>
        </div>
      </section>

    </main>
  );
}
