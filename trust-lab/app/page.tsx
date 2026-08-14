"use client";

import { useEffect, useMemo, useState } from "react";

type Decision = "Ready" | "Allowed" | "Review required" | "Denied";

const mcpTools = [
  { name: "case_triage.route", category: "Triage", access: "Automatic", detail: "Route a fictional case to an information queue", output: "Automatically routed to the fictional information-review queue. This action is reversible, creates no financial or enforcement outcome, and was recorded for review." },
  { name: "case_guidance.read", category: "Knowledge", access: "Available", detail: "Retrieve fictional internal procedures", output: "Guidance retrieved: escalation requires documented evidence and reviewer confirmation." },
  { name: "case_brief.prepare", category: "Casework", access: "Available", detail: "Prepare a fictional investigator brief", output: "Draft brief prepared with source references and unresolved evidence clearly marked." },
  { name: "partner_share.request", category: "Disclosure", access: "Review", detail: "Request an approved partner-agency share", output: "A reviewer must approve this simulated restricted disclosure before it can continue." },
  { name: "records.export", category: "Records", access: "Blocked", detail: "Bulk export of fictional records", output: "Request blocked: bulk export is outside the public demo agent's authority." }
];

const fictionalCases = [
  ["case_guidance.read", "Knowledge", "Retrieve a fictional investigation procedure"],
  ["evidence_bundle.prepare", "Evidence", "Prepare a synthetic evidence package"],
  ["partner_share.request", "Disclosure", "Request a fictional cross-agency disclosure"],
  ["case_triage.route", "Triage", "Route a fictional administrative case"],
  ["records_scope.check", "Records", "Check a fictional records-access scope"],
  ["report_draft.prepare", "Casework", "Draft a fictional investigator report"]
];

const operationZones = {
  signal: { title: "Area signal", text: "A fictional aggregate anomaly enters the system. It is a lead for review, not a claim about a person or place.", tag: "Aggregate only" },
  evidence: { title: "Evidence desk", text: "Approved synthetic sources are checked for provenance, coverage, and contradictions before the system makes a recommendation.", tag: "Source verified" },
  policy: { title: "Trust gateway", text: "The policy engine evaluates the proposed MCP tool call against identity, purpose, scope, and data classification.", tag: "Policy evaluated" },
  review: { title: "Human checkpoint", text: "Sensitive, financial, or enforcement-related actions stop here for an accountable reviewer.", tag: "Human authority" },
  record: { title: "Forensic record", text: "Every signal, tool request, policy outcome, and human decision is added to an integrity-linked timeline.", tag: "Audit intact" }
};

const operationProfiles = [
  { label: "Source verification", scope: "Aggregate only", confidence: 58, events: ["Synthetic source scope verified", "Coverage gap retained", "Evidence desk engaged"] },
  { label: "Policy boundary", scope: "Review-gated", confidence: 66, events: ["Purpose check completed", "Restricted action paused", "Human authority retained"] },
  { label: "Record integrity", scope: "Audit-linked", confidence: 73, events: ["Fictional event signed", "Timeline consistency checked", "Independent review ready"] }
];

const areaSignals = [
  { title: "Review warranted", summary: "A fictional combination of aggregate indicators merits a qualified human review. It is not an accusation or a finding of wrongdoing.", detail: "A fictional pattern across three approved, aggregate indicators needs context before any next step.", indicators: ["Aggregate reporting trend", "Fictional licensing variance", "Casework volume pattern"], confidence: "Confidence: limited · Uncertainty: material" },
  { title: "Signal elevated", summary: "A fictional aggregate change is above the local reference range. The system recommends scope and source checks, not action against a person.", detail: "The fictional simulation found an unusual change in the approved area-level inputs and asks a reviewer to validate source coverage.", indicators: ["Synthetic reporting shift", "Fictional service-volume change", "Approved trend comparison"], confidence: "Confidence: moderate · Uncertainty: retained" },
  { title: "Monitor only", summary: "A fictional aggregate variation remains inside a monitoring band. It is retained as context, with no recommendation for further records.", detail: "The fictional signal is logged as low-priority context and remains challengeable in the evidence record.", indicators: ["Aggregate baseline", "Synthetic seasonal pattern", "Fictional coverage check"], confidence: "Confidence: limited · No action recommended" }
];

