import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Eye,
  FileCheck2,
  Hand,
  History,
  Link2,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Square,
  StopCircle,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { evaluateProposal, scenarios, type Proposal, type ProposalStatus, type ScenarioId } from "@trustmode/core";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";
import { getMessages } from "../i18n";

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function statusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    draft: "Draft",
    prepared: "Prepared",
    checking: "Checking",
    pending: "Owner review",
    approved: "Approved",
    rejected: "Rejected",
    "changes-requested": "Changes requested",
    applied: "Applied",
    blocked: "Blocked",
    revoked: "Revoked",
  };
  return labels[status];
}

function SafetyBar({ onActivity }: { onActivity: () => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language);
  const [confirmStop, setConfirmStop] = useState(false);
  return (
    <>
      <div className="safety-bar">
        <div className="session-meta">
          <i className={demo.stopped ? "red" : demo.paused ? "amber" : ""} />
          <strong>{demo.stopped ? `Session ${demo.session.status}` : demo.paused ? "Session paused" : "Session active"}</strong>
          <span>Helper: {demo.scenario.helperName}</span>
          <span>Owner: {demo.scenario.ownerName}</span>
          <span><Clock3 /> Expires {formatDuration(demo.remainingSeconds)}</span>
          <span>Auto-pause {formatDuration(demo.autoPauseSeconds)}</span>
        </div>
        <div>
          <button className="safety-utility" onClick={onActivity}><Activity />Activity <b>{demo.session.events.length}</b></button>
          <button className="safety-button" onClick={demo.togglePause} disabled={demo.stopped}>
            {demo.paused ? <Play /> : <Pause />}{demo.paused ? t.resume : t.pause}
          </button>
          <button className="safety-button safety-button--stop" onClick={() => setConfirmStop(true)} disabled={demo.stopped}>
            <Square />{t.stop}
          </button>
        </div>
      </div>
      {confirmStop ? <div className="modal-backdrop" role="presentation" onMouseDown={() => setConfirmStop(false)}>
        <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="stop-title" onMouseDown={(event) => event.stopPropagation()}>
          <StopCircle />
          <h2 id="stop-title">Stop this help session?</h2>
          <p>The capability will be revoked immediately. Every pending or prepared proposal will be discarded, and no helper command can resume it.</p>
          <div><button className="text-button" onClick={() => setConfirmStop(false)}>Keep session</button><button className="button button--danger" onClick={() => { demo.stop(); setConfirmStop(false); }}>Stop and revoke</button></div>
        </div>
      </div> : null}
    </>
  );
}

function TaskRail({ onContract }: { onContract: () => void }) {
  const demo = useDemo();
  return (
    <aside className="task-rail">
      <h2><FileCheck2 /> Task brief</h2>
      <p>{demo.session.contract.task}</p>
      <div className="contract-id"><ShieldCheck /><span><small>Intent Contract</small><b>{demo.session.contract.id}</b></span></div>
      <h3>You can</h3>
      <ul className="permission-list allowed"><li>See semantic fields</li><li>Add derived facts</li><li>Ask the owner</li><li>Send proposals for review</li></ul>
      <h3>You cannot</h3>
      <ul className="permission-list denied"><li>See private details</li><li>Edit the owner’s form</li><li>Submit the application</li></ul>
      <div className="rail-guidance"><CircleHelp /><span><b>Guidance</b>When unsure, ask the owner. Unknown targets fail closed.</span></div>
      <button className="rail-button" onClick={onContract}><UserRound />View permissions<ArrowRight /></button>
    </aside>
  );
}

function ProposalProgress({ status }: { status: ProposalStatus }) {
  const prepared = status !== "draft";
  const checked = ["pending", "approved", "rejected", "changes-requested", "applied", "blocked"].includes(status);
  const reviewed = ["approved", "rejected", "changes-requested", "applied"].includes(status);
  const applied = status === "applied";
  return <span className="proposal-progress" aria-label={`Proposal status: ${statusLabel(status)}`}>
    <i className={prepared ? "done" : ""}>1</i><span />
    <i className={checked ? "done" : ""}>2</i><span />
    <i className={reviewed ? "done" : ""}>3</i><span />
    <i className={applied ? "done" : ""}>4</i>
  </span>;
}

