import {
  AlertTriangle, ArrowLeft, ArrowRight, Ban, Check, CheckCircle2, ChevronDown, CircleHelp,
  Eye, FileCheck2, Hand, LockKeyhole, MessageCircle, Pause, Play, Send, ShieldCheck,
  Square, StopCircle, UserRound, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { evaluateProposal, scenarios, type Proposal, type ScenarioId } from "@trustmode/core";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";
import { getMessages } from "../i18n";

function SafetyBar() {
  const demo = useDemo();
  const t = getMessages(demo.language);
  const [confirmStop, setConfirmStop] = useState(false);
  return (
    <>
      <div className="safety-bar">
        <div className="session-meta"><i className={demo.stopped ? "red" : demo.paused ? "amber" : ""} /><strong>{demo.stopped ? "Session stopped" : demo.paused ? "Session paused" : "Session active"}</strong><span>Helper: {demo.scenario.helperName}</span><span>Owner: {demo.scenario.ownerName}</span><span>Auto-pause in 24:36</span></div>
        <div><button className="safety-button" onClick={demo.togglePause} disabled={demo.stopped}>{demo.paused ? <Play /> : <Pause />}{demo.paused ? t.resume : t.pause}</button><button className="safety-button safety-button--stop" onClick={() => setConfirmStop(true)} disabled={demo.stopped}><Square />{t.stop}</button></div>
      </div>
      {confirmStop ? <div className="modal-backdrop" role="presentation" onMouseDown={() => setConfirmStop(false)}><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="stop-title" onMouseDown={(event) => event.stopPropagation()}><StopCircle /><h2 id="stop-title">Stop this help session?</h2><p>The invitation will be revoked and every pending proposal will be discarded. Nothing else will change.</p><div><button className="text-button" onClick={() => setConfirmStop(false)}>Keep session</button><button className="button button--danger" onClick={() => { demo.stop(); setConfirmStop(false); }}>Stop and revoke</button></div></div></div> : null}
    </>
  );
}

function TaskRail() {
  return (
    <aside className="task-rail">
      <h2><FileCheck2 /> Task brief</h2>
      <p>Prepare accurate details for the application without accessing private information.</p>
      <h3>You can</h3>
      <ul className="permission-list allowed"><li>See semantic fields</li><li>Add derived facts</li><li>Ask the owner</li><li>Send proposals for review</li></ul>
      <h3>You cannot</h3>
      <ul className="permission-list denied"><li>See private details</li><li>Edit the owner’s form</li><li>Submit the application</li></ul>
      <div className="rail-guidance"><CircleHelp /><span><b>Guidance</b>When unsure, ask the owner.</span></div>
      <button className="rail-button"><UserRound />View permissions<ArrowRight /></button>
    </aside>
  );
}

function HelperWorkspace({ onReview }: { onReview: (proposal: Proposal) => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language);
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const sendAll = () => setSent(new Set(demo.scenario.proposals.map((item) => item.id)));
  return (
    <section className="ghost-workspace">
      <div className="workspace-heading"><div><h1>Ghost Workspace</h1><p>Education details · safe semantic view</p></div><span><CheckCircle2 /> {t.nothing}</span></div>
      <div className="semantic-table" aria-label="Semantic form fields">
        <div className="semantic-row semantic-head"><span>Field</span><span>Current in application</span><span>Helper suggestion</span><span>Evidence</span></div>
        {demo.scenario.proposals.map((item) => (
          <button className="semantic-row" key={item.id} onClick={() => onReview(item)}>
            <span><b>{item.label}</b></span><span className="current">{item.current}</span><span className="derived"><Check />{item.proposed}<small>Derived</small></span><span><FileCheck2 />{item.evidence}<ArrowRight /></span>
          </button>
        ))}
      </div>
      <div className="derived-note"><ShieldCheck /><span><strong>Derived facts reveal only what is needed.</strong> Private source values and documents remain hidden.</span></div>
      <div className="queue-heading"><h2>Proposal queue</h2><span>{sent.size} sent</span></div>
      <div className="proposal-queue">
        {demo.scenario.proposals.map((item) => (
          <button key={item.id} className={sent.has(item.id) ? "proposal-row sent" : "proposal-row"} onClick={() => onReview(item)}>
            <span className="proposal-check">{sent.has(item.id) ? <Check /> : null}</span><span><b>{item.statement}</b><small>{item.evidence}</small></span><em>{Math.round(item.confidence * 100)}% confidence</em><ChevronDown />
          </button>
        ))}
      </div>
      <div className="queue-actions"><button className="button button--outline"><MessageCircle />Ask owner</button><button className="button button--outline" onClick={() => setSent(new Set([...sent, demo.scenario.proposals[0].id]))}>Add to proposal</button><button className="button" onClick={sendAll}><Send />Send for review</button></div>
    </section>
  );
}

function Passage() {
  return <aside className="protected-passage" aria-label="Protected proposal passage"><ShieldCheck /><b>Protected<br />passage</b><i /><Send /><span>Proposal<br />packets only</span><i /><LockKeyhole /><small>No owner data flows this way</small></aside>;
}

function OwnerRail({ selected, onSelect, onBlocked }: { selected: Proposal; onSelect: (proposal: Proposal) => void; onBlocked: () => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language);
  const index = demo.scenario.proposals.findIndex((item) => item.id === selected.id);
  const status = demo.statuses[selected.id];
  const decision = evaluateProposal(selected);
  return (
    <aside className="owner-rail">
      <div className="owner-intro"><UserRound /><span>{demo.scenario.helperName} prepared {demo.scenario.proposals.length} details</span></div>
      <div className="review-mode"><b>Simple review</b><p>Review one proposal at a time.</p><span><ShieldCheck />{t.private}</span></div>
      <div className="review-nav"><span>{t.review}</span><b>{index + 1} of {demo.scenario.proposals.length}</b><button aria-label="Previous proposal" onClick={() => onSelect(demo.scenario.proposals[Math.max(0, index - 1)])}><ArrowLeft /></button><button aria-label="Next proposal" onClick={() => onSelect(demo.scenario.proposals[Math.min(demo.scenario.proposals.length - 1, index + 1)])}><ArrowRight /></button></div>
      <div className="decision-card">
        <span className="current-label">Current proposal</span>
        <h2>{selected.statement}</h2>
        <p>{selected.evidence}</p>
        <em>{Math.round(selected.confidence * 100)}% confidence</em>
        <div className="decision-preview"><span><small>Before</small>{selected.current}</span><ArrowRight /><span><small>After</small>{selected.proposed}</span></div>
        {status ? <div className={`decision-result decision-result--${status}`}>{status === "approved" ? <Check /> : <X />}{status === "approved" ? "Approved and applied owner-side" : "Proposal rejected"}</div> : <>
          <button disabled={!decision.allowed || demo.paused || demo.stopped} className="decision approve" onClick={() => demo.decide(selected.id, "approved")}>{t.approve}</button>
          <button disabled={demo.stopped} className="decision change">{t.request}</button>
          <button disabled={demo.stopped} className="decision skip" onClick={() => demo.decide(selected.id, "rejected")}>{t.skip}</button>
        </>}
        <button className="privacy-link" onClick={() => demo.setStage("privacy")}><Eye />{t.preview}<ArrowRight /></button>
      </div>
      <button className="blocked-row" onClick={onBlocked}><Ban /><span><small>{t.ownerOnly}</small><b>{t.submit}</b><em>Helpers can never submit on your behalf.</em></span><ArrowRight /></button>
    </aside>
  );
}

export function Workspace({ initialStage }: { initialStage?: "privacy" | "blocked" | "receipt" } = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const demo = useDemo();
  const scenarioId = params.scenario && params.scenario in scenarios ? params.scenario as ScenarioId : demo.scenarioId;
  const [selected, setSelected] = useState<Proposal>(() => scenarios[scenarioId].proposals[0]);
  const [view, setView] = useState<"split" | "helper" | "owner">("split");
  const initialStageApplied = useRef(false);

  useEffect(() => {
    if (scenarioId !== demo.scenarioId) demo.setScenario(scenarioId);
  }, [scenarioId, demo]);
  useEffect(() => {
    if (!initialStageApplied.current) {
      initialStageApplied.current = true;
      if (initialStage) {
        demo.setStage(initialStage);
      } else if (demo.stage !== "workspace") {
        demo.setStage("workspace");
      }
    }
  }, [demo, initialStage]);
  const approved = useMemo(() => demo.scenario.proposals.filter((item) => demo.statuses[item.id] === "approved").length, [demo.scenario.proposals, demo.statuses]);

  if (demo.stopped) return <Revoked onRestart={demo.restart} />;
  if (demo.stage === "privacy") return <Preview proposal={selected} onBack={() => demo.setStage("workspace")} />;
  if (demo.stage === "blocked") return <Blocked onBack={() => demo.setStage("workspace")} />;
  if (demo.stage === "receipt") return <ReceiptPage />;

  return (
    <div className={demo.calm ? "session session--calm" : "session"}>
      <Header compact />
      <div className="session-titlebar"><strong>{demo.scenario.title}</strong><span>Synthetic demo · No real data</span><div className="view-switch"><button className={view === "helper" ? "active" : ""} onClick={() => setView("helper")}>Helper</button><button className={view === "split" ? "active" : ""} onClick={() => setView("split")}>Together</button><button className={view === "owner" ? "active" : ""} onClick={() => setView("owner")}>Owner</button></div></div>
      {demo.paused ? <div className="paused-banner" role="status"><Pause />Session paused. Proposals and decisions are temporarily disabled.</div> : null}
      <main id="main" className={`workspace-layout workspace-layout--${view}`}>
        <TaskRail />
        <HelperWorkspace onReview={(item) => { setSelected(item); if (view === "owner") setView("owner"); }} />
        <Passage />
        <OwnerRail selected={selected} onSelect={setSelected} onBlocked={() => demo.setStage("blocked")} />
      </main>
      <div className="completion-nudge">{approved === demo.scenario.proposals.length ? <button className="button" onClick={() => demo.setStage("receipt")}>Generate session receipt <ArrowRight /></button> : <span>{approved} of {demo.scenario.proposals.length} safe changes approved</span>}<button className="text-button" onClick={() => navigate("/demo")}>Leave practice</button></div>
      <SafetyBar />
    </div>
  );
}

function Preview({ proposal, onBack }: { proposal: Proposal; onBack: () => void }) {
  return <div className="focus-page"><Header compact /><main id="main" className="review-page"><button className="back-link" onClick={onBack}><ArrowLeft />Back to workspace</button><p className="quiet-label">Privacy & consequence preview</p><h1>Know exactly what will happen.</h1><p className="lead">{proposal.statement}</p><div className="preview-grid"><section><ShieldCheck /><h2>What is shared</h2><strong>{proposal.proposed}</strong><p>Only this derived field value is sent to the controlled fictional portal.</p></section><section><LockKeyhole /><h2>What stays private</h2><p>{proposal.privacy}</p></section><section><Hand /><h2>What will happen</h2><p>{proposal.consequence}</p><span>Reversible · no submission · no payment</span></section></div><div className="consequence-line"><AlertTriangle /><span><b>Final submission stays with you.</b> TrustMode will stop before any consequential final action.</span></div><button className="button button--large" onClick={onBack}>I understand <ArrowRight /></button></main></div>;
}

function Blocked({ onBack }: { onBack: () => void }) {
  return <div className="focus-page"><Header compact /><main id="main" className="blocked-page"><div className="blocked-symbol"><Ban /></div><p className="quiet-label quiet-label--danger">Action blocked</p><h1>The helper cannot submit this application.</h1><p className="lead">Submission is consequential and irreversible. It always stays with the owner.</p><div className="block-explanation"><div><b>TrustMode noticed</b><p>A proposal attempted to move beyond preparation into final execution.</p></div><ArrowRight /><div><b>TrustMode did</b><p>Stopped the action, kept the form unchanged, and recorded the reason.</p></div></div><div className="safe-state"><CheckCircle2 /><span><b>Your application has not been submitted.</b> No payment, document, or account action occurred.</span></div><button className="button button--large" onClick={onBack}>Return to safe review <ArrowRight /></button></main></div>;
}

function Revoked({ onRestart }: { onRestart: () => void }) {
  return <div className="focus-page"><Header compact /><main id="main" className="blocked-page"><div className="blocked-symbol"><StopCircle /></div><p className="quiet-label quiet-label--danger">Session revoked</p><h1>You are back in control.</h1><p className="lead">The helper invitation is invalid and all pending proposals have been discarded. No further changes can be made.</p><div className="safe-state"><CheckCircle2 /><span><b>Nothing else changed.</b> This synthetic session is now closed.</span></div><button className="button button--large" onClick={onRestart}>Start a fresh practice session <ArrowRight /></button></main></div>;
}

function ReceiptPage() {
  const demo = useDemo();
  return <div className="focus-page receipt-page"><Header compact /><main id="main" className="receipt"><div className="receipt-mark"><Check /></div><p className="quiet-label">Session receipt</p><h1>Help prepared. Control preserved.</h1><p className="lead">A readable record of this synthetic TrustMode session.</p><div className="receipt-sheet"><header><span><b>{demo.scenario.title}</b><small>{demo.receipt.id}</small></span><strong>Completed safely</strong></header><section><h2>Approved owner-side</h2>{demo.receipt.approved.length ? demo.receipt.approved.map((item) => <p key={item}><Check />{item}</p>) : <p>No proposals were approved.</p>}</section><section><h2>Blocked by policy</h2>{demo.receipt.blocked.map((item) => <p key={item}><Ban />{item}</p>)}</section><section><h2>Privacy summary</h2><p><LockKeyhole />{demo.receipt.retained}</p></section><footer><span>Started {new Date(demo.receipt.startedAt).toLocaleString()}</span><span>Fictional demonstration · no real submission</span></footer></div><div className="receipt-actions"><button className="button button--outline" onClick={() => window.print()}>Print receipt</button><button className="button" onClick={demo.restart}>Try another scenario <ArrowRight /></button></div></main></div>;
}
