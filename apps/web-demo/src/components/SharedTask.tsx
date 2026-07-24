import { Check, CirclePause, LockKeyhole, Send, ShieldCheck, Square, Volume2 } from "lucide-react";
import { useState } from "react";
import { type Proposal, type ProposalStatus } from "@trustmode/core";
import { useDemo } from "../state/DemoContext";

const steps = ["Personal details", "Education details", "Documents", "Review", "Final submission"];

function speak(text: string) {
  window.speechSynthesis?.cancel();
  window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text));
}

function statusText(status: ProposalStatus, ownerName: string) {
  const text: Record<ProposalStatus, string> = {
    draft: "Not ready yet", prepared: "Ready for a suggestion", checking: "Checking the suggestion",
    pending: `Waiting for ${ownerName}`, approved: `${ownerName} approved this`, rejected: `${ownerName} chose not to use this`,
    "changes-requested": "Please update this suggestion", applied: "Added to the form", blocked: "This cannot be changed here", revoked: "Help has ended",
  };
  return text[status];
}

function Progress({ current = 1 }: { current?: number }) {
  return <ol className="shared-progress" aria-label="Form progress">
    {steps.map((step, index) => <li className={index < current ? "done" : index === current ? "current" : ""} key={step}>
      <span>{index < current ? <Check aria-hidden="true" /> : index + 1}</span><b>{step}</b>
    </li>)}
  </ol>;
}

function Activity() {
  const demo = useDemo();
  const scenario = demo.scenario;
  const items = demo.session.events.slice(-4).reverse();
  return <section className="activity-feed" aria-labelledby="activity-heading">
    <h2 id="activity-heading">What is happening</h2>
    {items.length ? items.map((event) => <article key={event.id}>
      <span aria-hidden="true">{event.actor === "helper" ? "R" : event.actor === "owner" ? "You" : "i"}</span>
      <p>{event.actor === "helper" ? scenario.helperName : event.actor === "owner" ? "You" : "TrustMode"} {event.type === "PROPOSAL_SENT" ? "sent a suggestion for review." : event.type === "PROPOSAL_APPLIED" ? "added an approved answer to the form." : event.type === "SESSION_PAUSED" ? "paused help." : event.type === "SESSION_STOPPED" ? "ended help access." : event.summary.replace(/Intent Contract|capability|proposal/gi, "help session")}</p>
      <time dateTime={event.at}>{new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round((new Date(event.at).getTime() - Date.now()) / 60_000), "minute")}</time>
    </article>) : <p className="empty-copy">No activity yet. The person you invite will appear here when they join.</p>}
  </section>;
}

function SafetyControls() {
  const demo = useDemo();
  const [ending, setEnding] = useState(false);
  const helper = demo.scenario.helperName;
  return <>
    <aside className="help-safety" aria-label="Help controls">
      <div><ShieldCheck aria-hidden="true" /><p><b>{demo.paused ? "Help is paused" : "You are in control"}</b><span>{demo.paused ? `${helper} cannot see or suggest changes until you resume.` : `${helper} can suggest answers. You decide what is added.`}</span></p></div>
      <div className="help-safety-actions">
        <button className="button button--outline" onClick={demo.togglePause} disabled={demo.stopped}><CirclePause />{demo.paused ? "Resume Help" : "Pause Help"}</button>
        <button className="button button--danger" onClick={() => setEnding(true)} disabled={demo.stopped}><Square />End Help</button>
      </div>
    </aside>
    {ending ? <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="end-help-title">
      <h2 id="end-help-title">End {helper}'s access?</h2>
      <p>{helper} will immediately lose access to this session. Your saved sample information will remain available to you.</p>
      <div><button className="text-button" onClick={() => setEnding(false)}>Keep Helping</button><button className="button button--danger" onClick={() => { demo.stop(); setEnding(false); }}>End Access</button></div>
    </section></div> : null}
  </>;
}

function ProtectedField({ owner = false }: { owner?: boolean }) {
  return <div className="protected-field"><LockKeyhole aria-hidden="true" /><span><b>Aadhaar number</b><small>•••• •••• 2841 · {owner ? "Visible only to you" : "Visible only to the owner"}</small></span></div>;
}