function HelperWorkspace({ onReview }: { onReview: (proposal: Proposal) => void }) {
  const demo = useDemo();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [questionOpen, setQuestionOpen] = useState(false);
  const [question, setQuestion] = useState("");

  const selectable = demo.scenario.proposals.filter((proposal) =>
    ["prepared", "changes-requested"].includes(demo.session.proposalRecords[proposal.id]?.status),
  );

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const send = () => {
    if (demo.sendProposals([...selected])) setSelected(new Set());
  };

  return (
    <section className="ghost-workspace">
      <div className="workspace-heading">
        <div><h1>Ghost Workspace</h1><p>{demo.scenario.shortTitle} details · safe semantic view</p></div>
        <div className="workspace-health"><span><i />Session healthy<small>All systems operational</small></span><b>Expires in {formatDuration(demo.remainingSeconds)}</b></div>
      </div>
      <div className="semantic-table" aria-label="Semantic form fields">
        <div className="semantic-row semantic-head"><span>Field</span><span>Current in portal</span><span>Helper suggestion</span><span>Freshness & evidence</span></div>
        {demo.scenario.proposals.map((item) => {
          const current = demo.session.portalValues[item.target.field];
          return <button className="semantic-row" key={item.id} onClick={() => onReview(item)}>
            <span><b>{item.label}</b></span>
            <span className="current">{current}</span>
            <span className="derived"><Check />{item.proposed}<small>Derived</small></span>
            <span><i className="freshness-dot" />Just now · {item.evidence}<ArrowRight /></span>
          </button>;
        })}
      </div>
      <div className="derived-note"><ShieldCheck /><span><strong>Derived facts reveal only what is needed.</strong> Private source values and documents remain hidden.</span></div>
      <div className="queue-heading"><h2>Proposal queue</h2><span>{selectable.length} available · {demo.scenario.proposals.length} total</span></div>
      <div className="proposal-queue">
        {demo.scenario.proposals.map((item) => {
          const record = demo.session.proposalRecords[item.id];
          const canSelect = ["prepared", "changes-requested"].includes(record.status);
          const isSelected = selected.has(item.id);
          return <button
            key={item.id}
            className={isSelected ? "proposal-row sent" : "proposal-row"}
            onClick={() => canSelect ? toggle(item.id) : onReview(item)}
            aria-pressed={isSelected}
          >
            <span className="proposal-check">{isSelected ? <Check /> : null}</span>
            <span><b>{item.statement}</b><small>{item.evidence}</small></span>
            <ProposalProgress status={record.status} />
            <em data-status={record.status}>{statusLabel(record.status)}</em>
            <ChevronDown />
          </button>;
        })}
      </div>
      {questionOpen ? <div className="inline-composer">
        <label><span>Ask a purpose-bound question</span><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What clarification is needed?" /></label>
        <button className="text-button" onClick={() => setQuestionOpen(false)}>Cancel</button>
        <button className="button" disabled={!question.trim()} onClick={() => {
          if (demo.sendMessage("helper", question)) {
            setQuestion("");
            setQuestionOpen(false);
          }
        }}><MessageCircle />Send</button>
      </div> : null}
      <div className="queue-actions">
        <button className="button button--outline" onClick={() => setQuestionOpen(true)}><MessageCircle />Ask owner</button>
        <button className="button button--outline" onClick={() => setSelected(new Set(selectable.map((item) => item.id)))}>Select available</button>
        <button className="button" onClick={send} disabled={selected.size === 0 || demo.paused || demo.stopped}><Send />Check & send</button>
      </div>
      <p className="workspace-role-note"><Link2 />This combined view supports a guided same-device handoff. The dedicated helper link uses the same capability and policy engine.</p>
    </section>
  );
}

function Passage() {
  return <aside className="protected-passage" aria-label="Protected proposal passage">
    <ShieldCheck /><b>Protected<br />passage</b><i /><Send /><span>Proposal<br />packets only</span><i /><LockKeyhole /><small>No owner data flows this way</small>
  </aside>;
}

