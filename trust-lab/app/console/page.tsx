"use client";

import { useEffect, useState } from "react";
import "./console.css";

const syntheticQueues = [
  [["Partner case brief", "Disclosure", "High", "Awaiting review"], ["Policy exception", "Governance", "Medium", "Scope review"], ["Case triage route", "Operations", "Low", "Auto-approved"]],
  [["Evidence bundle", "Records", "Medium", "Provenance check"], ["Guidance retrieval", "Knowledge", "Low", "Allowed"], ["Agency share", "Disclosure", "High", "Awaiting review"]],
  [["Report draft", "Casework", "Low", "Auto-approved"], ["Records scope", "Authority", "Medium", "Policy check"], ["Bulk export", "Records", "High", "Blocked"]]
];

const syntheticActivity = [
  "MCP tool call evaluated", "Evidence provenance checked", "Low-risk case routed automatically", "Restricted disclosure held for review",
  "Authority scope refreshed", "Synthetic policy exception evaluated", "Forensic record integrity confirmed", "Fictional report package prepared"
];

export default function TrustConsole() {
  const [selected, setSelected] = useState("Overview");
  const [seed, setSeed] = useState(101);
  const rand = (min: number, max: number, salt: number) => min + ((seed * 29 + salt * 13) % (max - min + 1));
  const queue = syntheticQueues[seed % syntheticQueues.length];
  const liveActivity = Array.from({ length: 4 }, (_, index) => syntheticActivity[(seed + index * 3) % syntheticActivity.length]);
  const gatewayState = ["Healthy", "Monitoring", "Policy refresh"][seed % 3];
  useEffect(() => {
    const timer = window.setInterval(() => setSeed(Math.floor(Math.random() * 9999) + 1), 9000);
    return () => window.clearInterval(timer);
  }, []);
  return <main className="console-page"><aside className="console-side"><a className="console-brand" href="/">◈ <span>Agentic Trust Layer</span></a><p>CONTROL CENTER</p>{["Overview", "Policies", "Approvals", "Agents", "Evidence", "MCP Gateway", "Reports"].map(item => <button key={item} className={selected === item ? "selected" : ""} onClick={() => setSelected(item)}>{item}</button>)}<div className="synthetic">SYNTHETIC ENVIRONMENT<br /><strong>Fictional national demo</strong></div></aside><section className="console-main"><header><div><p className="kicker">{selected.toUpperCase()} / FICTIONAL DATA</p><h1>Trust Operations Console</h1></div><div style={{display:"flex",gap:8}}><button onClick={() => setSeed(Math.floor(Math.random() * 9999) + 1)} style={{background:"#244f91",color:"white",border:0,borderRadius:8,padding:"10px 12px",fontWeight:700,cursor:"pointer"}}>Generate synthetic scenario</button><a href="/">Return to Trust Lab</a></div></header><div className="notice">This is a simulated interface. It rotates fictional counts, cases, availability, and evidence events locally; no records, people, agencies, or risk signals are real.</div><section className="metrics"><Metric label="Protected agents" value={String(rand(18,52,1))} note="All identities verified" /><Metric label="Policies active" value={String(rand(96,184,2))} note="Default-deny enabled" /><Metric label="Pending approvals" value={String(rand(1,7,3))} note="Human review required" /><Metric label="Audit integrity" value="100%" note="Evidence chain verified" /></section><section className="console-grid"><article className="console-card approvals"><div className="card-heading"><div><p className="kicker">ROTATING REVIEW QUEUE</p><h2>Approvals requiring attention</h2></div><span>{rand(1,5,4)} pending</span></div>{queue.map(([name, type, risk, status],index) => <div className="approval-row" key={`${name}-${seed}`}><div><strong>{index ? `${name} ${rand(10,99,index + 10)}` : name}</strong><small>{type}</small></div><em className={risk.toLowerCase()}>{risk}</em><span>{status}</span></div>)}</article><article className="console-card evidence"><p className="kicker">FORENSIC EVIDENCE</p><h2>Decision activity</h2><div className="bars">{Array.from({length:7},(_,index) => rand(35,90,index + 20)).map((height,index) => <i key={index} style={{height:`${height}%`}} />)}</div><div className="legend"><span>● Allowed</span><span>● Review</span><span>● Denied</span></div></article><article className="console-card activity"><p className="kicker">LIVE SIMULATED ACTIVITY</p><h2>Policy timeline</h2>{liveActivity.map((item,index) => <div className="activity-row" key={`${item}-${seed}`}><b>{index + 1}</b><div><strong>{item}</strong><small>Integrity-linked fictional event {rand(100,999,index + 30)}</small></div></div>)}</article><article className="console-card gateway"><p className="kicker">MCP GATEWAY</p><h2>Connection health</h2><div className="gateway-health"><strong>{gatewayState}</strong><span>{rand(3,8,40)} fictional tools available</span><span>{rand(1,4,45)} simulated reviews queued</span><span>{rand(0,3,51)} fictional actions blocked by policy</span></div></article></section></section></main>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <article className="metric"><p>{label}</p><strong>{value}</strong><small>{note}</small></article>; }