const riskStages = [
  { title: "Aggregate intake", text: "Fictional aggregate indicators enter with clear source ownership and permitted-use limits." },
  { title: "Pattern comparison", text: "The system compares fictional trends and presents uncertainty; it does not identify a person or assert wrongdoing." },
  { title: "Evidence verification", text: "Approved synthetic sources are checked for provenance, coverage, and conflicts." },
  { title: "Authority gate", text: "The request is limited by simulated jurisdiction, purpose, classification, and role authority." },
  { title: "Investigator review", text: "A qualified human decides whether a lawful, proportionate next step is warranted." },
  { title: "Forensic record", text: "The complete fictional workflow is stored in a tamper-evident investigation timeline." }
];

const riskProfiles = [
  { label: "Aggregate variance", posture: "Monitor", description: "A fictional variance is retained as aggregate context. It is not evidence about a person or organization.", score: 31, confidence: 56, sources: 2 },
  { label: "Cross-source mismatch", posture: "Verify", description: "Fictional aggregate sources differ enough to warrant a provenance and coverage check before any human review.", score: 48, confidence: 63, sources: 3 },
  { label: "Coverage change", posture: "Context required", description: "A fictional input-coverage shift may explain the pattern; the system records uncertainty instead of escalating it.", score: 24, confidence: 51, sources: 2 }
];

const scenarios = {
  knowledge: {
    title: "Read approved guidance",
    action: "Retrieve an internal fraud-investigation procedure",
    decision: "Allowed" as const,
    reason: "This is a read-only request to an approved internal source.",
    evidence: "Policy FT-READ-04 · Internal guidance register · Source verified"
  },
  share: {
    title: "Share a case brief",
    action: "Send a restricted case summary to a partner agency",
    decision: "Review required" as const,
    reason: "The request involves restricted information and an external recipient.",
    evidence: "Policy FT-SHARE-12 · Purpose check passed · Human authorization needed"
  },
  export: {
    title: "Export a records list",
    action: "Export a list of fictional business records",
    decision: "Denied" as const,
    reason: "Bulk export is outside this simulated agent’s authority.",
    evidence: "Policy FT-EXPORT-01 · Least-privilege boundary · No authorization"
  }
};

