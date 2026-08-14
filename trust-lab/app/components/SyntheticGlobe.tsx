"use client";

import { useEffect, useState } from "react";

const regions = [
  { name: "North Atlantic", posture: "Coverage review", detail: "Synthetic aggregate reporting coverage is being compared against a fictional baseline.", coverage: 86, confidence: 64, x: "27%", y: "31%" },
  { name: "Continental Hub", posture: "Source verification", detail: "A fictional cross-source variance needs provenance checks before any human review.", coverage: 71, confidence: 58, x: "53%", y: "43%" },
  { name: "Pacific Network", posture: "Monitor", detail: "Synthetic seasonal movement is retained as context; no records request is recommended.", coverage: 94, confidence: 76, x: "76%", y: "35%" },
  { name: "Southern Corridor", posture: "Authority gated", detail: "A fictional signal is limited to permitted purpose, role authority, and review-bound next steps.", coverage: 68, confidence: 52, x: "61%", y: "69%" },
  { name: "Polar Relay", posture: "Evidence linked", detail: "Synthetic provenance receipts are linked to an integrity-preserving review packet.", coverage: 91, confidence: 81, x: "41%", y: "18%" }
];

export function SyntheticGlobe({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [spinning, setSpinning] = useState(true);
  const [mode, setMode] = useState<"coverage" | "network" | "authority">("coverage");
  const [missionPoints, setMissionPoints] = useState(240);
  const [action, setAction] = useState("Select a fictional regional signal to begin.");
  const region = regions[selected];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCycle(current => current + 1);
      setSelected(current => (current + 1) % regions.length);
    }, 6400);
    return () => window.clearInterval(timer);
  }, []);

  const runAction = (kind: "verify" | "route" | "brief") => {
    const messages = {
      verify: `Provenance mesh checked for ${region.name}; fictional gaps remain visible.`,
      route: `Low-risk synthetic review task routed for ${region.name}; no financial or enforcement action occurred.`,
      brief: `Human-review briefing prepared for ${region.name}; authority remains with the reviewer.`
    };
    setAction(messages[kind]);
    setMissionPoints(current => current + (kind === "verify" ? 18 : kind === "route" ? 11 : 24));
    setCycle(current => current + 1);
  };

  const modeCopy = { coverage: "coverage mesh", network: "network pathways", authority: "authority boundaries" };
  return <section className={`globe-command ${compact ? "globe-compact" : ""} globe-mode-${mode}`} aria-label="Interactive synthetic global operations globe">
    <div className="globe-copy">
      <p className="eyebrow">2035 GLOBAL SIGNAL FABRIC / FICTIONAL DATA</p>
      <h2>{compact ? "Global mission posture" : "Explore the synthetic global signal fabric."}</h2>
      <p>Click a regional beacon to inspect fictional aggregate telemetry. This experience never identifies people, reads real systems, or treats a pattern as proof.</p>
      <div className="globe-live"><i /> LIVE SYNTHETIC CYCLE {cycle} <span>·</span> {spinning ? "orbit active" : "orbit paused"}</div>
      {!compact && <><div className="globe-mode-switch" aria-label="Synthetic globe visual mode"><button className={mode === "coverage" ? "active" : ""} onClick={() => setMode("coverage")}>Coverage</button><button className={mode === "network" ? "active" : ""} onClick={() => setMode("network")}>Network</button><button className={mode === "authority" ? "active" : ""} onClick={() => setMode("authority")}>Authority</button></div><div className="globe-actions"><button onClick={() => runAction("verify")}>Verify source mesh</button><button onClick={() => runAction("route")}>Route low-risk task</button><button onClick={() => runAction("brief")}>Prepare human brief</button></div></>}
    </div>
    <div className={`globe-stage ${spinning ? "is-spinning" : ""}`}>
      <div className="globe-stars" />
      <div className="globe-halo" />
      <div className="globe-hud globe-hud-left"><span>LAT 48.2°</span><span>LAYER 04</span></div><div className="globe-hud globe-hud-right"><span>SYNC 99.8%</span><span>{modeCopy[mode]}</span></div>
      <div className="synthetic-globe" aria-label="Rotating fictional global data globe">
        <div className="globe-grid globe-grid-a" /><div className="globe-grid globe-grid-b" /><div className="globe-continent continent-a" /><div className="globe-continent continent-b" /><div className="globe-continent continent-c" />
        {regions.map((item, index) => <button key={item.name} className={`globe-beacon ${selected === index ? "selected" : ""}`} style={{ left: item.x, top: item.y }} onClick={() => { setSelected(index); setAction(`${item.name} selected. Choose a fictional mission action.`); }} aria-label={`Select ${item.name} fictional region`}><i /><span>{index + 1}</span></button>)}
      </div>
      <div className="globe-compass"><i>N</i><span>◉</span><i>E</i></div><button className="spin-control" onClick={() => setSpinning(current => !current)}>{spinning ? "Pause orbit" : "Resume orbit"}</button>
    </div>
    <aside className="globe-detail">
      <p>ACTIVE FICTIONAL REGION</p><div className="globe-posture"><span>{region.posture}</span><strong>{region.name}</strong></div>
      <h3>{region.detail}</h3>
      <div className="globe-metrics"><span><b>{region.coverage}%</b> aggregate coverage</span><span><b>{region.confidence}%</b> confidence retained</span><span><b>{missionPoints}</b> mission points</span></div>
      <div className="globe-action-log"><i /> {action}</div>
      {compact && <button className="compact-globe-action" onClick={() => runAction("brief")}>Run fictional globe cycle <span>↻</span></button>}
      <small>Gamified mission points reflect fictional workflow completion, not a risk score about any person or organization.</small>
    </aside>
  </section>;
}
