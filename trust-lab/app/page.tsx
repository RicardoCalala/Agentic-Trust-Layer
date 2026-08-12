"use client";

import { useMemo, useState } from "react";

type Decision = "Ready" | "Allowed" | "Review required" | "Denied";

const mcpTools = [
  { name: "case_triage.route", category: "Triage", access: "Automatic", detail: "Route a fictional case to an information queue", output: "Automatically routed to the fictional information-review queue. This action is reversible, creates no financial or enforcement outcome, and was recorded for review." },
  { name: "case_guidance.read", category: "Knowledge", access: "Available", detail: "Retrieve fictional internal procedures", output: "Guidance retrieved: escalation requires documented evidence and reviewer confirmation." },
  { name: "case_brief.prepare", category: "Casework", access: "Available", detail: "Prepare a fictional investigator brief", output: "Draft brief prepared with source references and unresolved evidence clearly marked." },
  { name: "partner_share.request", category: "Disclosure", access: "Review", detail: "Request an approved partner-agency share", output: "A reviewer must approve this simulated restricted disclosure before it can continue." },
  { name: "records.export", category: "Records", access: "Blocked", detail: "Bulk export of fictional records", output: "Request blocked: bulk export is outside the public demo agent's authority." }
];

const operationZones = {
  signal: { title: "Area signal", text: "A fictional aggregate anomaly enters the system. It is a lead for review, not a claim about a person or place.", tag: "Aggregate only" },
  evidence: { title: "Evidence desk", text: "Approved synthetic sources are checked for provenance, coverage, and contradictions before the system makes a recommendation.", tag: "Source verified" },
  policy: { title: "Trust gateway", text: "The policy engine evaluates the proposed MCP tool call against identity, purpose, scope, and data classification.", tag: "Policy evaluated" },
  review: { title: "Human checkpoint", text: "Sensitive, financial, or enforcement-related actions stop here for an accountable reviewer.", tag: "Human authority" },
  record: { title: "Forensic record", text: "Every signal, tool request, policy outcome, and human decision is added to an integrity-linked timeline.", tag: "Audit intact" }
};

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
  const [zone, setZone] = useState<keyof typeof operationZones>("signal");
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [riskStage, setRiskStage] = useState(0);
  const scenario = scenarios[selected];
  const events = useMemo(() => [
    "Case opened with fictional, aggregate evidence",
    "Source provenance verified",
    decision === "Ready" ? "Awaiting a simulated agent request" : `Policy decision: ${decision}`,
    approved === null ? "No human decision recorded" : approved ? "Reviewer approved the limited action" : "Reviewer rejected the action"
  ], [decision, approved]);

  function runSimulation() {
    setDecision(scenario.decision);
    setApproved(null);
  }

  function runTool() {
    setToolResult(tool.output);
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
          <strong>{assessment ? "Unusual pattern detected" : "Review warranted"}</strong>
          <p>{assessment ? "The simulated AI found an unusual combination of fictional aggregate indicators. It recommends a qualified human review; it does not establish wrongdoing." : "Multiple aggregate indicators require a qualified human assessment. This is not an accusation or a finding of wrongdoing."}</p>
          <div className="signal-meter"><i /><i /><i className="muted" /><i className="muted" /></div>
          <button className="signal-button" onClick={() => setAssessment(!assessment)}>{assessment ? "Reset simulated assessment" : "Run simulated AI assessment"}</button>
        </div>
      </section>

      {assessment && <section className="assessment-wrap"><div className="assessment-card"><div><p className="eyebrow">SIMULATED AI ASSESSMENT</p><h2>Pattern warrants review, not a conclusion.</h2><p>The model found a fictional anomaly across three aggregate, approved indicators. It cannot identify a person, infer guilt, or access additional records without a human decision and lawful scope.</p></div><div className="assessment-evidence"><p>EVIDENCE REVIEWED</p><span>Aggregate reporting trend</span><span>Fictional licensing variance</span><span>Casework volume pattern</span><p className="confidence">Confidence: limited · Uncertainty: material</p></div></div></section>}

      <section className="operations-section"><div className="operations-copy"><p className="eyebrow">3D OPERATIONS CENTER / FICTIONAL SIMULATION</p><h2>Walk through the trust decision.</h2><p>Select a station in the fictional operations center to follow one simulated signal from initial detection to accountable record.</p><div className="layer-grid"><span>Mission scope</span><span>Evidence confidence</span><span>Legal authority</span><span>Agency boundary</span><span>Independent oversight</span></div>{!operationsOpen && <button className="launch-operations" onClick={() => setOperationsOpen(true)}>Launch 3D Operations Center <span>→</span></button>}</div>{operationsOpen && <div className="operations-layout"><div className="scene" aria-label="Interactive 3D operations center"><div className="scene-floor" /><div className="scene-grid" />{Object.entries(operationZones).map(([key, item]) => <button key={key} onClick={() => setZone(key as keyof typeof operationZones)} className={`station ${key} ${zone === key ? "active" : ""}`}><span className="station-icon">{key === "signal" ? "⌁" : key === "evidence" ? "◫" : key === "policy" ? "⌘" : key === "review" ? "◉" : "✓"}</span><strong>{item.title}</strong></button>)}<div className="connection line-one" /><div className="connection line-two" /><div className="connection line-three" /><div className="connection line-four" /></div><aside className="zone-card"><p className="eyebrow">SELECTED STATION</p><span className="zone-tag">{operationZones[zone].tag}</span><h3>{operationZones[zone].title}</h3><p>{operationZones[zone].text}</p><div className="zone-flow"><span>Signal</span><b>→</b><span>Policy</span><b>→</b><span>Record</span></div><small>Fictional data only · Click another station to continue the walkthrough.</small></aside></div>}</section>

      <section className="risk-section"><div className="operations-copy"><p className="eyebrow">FINANCIAL-RISK OPERATIONS CENTER / FICTIONAL SIMULATION</p><h2>Trace a reviewable financial-risk signal.</h2><p>This second experience demonstrates how a government team could connect authorized, synthetic aggregate signals without identifying anyone or treating an AI pattern as proof.</p>{!riskOpen && <button className="launch-operations" onClick={() => setRiskOpen(true)}>Launch financial-risk simulation <span>→</span></button>}</div>{riskOpen && <div className="risk-sim"><div className="risk-map"><div className="risk-orbit orbit-a" /><div className="risk-orbit orbit-b" />{["Aggregate intake", "Pattern comparison", "Evidence verification", "Authority gate", "Investigator review", "Forensic record"].map((label, index) => <button key={label} className={riskStage === index ? "risk-node active" : "risk-node"} onClick={() => setRiskStage(index)}><span>{index + 1}</span>{label}</button>)}</div><div className="risk-detail"><p className="eyebrow">SIMULATED STAGE {riskStage + 1} OF 6</p><h3>{["Aggregate intake", "Pattern comparison", "Evidence verification", "Authority gate", "Investigator review", "Forensic record"][riskStage]}</h3><p>{["Fictional aggregate indicators enter with clear source ownership and permitted-use limits.", "The system compares fictional trends and presents uncertainty; it does not identify a person or assert wrongdoing.", "Approved synthetic sources are checked for provenance, coverage, and conflicts.", "The request is limited by simulated jurisdiction, purpose, classification, and role authority.", "A qualified human decides whether a lawful, proportionate next step is warranted.", "The complete fictional workflow is stored in a tamper-evident investigation timeline."][riskStage]}</p><span className="risk-safe">Synthetic data · Aggregate-first · Human accountable</span></div></div>}</section>

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
        <div className="mcp-intro"><p className="eyebrow">MCP GATEWAY / FICTIONAL TOOLS</p><h2>Watch the trust layer govern an MCP tool call.</h2><p>The gateway exposes only approved tools, checks each proposed action, and records the result. These tools run entirely on fictional demo data.</p></div>
        <div className="mcp-console">
          <div className="tool-list"><div className="console-title"><span className="live-dot" /> MCP tool registry</div>{mcpTools.map((item) => <button className={tool.name === item.name ? "tool-row chosen" : "tool-row"} key={item.name} onClick={() => { setTool(item); setToolResult("Selected “" + item.name + "”. Run the simulated call to continue."); }}><span className="tool-icon">⌘</span><span><strong>{item.name}</strong><small>{item.category} · {item.detail}</small></span><em className={item.access.toLowerCase()}>{item.access}</em></button>)}</div>
          <div className="tool-detail"><div className="console-title">Gateway evaluation</div><p className="tool-name">{tool.name}</p><div className="gateway-route"><span>Agent</span><b>→</b><span className="gateway">Trust gateway</span><b>→</b><span>MCP tool</span></div><div className="tool-policy"><p>POLICY OUTCOME</p><strong className={tool.access.toLowerCase()}>{tool.access === "Review" ? "Human review required" : tool.access === "Blocked" ? "Denied" : tool.access === "Automatic" ? "Auto-approved, low risk" : "Allowed"}</strong><small>{tool.access === "Automatic" ? "This automatic step is reversible and administrative only. It cannot change money, rights, enforcement status, or access to sensitive records." : "The gateway evaluates identity, authorized purpose, data classification, and action scope before forwarding a call."}</small></div><button className="primary" onClick={runTool}>Run simulated MCP call <span>→</span></button><div className="tool-result"><p>SIMULATED RESULT</p><span>{toolResult}</span></div></div>
        </div>
      </section>
      <footer><strong>Created by Ricardo Calala</strong><span>·</span><span>Built with ChatGPT Codex</span><span>·</span><span>Agentic Trust Layer · Educational concept · All content in this demo is fictional.</span></footer>
    </main>
  );
}