function OwnerReview({ proposal }: { proposal: Proposal }) {
  const demo = useDemo();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const record = demo.session.proposalRecords[proposal.id];
  const current = demo.session.portalValues[proposal.target.field] || "Not selected";
  if (record.status !== "pending") return <section className="owner-empty"><h1>Your form is ready to review.</h1><p>{record.status === "applied" ? `${proposal.proposed} was added as your ${proposal.label.toLowerCase()}.` : "There are no suggestions waiting for you right now."}</p></section>;
  return <section className="suggestion-card" aria-labelledby="suggestion-heading">
    <div className="suggestion-heading"><span>R</span><div><h1 id="suggestion-heading">{demo.scenario.helperName} suggested a change</h1><p>Review one answer at a time. Nothing is submitted from this screen.</p></div><button className="read-button" onClick={() => speak(`${demo.scenario.helperName} suggested ${proposal.proposed} for ${proposal.label}. ${proposal.evidence}`)} aria-label="Read this suggestion aloud"><Volume2 /></button></div>
    <dl>
      <div><dt>Question</dt><dd>{proposal.label}</dd></div><div><dt>Current answer</dt><dd>{current}</dd></div><div><dt>Suggested answer</dt><dd className="suggested-answer">{proposal.proposed}</dd></div><div><dt>Why</dt><dd>{proposal.evidence}</dd></div><div><dt>What will happen</dt><dd>Only this answer will be filled. The form will not be submitted.</dd></div>
    </dl>
    {editing ? <label className="owner-note"><span>Tell {demo.scenario.helperName} what you would like changed</span><textarea value={note} onChange={(event) => setNote(event.target.value)} /><button className="button" onClick={() => { if (demo.requestChanges(proposal.id, note)) setEditing(false); }}>Send request</button></label> : <div className="review-actions"><button className="button" onClick={() => demo.decide(proposal.id, "approved")}><Check />Approve</button><button className="button button--outline" onClick={() => setEditing(true)}>Edit myself</button><button className="button button--outline button--reject" onClick={() => demo.decide(proposal.id, "rejected")}>Reject</button></div>}
  </section>;
}

export function OwnerTask() {
  const demo = useDemo();
  const scenario = demo.scenario;
  const pending = scenario.proposals.find((item) => demo.session.proposalRecords[item.id]?.status === "pending") ?? scenario.proposals[0];
  return <div className="shared-task owner-task"><main id="main"><header className="shared-task-header"><div><p>Scholarship form · sample practice session</p><h1>{demo.stopped ? `${scenario.helperName}'s access has ended.` : `${scenario.helperName} is helping with ${steps[1]}`}</h1></div><span className="connected-copy"><i />{demo.stopped ? "Help ended" : demo.paused ? "Help paused" : "Connected"}</span></header><Progress />
    <div className="shared-task-grid"><section className="form-area"><div className="section-heading"><div><h2>Education details</h2><p>Check each answer carefully. You can change anything yourself.</p></div><span>{Object.values(demo.statuses).filter((status) => status === "pending").length} suggestion{Object.values(demo.statuses).filter((status) => status === "pending").length === 1 ? "" : "s"} to review</span></div><ProtectedField owner /><OwnerReview proposal={pending} /></section><Activity /></div></main><SafetyControls /></div>;
}

export function HelperTask() {
  const demo = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = demo.scenario;
  return <div className="shared-task helper-task"><main id="main"><header className="shared-task-header"><div><p>Scholarship form · sample practice session</p><h1>You are helping with Education details</h1></div><span className="connected-copy"><i />{demo.paused ? "Help is paused" : "Connected to the owner"}</span></header><Progress />
    <div className="shared-task-grid"><section className="form-area"><div className="section-heading"><div><h2>Education details</h2><p>Suggest an answer for the owner to review. The owner decides what is added.</p></div></div><ProtectedField />
      <div className="helper-form-list">{scenario.proposals.map((proposal) => { const record = demo.session.proposalRecords[proposal.id]; const selectable = ["prepared", "changes-requested"].includes(record.status); return <article className={selected === proposal.id ? "helper-answer selected" : "helper-answer"} key={proposal.id}><div><label>{proposal.label}</label><p>Current answer: <b>{demo.session.portalValues[proposal.target.field] || "Not selected"}</b></p></div><div><label>Suggested answer</label><b>{proposal.proposed}</b><small>{proposal.evidence}</small></div><footer><span>{statusText(record.status, scenario.ownerName)}</span>{selectable ? <button className="button" onClick={() => { setSelected(proposal.id); demo.sendProposals([proposal.id]); }} disabled={demo.paused || demo.stopped}><Send />Send suggestion to {scenario.ownerName}</button> : null}</footer></article>; })}</div>
    </section><Activity /></div></main></div>;
}