export default function Home() {
  const [selected, setSelected] = useState<keyof typeof scenarios>("knowledge");
  const [decision, setDecision] = useState<Decision>("Ready");
  const [approved, setApproved] = useState<boolean | null>(null);
  const [tool, setTool] = useState(mcpTools[0]);
  const [toolResult, setToolResult] = useState("Select a fictional MCP tool to see how the gateway governs access.");
  const [assessment, setAssessment] = useState(false);
  const [signalIndex, setSignalIndex] = useState(0);
  const [zone, setZone] = useState<keyof typeof operationZones>("signal");
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [operationProfileIndex, setOperationProfileIndex] = useState(0);
  const [operationPulse, setOperationPulse] = useState(0);
  const [riskOpen, setRiskOpen] = useState(false);
  const [riskStage, setRiskStage] = useState(0);
  const [riskSeed, setRiskSeed] = useState(32);
  const [riskProfileIndex, setRiskProfileIndex] = useState(0);
  const [riskPulse, setRiskPulse] = useState(0);
  const [gatewaySeed, setGatewaySeed] = useState(1);
  const scenario = scenarios[selected];
  const areaSignal = areaSignals[signalIndex];
  const operationProfile = operationProfiles[operationProfileIndex];
  const riskProfile = riskProfiles[riskProfileIndex];
  const events = useMemo(() => [
    "Case opened with fictional, aggregate evidence",
    "Source provenance verified",
    decision === "Ready" ? "Awaiting a simulated agent request" : `Policy decision: ${decision}`,
    approved === null ? "No human decision recorded" : approved ? "Reviewer approved the limited action" : "Reviewer rejected the action"
  ], [decision, approved]);

  useEffect(() => {
    const timer = window.setInterval(() => setSignalIndex(current => (current + 1) % areaSignals.length), 9500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!operationsOpen) return;
    const keys = Object.keys(operationZones) as Array<keyof typeof operationZones>;
    const timer = window.setInterval(() => {
      setZone(current => keys[(keys.indexOf(current) + 1) % keys.length]);
      setOperationProfileIndex(current => (current + 1) % operationProfiles.length);
      setOperationPulse(current => current + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [operationsOpen]);

  function refreshOperationsSimulation() {
    const keys = Object.keys(operationZones) as Array<keyof typeof operationZones>;
    setZone(current => keys[(keys.indexOf(current) + 1) % keys.length]);
    setOperationProfileIndex(current => (current + 1) % operationProfiles.length);
    setOperationPulse(current => current + 1);
  }

  useEffect(() => {
    if (!riskOpen) return;
    const timer = window.setInterval(() => {
      setRiskStage(current => (current + 1) % riskStages.length);
      setRiskSeed(() => Math.floor(Math.random() * 900) + 100);
      setRiskProfileIndex(current => (current + 1) % riskProfiles.length);
      setRiskPulse(current => current + 1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [riskOpen]);

  function refreshRiskSimulation() {
    setRiskSeed(() => Math.floor(Math.random() * 900) + 100);
    setRiskProfileIndex(current => (current + 1) % riskProfiles.length);
    setRiskStage(current => (current + 1) % riskStages.length);
    setRiskPulse(current => current + 1);
  }

  function runSimulation() {
    setDecision(scenario.decision);
    setApproved(null);
  }

  const simulatedTools = useMemo(() => fictionalCases.slice(gatewaySeed % 2, (gatewaySeed % 2) + 5).map(([name, category, detail], index) => ({ name, category, detail, access: ["Available", "Review", "Blocked", "Automatic"][((gatewaySeed * 7) + index) % 4] })), [gatewaySeed]);
  const activeTool = simulatedTools.find(item => item.name === tool.name) ?? simulatedTools[0];

  function refreshGateway() {
    const next = gatewaySeed + 1;
    setGatewaySeed(next);
    const nextTools = fictionalCases.slice(next % 2, (next % 2) + 5);
    setTool({ name: nextTools[0][0], category: nextTools[0][1], access: "Available", detail: nextTools[0][2], output: "" });
    setToolResult("A fresh fictional MCP case registry was generated locally.");
  }

  function runTool() {
    const outcomes = [
      "Allowed: the synthetic request matched its fictional scope, purpose, and data classification.",
      "Review required: the synthetic request is held for a fictional accountable reviewer.",
      "Denied: the synthetic request exceeded the fictional agent’s permitted scope.",
      "Auto-approved: the synthetic request is reversible, administrative, and recorded for review."
    ];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    setToolResult(`${outcome} Audit event: fictional MCP call recorded with policy rationale.`);
  }

  return (
    <main>
      <nav className="nav">
        <div className="brand"><span className="brand-mark">◈</span> Agentic Trust Layer</div>
        <div className="nav-actions"><a href="/console">Open Trust Console</a><div className="pill">Public demo · synthetic data only</div></div>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">TRUST LAB / INTERACTIVE CONCEPT</p>
          <h1>See how accountable AI decisions should work.</h1>
          <p className="lede">Try a fictional fraud-investigation workflow. The system evaluates a proposed agent action, explains the policy result, and preserves an evidence trail for review.</p>
          <div className="hero-notes"><span>● No real people</span><span>● No surveillance</span><span>● Evidence before action</span></div>
        </div>
        <div className="signal-card">
          <p className="signal-label">SIMULATED AREA SIGNAL</p>
          <strong>{areaSignal.title}</strong>
          <p>{areaSignal.summary}</p>
          <div className={`signal-meter signal-${signalIndex}`}><i /><i /><i /><i /></div>
          <button className="signal-button" onClick={() => setAssessment(current => !current)}>{assessment ? "Hide simulated assessment" : "Inspect simulated AI assessment"}</button>
        </div>
      </section>

      {assessment && <section className="assessment-wrap"><div className="assessment-card"><div><p className="eyebrow">SIMULATED AI ASSESSMENT</p><h2>{areaSignal.detail}</h2><p>This rotating simulation cannot identify a person, infer guilt, or access additional records without a human decision and lawful scope.</p></div><div className="assessment-evidence"><p>EVIDENCE REVIEWED</p>{areaSignal.indicators.map(indicator => <span key={indicator}>{indicator}</span>)}<p className="confidence">{areaSignal.confidence}</p></div></div></section>}

      <section className="operations-section"><div className="operations-copy"><p className="eyebrow">3D OPERATIONS CENTER / FICTIONAL SIMULATION</p><h2>Walk through the trust decision.</h2><p>Select a station in the fictional operations center to follow one simulated signal from initial detection to accountable record.</p><div className="layer-grid"><span>Mission scope</span><span>Evidence confidence</span><span>Legal authority</span><span>Agency boundary</span><span>Independent oversight</span></div>{!operationsOpen && <button className="launch-operations" onClick={() => setOperationsOpen(true)}>Launch 3D Operations Center <span>→</span></button>}</div>{operationsOpen && <div className="operations-layout"><div className={`scene scene-pulse-${operationPulse % 3}`} aria-label="Interactive 3D operations center"><div className="scene-floor" /><div className="scene-grid" /><div className="scene-scan" /><div className="scene-radar" /><div className="scene-telemetry"><span><i /> FICTITIOUS SIGNAL FLOW</span><strong>{operationPulse + 1} cycles recorded</strong></div><div className="scene-core"><strong>{operationProfile.confidence}%</strong><small>fictional confidence</small></div>{Object.entries(operationZones).map(([key, item]) => <button key={key} data-label={item.title} onClick={() => setZone(key as keyof typeof operationZones)} className={`station ${key} ${zone === key ? "active" : ""}`}><span className="station-icon">{key === "signal" ? "⌁" : key === "evidence" ? "◫" : key === "policy" ? "⌘" : key === "review" ? "◉" : "✓"}</span><strong>{item.title}</strong></button>)}<div className="connection line-one" /><div className="connection line-two" /><div className="connection line-three" /><div className="connection line-four" /></div><aside className="zone-card"><p className="eyebrow">LIVE FICTIONAL WALKTHROUGH</p><div className="operation-profile"><span>{operationProfile.scope}</span><strong>{operationProfile.label}</strong></div><span className="zone-tag">{operationZones[zone].tag}</span><h3>{operationZones[zone].title}</h3><p>{operationZones[zone].text}</p><div className="zone-flow"><span>Signal</span><b>→</b><span>Policy</span><b>→</b><span>Record</span></div><div className="operation-events"><p>FICTIONAL LIVE EVENTS</p>{operationProfile.events.map(event => <span key={event}>{event}</span>)}</div><button className="operations-refresh" onClick={refreshOperationsSimulation}>Generate fictional mission cycle <span>↻</span></button><small>Auto-rotates through fictional stages · Click any station to take control.</small></aside></div>}</section>

      <section className="risk-section"><div className="operations-copy"><p className="eyebrow">FINANCIAL-RISK OPERATIONS CENTER / FICTIONAL SIMULATION</p><h2>Trace a reviewable financial-risk signal.</h2><p>This second experience demonstrates how a government team could connect authorized, synthetic aggregate signals without identifying anyone or treating an AI pattern as proof.</p>{!riskOpen && <button className="launch-operations" onClick={() => setRiskOpen(true)}>Launch financial-risk simulation <span>→</span></button>}</div>{riskOpen && <div className="risk-sim"><div className={`risk-map pulse-${riskPulse % 3}`}><div className="risk-orbit orbit-a" /><div className="risk-orbit orbit-b" /><div className="risk-scan-line" /><div className="risk-center"><strong>{riskProfile.score}</strong><small>synthetic signal</small></div>{riskStages.map((stage, index) => <button key={stage.title} data-label={stage.title} className={riskStage === index ? "risk-node active" : "risk-node"} onClick={() => setRiskStage(index)}><span>{index + 1}</span>{stage.title}</button>)}</div><div className="risk-detail"><p className="eyebrow">SIMULATED STAGE {riskStage + 1} OF 6 · LIVE SYNTHETIC FEED</p><div className="risk-profile"><span>{riskProfile.posture}</span><strong>{riskProfile.label}</strong></div><h3>{riskStages[riskStage].title}</h3><p>{riskStages[riskStage].text}</p><p className="risk-profile-copy">{riskProfile.description}</p><div className="risk-metrics"><span><b>{riskSeed % 71 + 24}</b> synthetic coverage</span><span><b>{riskProfile.confidence}%</b> signal confidence</span><span><b>{riskProfile.sources}</b> source checks</span></div><div className="risk-events"><p>FICTIONAL EVIDENCE EVENTS</p><span>Aggregate source scope verified</span><span>Uncertainty retained in record</span><span>Human review boundary enforced</span></div><button className="risk-refresh" onClick={refreshRiskSimulation}>Generate synthetic risk cycle <span>↻</span></button><span className="risk-safe">Synthetic data · Aggregate-first · Human accountable</span><small className="risk-rotation">Stages and fictional metrics refresh automatically.</small></div></div>}</section>

      <section className="lab-grid" aria-label="Interactive trust lab">
        <article className="panel request-panel">
          <div className="panel-heading"><div><p className="eyebrow">STEP 01</p><h2>Propose an agent action</h2></div><span className="step">01</span></div>
          <div className="scenario-list">
            {Object.entries(scenarios).map(([key, item]) => <button key={key} className={selected === key ? "scenario active" : "scenario"} onClick={() => { setSelected(key as keyof typeof scenarios); setDecision("Ready"); setApproved(null); }}><span>{item.title}</span><small>{item.action}</small></button>)}
          </div>
          <button className="primary" onClick={runSimulation}>Evaluate simulated request <span>→</span></button>
        </article>

        <article className="panel decision-panel">
          <div className="panel-heading"><div><p className="eyebrow">STEP 02</p><h2>Trust decision</h2></div><span className={`status ${decision.toLowerCase().replaceAll(" ", "-")}`}>{decision}</span></div>
          <div className="decision-content">
            <p className="decision-label">PROPOSED ACTION</p><h3>{scenario.action}</h3>
            <div className="reason"><span>✦</span><p>{decision === "Ready" ? "Choose an action and evaluate it to see the simulated policy result." : scenario.reason}</p></div>
            <div className="evidence"><p>EVIDENCE & POLICY</p><span>{decision === "Ready" ? "Awaiting evaluation" : scenario.evidence}</span></div>
          </div>
          {decision === "Review required" && <div className="approval"><p>Human confirmation is required before this fictional action can continue.</p><div><button onClick={() => setApproved(true)}>Approve</button><button className="outline" onClick={() => setApproved(false)}>Reject</button></div></div>}
        </article>

        <article className="panel timeline-panel">
          <div className="panel-heading"><div><p className="eyebrow">STEP 03</p><h2>Forensic timeline</h2></div><span className="step">03</span></div>
          <ol className="timeline">{events.map((event, index) => <li key={event}><span>{index + 1}</span><div><strong>{event}</strong><small>{index === 0 ? "09:41" : index === 1 ? "09:42" : index === 2 ? "09:43" : "09:44"} · Integrity linked</small></div></li>)}</ol>
          <div className="integrity"><span>✓</span><div><strong>Evidence chain intact</strong><small>This demo simulates a tamper-evident audit record.</small></div></div>
        </article>
      </section>

      <section className="principles"><p className="eyebrow">THE PRINCIPLE</p><h2>AI can help organize evidence. It cannot replace evidence, lawful authority, or human responsibility.</h2><div><span>Verified sources</span><span>Explicit policy</span><span>Human accountability</span><span>Forensic history</span></div></section>

      <section className="mcp-section">
        <div className="mcp-intro"><p className="eyebrow">MCP GATEWAY / FICTIONAL TOOLS</p><h2>Watch the trust layer govern an MCP tool call.</h2><p>The gateway exposes only approved tools, checks each proposed action, and records the result. These tools run entirely on fictional demo data.</p><button className="refresh-gateway" onClick={refreshGateway}>Generate fictional MCP case registry <span>↻</span></button></div>
        <div className="mcp-console">
          <div className="tool-list"><div className="console-title"><span className="live-dot" /> MCP tool registry</div>{simulatedTools.map((item) => <button className={activeTool.name === item.name ? "tool-row chosen" : "tool-row"} key={item.name} onClick={() => { setTool({ ...item, output: "" }); setToolResult("Selected “" + item.name + "”. Run the simulated call to generate a fictional outcome."); }}><span className="tool-icon">⌘</span><span><strong>{item.name}</strong><small>{item.category} · {item.detail}</small></span><em className={item.access.toLowerCase()}>{item.access}</em></button>)}</div>
          <div className="tool-detail"><div className="console-title">Gateway evaluation</div><p className="tool-name">{activeTool.name}</p><div className="gateway-route"><span>Agent</span><b>→</b><span className="gateway">Trust gateway</span><b>→</b><span>MCP tool</span></div><div className="tool-policy"><p>CURRENT SYNTHETIC AVAILABILITY</p><strong className={activeTool.access.toLowerCase()}>{activeTool.access === "Review" ? "Human review required" : activeTool.access === "Blocked" ? "Denied" : activeTool.access === "Automatic" ? "Auto-approved, low risk" : "Allowed"}</strong><small>Each generated registry assigns a fictional availability state. Every simulated call independently creates a new fictional policy outcome.</small></div><button className="primary" onClick={runTool}>Run simulated MCP call <span>→</span></button><div className="tool-result"><p>SIMULATED RESULT</p><span>{toolResult}</span></div></div>
        </div>
      </section>
      <footer><strong>Created by Ricardo Calala</strong><span>·</span><span>Built with ChatGPT Codex</span><span>·</span><span>Agentic Trust Layer · Educational concept · All content in this demo is fictional.</span></footer>
    </main>
  );
}