function PolicySummary({ proposal }: { proposal: Proposal }) {
  const demo = useDemo();
  const record = demo.session.proposalRecords[proposal.id];
  const decision = record.policy ?? evaluateProposal(proposal, {
    scenarioId: demo.scenarioId,
    allowedTargets: demo.scenario.allowedTargets,
    allowedActions: demo.session.contract.allowedActions,
    currentValues: demo.session.portalValues,
  });
  return <div className="policy-summary">
    <header><span><ShieldCheck />Policy check</span><b data-allowed={decision.allowed}>{decision.allowed ? "Pass" : "Blocked"} · {decision.code}</b></header>
    <div>{decision.checks.map((item) => <span key={item.id} data-pass={item.passed}>{item.passed ? <Check /> : <X />}{item.label}</span>)}</div>
  </div>;
}

function OwnerRail({ selected, onSelect, onBlocked }: { selected: Proposal; onSelect: (proposal: Proposal) => void; onBlocked: () => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language);
  const [detailed, setDetailed] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [note, setNote] = useState("");
  const index = demo.scenario.proposals.findIndex((item) => item.id === selected.id);
  const record = demo.session.proposalRecords[selected.id];
  const reviewable = record.status === "pending";

  useEffect(() => {
    setRequesting(false);
    setNote("");
  }, [selected.id]);

  return (
    <aside className="owner-rail">
      <div className="owner-intro"><UserRound /><span>{demo.scenario.helperName} prepared {demo.scenario.proposals.length} details</span><em>{demo.session.invite.joinedAt ? "Capability verified" : "Awaiting helper"}</em></div>
      <div className="review-mode">
        <button className={!detailed ? "active" : ""} onClick={() => setDetailed(false)}><span /><b>Simple review</b><small>One proposal at a time.</small></button>
        <button className={detailed ? "active" : ""} onClick={() => setDetailed(true)}><span /><b>Detailed review</b><small>Show every policy check.</small></button>
        <p><ShieldCheck />{t.private}</p>
      </div>
      <div className="review-nav"><span>{t.review}</span><b>{index + 1} of {demo.scenario.proposals.length}</b><button aria-label="Previous proposal" onClick={() => onSelect(demo.scenario.proposals[Math.max(0, index - 1)])}><ArrowLeft /></button><button aria-label="Next proposal" onClick={() => onSelect(demo.scenario.proposals[Math.min(demo.scenario.proposals.length - 1, index + 1)])}><ArrowRight /></button></div>
      <div className="decision-card">
        <span className="current-label">{statusLabel(record.status)}</span>
        <h2>{selected.statement}</h2>
        <p>{selected.evidence}</p>
        <em>{Math.round(selected.confidence * 100)}% confidence</em>
        <div className="decision-preview"><span><small>Before</small>{selected.current}</span><ArrowRight /><span><small>After</small>{selected.proposed}</span></div>
        {detailed || record.policy ? <PolicySummary proposal={selected} /> : null}
        {record.status === "applied" ? <div className="decision-result decision-result--approved"><Check />Approved and applied owner-side</div> : null}
        {record.status === "rejected" ? <div className="decision-result decision-result--rejected"><X />Proposal rejected</div> : null}
        {record.status === "changes-requested" ? <div className="decision-result decision-result--changes"><RefreshCw />Changes requested: {record.note}</div> : null}
        {record.status === "blocked" ? <div className="decision-result decision-result--rejected"><Ban />Blocked by {record.policy?.code}</div> : null}
        {record.status === "revoked" ? <div className="decision-result decision-result--rejected"><StopCircle />Proposal revoked</div> : null}
        {!["applied", "rejected", "changes-requested", "blocked", "revoked"].includes(record.status) ? <>
          {!reviewable ? <div className="waiting-state"><Clock3 /><span><b>Waiting for a checked proposal.</b>The helper must send this item through the protected passage before you can decide.</span></div> : null}
          <button disabled={!reviewable || demo.paused || demo.stopped} className="decision approve" onClick={() => demo.decide(selected.id, "approved")}>{t.approve}</button>
          <button disabled={!reviewable || demo.stopped} className="decision change" onClick={() => setRequesting(true)}>{t.request}</button>
          <button disabled={!reviewable || demo.stopped} className="decision skip" onClick={() => demo.decide(selected.id, "rejected")}>{t.skip}</button>
        </> : null}
        {requesting ? <div className="change-request">
          <label><span>What should change?</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Give the helper a clear correction…" /></label>
          <div><button className="text-button" onClick={() => setRequesting(false)}>Cancel</button><button className="button" disabled={!note.trim()} onClick={() => {
            if (demo.requestChanges(selected.id, note)) setRequesting(false);
          }}>Send request</button></div>
        </div> : null}
        <button className="privacy-link" onClick={() => demo.setStage("privacy")}><Eye />{t.preview}<ArrowRight /></button>
      </div>
      {demo.session.messages.slice(-2).map((message) => <div className="owner-message" key={message.id}><MessageCircle /><span><small>{message.from}</small>{message.body}</span></div>)}
      <button className="blocked-row" onClick={onBlocked}><Ban /><span><small>{t.ownerOnly}</small><b>{t.submit}</b><em>Helpers can never submit on your behalf.</em></span><ArrowRight /></button>
      <div className="mobile-owner-tools" aria-label="Session results">
        <Link className="button button--outline" to={`/portal/${demo.scenarioId}`}><ExternalLink />Open controlled portal</Link>
        <button className="button" onClick={() => demo.setStage("receipt")}><ClipboardCheck />View session receipt</button>
      </div>
    </aside>
  );
}

function ActivityDrawer({ onClose }: { onClose: () => void }) {
  const demo = useDemo();
  return <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
    <aside className="activity-drawer" aria-label="Session activity" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><p className="quiet-label">Integrity-linked history</p><h2>Session activity</h2></div><button className="icon-button" onClick={onClose} aria-label="Close activity"><X /></button></header>
      <div className="activity-proof"><ShieldCheck /><span><b>{demo.session.events.length} validated events</b><small>Latest integrity {demo.session.events.at(-1)?.integrity}</small></span></div>
      <ol>{[...demo.session.events].reverse().map((event) => <li key={event.id}>
        <i data-actor={event.actor}>{event.actor === "owner" ? <UserRound /> : event.actor === "helper" ? <Send /> : <ShieldCheck />}</i>
        <span><b>{event.type.replaceAll("_", " ").toLowerCase()}</b><p>{event.summary}</p><small>{new Date(event.at).toLocaleTimeString()} · {event.integrity}</small></span>
      </li>)}</ol>
    </aside>
  </div>;
}

function ContractDrawer({ onClose }: { onClose: () => void }) {
  const demo = useDemo();
  return <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
    <aside className="activity-drawer contract-drawer" aria-label="Intent Contract" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><p className="quiet-label">Enforced boundaries</p><h2>Intent Contract</h2></div><button className="icon-button" onClick={onClose} aria-label="Close contract"><X /></button></header>
      <div className="contract-sheet">
        <span><small>Contract ID</small><b>{demo.session.contract.id}</b></span>
        <span><small>Mode</small><b>{demo.session.contract.mode}</b></span>
        <span><small>Scenario</small><b>{demo.scenario.title}</b></span>
        <span><small>Expires</small><b>{new Date(demo.session.invite.expiresAt).toLocaleTimeString()}</b></span>
      </div>
      <h3>Purpose</h3><p>{demo.session.contract.task}</p>
      <h3>Allowed protocol actions</h3><ul>{demo.session.contract.allowedActions.map((item) => <li key={item}><Check />{item}</li>)}</ul>
      <h3>Denied intents</h3><ul className="denied">{demo.session.contract.deniedIntents.map((item) => <li key={item}><Ban />{item}</li>)}</ul>
      <div className="activity-proof"><LockKeyhole /><span><b>Fail-closed policy</b><small>Unknown targets and stale values cannot be approved.</small></span></div>
    </aside>
  </div>;
}

export function Workspace({ initialStage }: { initialStage?: "privacy" | "blocked" | "receipt" } = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const demo = useDemo();
  const scenarioId = params.scenario && params.scenario in scenarios ? params.scenario as ScenarioId : demo.scenarioId;
  const [selected, setSelected] = useState<Proposal>(() => scenarios[scenarioId].proposals[0]);
  const [view, setView] = useState<"split" | "helper" | "owner">("split");
  const [activityOpen, setActivityOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const initialStageApplied = useRef(false);

  useEffect(() => {
    if (scenarioId !== demo.scenarioId) demo.setScenario(scenarioId);
  }, [scenarioId, demo]);
  useEffect(() => {
    setSelected(scenarios[scenarioId].proposals[0]);
  }, [scenarioId]);
  useEffect(() => {
    if (!initialStageApplied.current) {
      initialStageApplied.current = true;
      demo.setStage(initialStage ?? "workspace");
    }
  }, [demo, initialStage]);

  const applied = useMemo(
    () => demo.scenario.proposals.filter((item) => demo.statuses[item.id] === "applied").length,
    [demo.scenario.proposals, demo.statuses],
  );
  const pending = useMemo(
    () => demo.scenario.proposals.filter((item) => demo.statuses[item.id] === "pending").length,
    [demo.scenario.proposals, demo.statuses],
  );

  if (demo.stopped) return <Revoked onRestart={demo.restart} status={demo.session.status} />;
  if (demo.stage === "privacy") return <Preview proposal={selected} onBack={() => demo.setStage("workspace")} />;
  if (demo.stage === "blocked") return <Blocked onBack={() => demo.setStage("workspace")} />;
  if (demo.stage === "receipt") return <ReceiptPage />;

  return (
    <div className={demo.calm ? "session session--calm" : "session"}>
      <Header compact />
      <div className="session-titlebar">
        <strong>{demo.scenario.title}</strong>
        <span><LockKeyhole />Controlled-local mode</span>
        <div className="session-title-health"><i />Session healthy</div>
        <div className="view-switch"><button className={view === "helper" ? "active" : ""} onClick={() => setView("helper")}>Helper</button><button className={view === "split" ? "active" : ""} onClick={() => setView("split")}>Together</button><button className={view === "owner" ? "active" : ""} onClick={() => setView("owner")}>Owner</button></div>
      </div>
      {demo.lastError ? <div className="error-banner" role="alert"><AlertTriangle />{demo.lastError}<button onClick={demo.clearError} aria-label="Dismiss error"><X /></button></div> : null}
      {demo.paused ? <div className="paused-banner" role="status"><Pause />Session paused. Proposals and decisions are temporarily disabled.</div> : null}
      <main id="main" className={`workspace-layout workspace-layout--${view}`}>
        <TaskRail onContract={() => setContractOpen(true)} />
        <HelperWorkspace onReview={(item) => { setSelected(item); if (window.innerWidth <= 820) setView("owner"); }} />
        <Passage />
        <OwnerRail selected={selected} onSelect={setSelected} onBlocked={() => demo.setStage("blocked")} />
      </main>
      <div className="completion-nudge">
        <span><CheckCircle2 />{applied} applied · {pending} awaiting review · {demo.session.events.length} audit events</span>
        <Link className="text-button" to={`/portal/${demo.scenarioId}`}>Open controlled portal <ExternalLink /></Link>
        <button className="button" onClick={() => demo.setStage("receipt")}><ClipboardCheck />View session receipt</button>
        <button className="text-button" onClick={() => navigate("/demo")}>Leave session</button>
      </div>
      <SafetyBar onActivity={() => setActivityOpen(true)} />
      {activityOpen ? <ActivityDrawer onClose={() => setActivityOpen(false)} /> : null}
      {contractOpen ? <ContractDrawer onClose={() => setContractOpen(false)} /> : null}
    </div>
  );
}

function Preview({ proposal, onBack }: { proposal: Proposal; onBack: () => void }) {
  const demo = useDemo();
  const record = demo.session.proposalRecords[proposal.id];
  return <div className="focus-page"><Header compact /><main id="main" className="review-page">
    <button className="back-link" onClick={onBack}><ArrowLeft />Back to workspace</button>
    <p className="quiet-label">Privacy & consequence preview</p>
    <h1>Know exactly what will happen.</h1>
    <p className="lead">{proposal.statement}</p>
    <div className="preview-grid">
      <section><ShieldCheck /><h2>What is shared</h2><strong>{proposal.proposed}</strong><p>Only this derived field value reaches the controlled portal adapter.</p></section>
      <section><LockKeyhole /><h2>What stays private</h2><p>{proposal.privacy}</p></section>
      <section><Hand /><h2>What will happen</h2><p>{proposal.consequence}</p><span>Reversible · no submission · no payment</span></section>
    </div>
    {record.policy ? <div className="policy-detail-list"><h2><ListChecks />Policy evidence · {record.policy.code}</h2>{record.policy.checks.map((check) => <p key={check.id} data-pass={check.passed}>{check.passed ? <Check /> : <X />}<span><b>{check.label}</b>{check.detail}</span></p>)}</div> : null}
    <div className="consequence-line"><AlertTriangle /><span><b>Final submission stays with you.</b> TrustMode stops before any consequential final action.</span></div>
    <button className="button button--large" onClick={onBack}>I understand <ArrowRight /></button>
  </main></div>;
}

function Blocked({ onBack }: { onBack: () => void }) {
  return <div className="focus-page"><Header compact /><main id="main" className="blocked-page">
    <div className="blocked-symbol"><Ban /></div>
    <p className="quiet-label quiet-label--danger">Action blocked · TM-POL-506</p>
    <h1>The helper cannot submit this application.</h1>
    <p className="lead">Submission is consequential and irreversible. It always stays with the owner.</p>
    <div className="block-explanation"><div><b>TrustMode noticed</b><p>A proposal attempted to move beyond reversible preparation into final execution.</p></div><ArrowRight /><div><b>TrustMode did</b><p>Denied the capability, kept the controlled portal unchanged, and added an integrity-linked event.</p></div></div>
    <div className="safe-state"><CheckCircle2 /><span><b>Your application has not been submitted.</b> No payment, document, credential, or account action occurred.</span></div>
    <button className="button button--large" onClick={onBack}>Return to safe review <ArrowRight /></button>
  </main></div>;
}

function Revoked({ onRestart, status }: { onRestart: () => void; status: string }) {
  return <div className="focus-page"><Header compact /><main id="main" className="blocked-page">
    <div className="blocked-symbol"><StopCircle /></div>
    <p className="quiet-label quiet-label--danger">Session {status}</p>
    <h1>You are back in control.</h1>
    <p className="lead">The helper capability is invalid and every unfinished proposal has been revoked. No further change can be made from this session.</p>
    <div className="safe-state"><CheckCircle2 /><span><b>Applied owner decisions remain visible.</b> Nothing continued in the background.</span></div>
    <button className="button button--large" onClick={onRestart}>Start a fresh controlled session <ArrowRight /></button>
  </main></div>;
}

function ReceiptPage() {
  const demo = useDemo();
  const download = () => {
    const blob = new Blob([JSON.stringify(demo.receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${demo.receipt.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <div className="focus-page receipt-page"><Header compact /><main id="main" className="receipt">
    <div className="receipt-mark"><Check /></div>
    <p className="quiet-label">Sanitised session receipt</p>
    <h1>Help prepared. Control preserved.</h1>
    <p className="lead">A readable, integrity-linked record of this controlled TrustMode session.</p>
    <div className="receipt-sheet">
      <header><span><b>{demo.scenario.title}</b><small>{demo.receipt.id} · {demo.receipt.sessionId}</small></span><strong>{demo.session.status === "active" ? "Session in progress" : `Session ${demo.session.status}`}</strong></header>
      <section><h2>Applied owner-side</h2>{demo.receipt.approved.length ? demo.receipt.approved.map((item) => <p key={item}><Check />{item}</p>) : <p>No proposals were applied.</p>}</section>
      <section><h2>Rejected or blocked</h2>{[...demo.receipt.rejected, ...demo.receipt.blocked].map((item) => <p key={item}><Ban />{item}</p>)}</section>
      <section><h2>Privacy summary</h2><p><LockKeyhole />{demo.receipt.retained}</p></section>
      <section className="receipt-integrity"><h2>Integrity chain</h2><p><History />{demo.receipt.eventCount} events · latest checksum {demo.receipt.integrity}</p></section>
      <footer><span>Started {new Date(demo.receipt.startedAt).toLocaleString()}</span><span>Controlled synthetic workflow · no real submission</span></footer>
    </div>
    <div className="receipt-actions"><button className="button button--outline" onClick={() => window.print()}>Print receipt</button><button className="button button--outline" onClick={download}>Download JSON</button><button className="button" onClick={() => demo.setStage("workspace")}>Return to session <ArrowRight /></button></div>
  </main></div>;
}
