import {
  Check,
  CirclePause,
  Download,
  LockKeyhole,
  Send,
  ShieldCheck,
  Square,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type Proposal, type ProposalStatus } from "@trustmode/core";
import { Header } from "./Brand";
import { useDemo } from "../state/DemoContext";
import { getMessages, getScenarioCopy } from "../i18n";

const FINAL_STATUSES = new Set<ProposalStatus>(["applied", "rejected", "blocked", "revoked"]);

function speak(text: string, language: "en" | "hi" | "or") {
  window.speechSynthesis?.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "hi" ? "hi-IN" : language === "or" ? "or-IN" : "en-IN";
  window.speechSynthesis?.speak(utterance);
}

function Progress({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return <ol className="shared-progress" aria-label={label}>
    {steps.map((step, index) => <li className={index < current ? "done" : index === current ? "current" : ""} key={step}>
      <span>{index < current ? <Check aria-hidden="true" /> : index + 1}</span><b>{step}</b>
    </li>)}
  </ol>;
}

function activityCopy(type: string, helperName: string, t: ReturnType<typeof getMessages>["shared"]): string {
  if (type === "PROPOSAL_SENT") return `${helperName} ${t.activityHelperSent}`;
  if (type === "PROPOSAL_APPLIED") return `TrustMode ${t.activityApplied}`;
  if (type === "OWNER_FIELD_EDITED") return `You ${t.activityOwnerEdited}`;
  if (type === "SESSION_PAUSED") return `You ${t.activityPaused}`;
  if (type === "SESSION_RESUMED") return `You ${t.activityResumed}`;
  if (type === "SESSION_STOPPED") return `You ${t.activityEnded}`;
  if (type === "HELPER_JOINED") return `${helperName} ${t.activityJoined}`;
  if (type === "SESSION_COMPLETED") return `You ${t.activityCompleted}`;
  return "TrustMode updated the session.";
}

function Activity() {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const helperName = demo.session.helper?.displayName ?? "Helper";
  const items = demo.session.events.filter((event) => event.type !== "SESSION_CREATED").slice(-6).reverse();
  if (demo.calm) return <section className="activity-feed activity-feed--simple"><p>{t.simpleHidden}</p></section>;
  return <section className="activity-feed" aria-labelledby="activity-heading">
    <h2 id="activity-heading">{t.whatHappening}</h2>
    {items.length ? items.map((event) => <article key={event.id}>
      <span aria-hidden="true">{event.actor === "helper" ? helperName.slice(0, 1).toUpperCase() : event.actor === "owner" ? "You" : "i"}</span>
      <p>{activityCopy(event.type, helperName, t)}</p>
      <time dateTime={event.at}>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(event.at))}</time>
    </article>) : <p className="empty-copy">{t.noActivity}</p>}
  </section>;
}

function SafetyControls() {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const [ending, setEnding] = useState(false);
  const helperName = demo.session.helper?.displayName;
  const closed = ["stopped", "expired", "completed"].includes(demo.session.status);
  const lead = !helperName ? t.controlLeadWaiting : demo.paused ? t.controlLeadPaused : t.controlLeadActive;
  return <>
    <aside className="help-safety" aria-label="Help controls">
      <div><ShieldCheck aria-hidden="true" /><p><b>{t.youAreInControl}</b><span>{lead}</span></p></div>
      <div className="help-safety-actions">
        <button className="button button--outline" onClick={demo.togglePause} disabled={closed || !helperName}>
          <CirclePause />{demo.paused ? t.resumeHelp : t.pauseHelp}
        </button>
        <button className="button button--danger" onClick={() => setEnding(true)} disabled={closed}>
          <Square />{t.endHelp}
        </button>
      </div>
    </aside>
    {ending ? <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="end-help-title">
      <h2 id="end-help-title">{t.endTitle}</h2>
      <p>{t.endLead}</p>
      <div><button className="text-button" onClick={() => setEnding(false)}>{t.keepHelping}</button><button className="button button--danger" onClick={() => { demo.stop(); setEnding(false); }}>{t.endAccess}</button></div>
    </section></div> : null}
  </>;
}

function ProtectedField({ owner, label }: { owner: boolean; label: string }) {
  const t = getMessages(useDemo().language).shared;
  const maskedValue = owner ? "•••• •••• 2841" : "•••• •••• ••••";
  return <div className="protected-field"><LockKeyhole aria-hidden="true" /><span><b>{label}</b><small>{maskedValue} · {owner ? t.visibleOnlyYou : t.visibleOnlyOwner}</small></span></div>;
}

function OwnerReview({ proposal }: { proposal: Proposal }) {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const helperName = demo.session.helper?.displayName ?? "Helper";
  const [editing, setEditing] = useState(false);
  const record = demo.session.proposalRecords[proposal.id];
  const current = demo.session.portalValues[proposal.target.field] || proposal.current;
  const suggested = record.suggestedValue ?? proposal.proposed;
  const [answer, setAnswer] = useState(current === proposal.current ? suggested : current);

  useEffect(() => {
    setEditing(false);
    setAnswer(current === proposal.current ? suggested : current);
  }, [current, proposal.current, proposal.id, suggested]);

  return <section className="suggestion-card" aria-labelledby="suggestion-heading">
    <div className="suggestion-heading">
      <span>{helperName.slice(0, 1).toUpperCase()}</span>
      <div><h1 id="suggestion-heading">{helperName} {t.suggestionHeading}</h1><p>{t.suggestionLead}</p></div>
      <button className="read-button" onClick={() => speak(`${proposal.label}. ${suggested}. ${proposal.evidence}`, demo.language)} aria-label={t.readSuggestion}><Volume2 /></button>
    </div>
    <dl>
      <div><dt>{t.question}</dt><dd>{proposal.label}</dd></div>
      <div><dt>{t.currentAnswer}</dt><dd>{current}</dd></div>
      <div><dt>{t.suggestedAnswer}</dt><dd className="suggested-answer">{suggested}</dd></div>
      {!demo.calm ? <><div><dt>{t.why}</dt><dd>{proposal.evidence}</dd></div><div><dt>{t.whatWillHappen}</dt><dd>{t.onlyThisAnswer}</dd></div></> : null}
    </dl>
    {editing ? <label className="owner-note">
      <span>{t.ownerEditLabel}</span>
      <input value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={240} autoFocus />
      <div><button className="text-button" onClick={() => setEditing(false)}>{t.cancel}</button><button className="button" onClick={() => { if (demo.setField(proposal.id, answer)) setEditing(false); }}>{t.saveMyAnswer}</button></div>
    </label> : <div className="review-actions">
      <button className="button" onClick={() => demo.decide(proposal.id, "approved")}><Check />{t.approve}</button>
      <button className="button button--outline" onClick={() => setEditing(true)}>{t.editMyself}</button>
      <button className="button button--outline button--reject" onClick={() => demo.decide(proposal.id, "rejected")}>{t.reject}</button>
    </div>}
  </section>;
}

function OwnerWaiting({ onEdit, onReview }: { onEdit: (proposal: Proposal) => void; onReview: () => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const helperJoined = Boolean(demo.session.helper && demo.session.invite.joinedAt);
  const unresolved = demo.scenario.proposals.filter((proposal) => !FINAL_STATUSES.has(demo.session.proposalRecords[proposal.id]?.status));
  return <section className="owner-empty owner-waiting">
    <h1>{helperJoined ? t.noSuggestionTitle : t.waitingForHelper}</h1>
    <p>{helperJoined ? t.noSuggestionWaiting : t.noSuggestionNotJoined}</p>
    <div className="owner-field-list">
      {unresolved.map((proposal) => <article key={proposal.id}>
        <span><b>{proposal.label}</b><small>{demo.session.portalValues[proposal.target.field] || proposal.current}</small></span>
        <button className="button button--outline" onClick={() => onEdit(proposal)}>{t.editMyself}</button>
      </article>)}
    </div>
    <button className="text-button review-current" onClick={onReview}>{t.finalReview}</button>
  </section>;
}

function OwnerDirectEdit({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const current = demo.session.portalValues[proposal.target.field] || proposal.current;
  const [answer, setAnswer] = useState(current === proposal.current ? "" : current);
  return <section className="suggestion-card owner-direct-edit">
    <div className="suggestion-heading"><span>You</span><div><h1>{t.editMyself}</h1><p>{proposal.label}</p></div></div>
    <label className="owner-note"><span>{t.ownerEditLabel}</span><input value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={240} autoFocus />
      <div><button className="text-button" onClick={onClose}>{t.cancel}</button><button className="button" disabled={!answer.trim()} onClick={() => { if (demo.setField(proposal.id, answer)) onClose(); }}>{t.saveMyAnswer}</button></div>
    </label>
  </section>;
}

function FinalReview({ completed }: { completed: boolean }) {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const copy = getScenarioCopy(demo.language, demo.scenarioId);
  const completedCount = demo.scenario.proposals.filter((proposal) => demo.session.proposalRecords[proposal.id]?.status === "applied").length;
  const helperName = demo.session.helper?.displayName;

  const download = () => {
    const lines = [
      "TrustMode session summary",
      copy.title,
      `${t.helpedBy}: ${helperName ?? t.noHelperJoined}`,
      `${t.fieldsCompleted}: ${completedCount}/${demo.scenario.proposals.length}`,
      "",
      ...demo.scenario.proposals.map((proposal) => `${proposal.label}: ${demo.session.portalValues[proposal.target.field] || proposal.current}`),
      "",
      t.noRealSubmission,
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `trustmode-${demo.session.id}-summary.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section className="final-review">
    <div className="final-review-heading"><ShieldCheck /><div><h1>{completed ? t.completedTitle : t.finalReview}</h1><p>{completed ? t.completedLead : t.finalReviewLead}</p></div></div>
    <div className="final-answer-list">
      {demo.scenario.proposals.map((proposal) => <article key={proposal.id}><span>{proposal.label}</span><b>{demo.session.portalValues[proposal.target.field] || proposal.current}</b></article>)}
    </div>
    <div className="owner-only-final"><LockKeyhole /><span><b>{copy.finalAction}</b><small>{t.finalActionLead}</small></span><button className="button" disabled>{copy.finalAction}</button></div>
    {completed ? <button className="button button--outline" onClick={download}><Download />{t.downloadSummary}</button> : <button className="button button--large" onClick={demo.complete}>{t.finishSession}</button>}
    <p className="no-submission-proof"><ShieldCheck />{t.noRealSubmission}</p>
  </section>;
}

function sessionStatus(demo: ReturnType<typeof useDemo>, t: ReturnType<typeof getMessages>["shared"]): string {
  if (demo.session.status === "completed") return t.sessionComplete;
  if (["stopped", "expired"].includes(demo.session.status)) return t.helpEnded;
  if (demo.paused) return t.helpPaused;
  if (demo.connectionStatus === "error") return t.reconnecting;
  if (!demo.session.helper) return t.waitingStatus;
  return `${demo.session.helper.displayName} ${t.joinedStatus}`;
}

export function OwnerTask() {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const copy = getScenarioCopy(demo.language, demo.scenarioId);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const pending = demo.scenario.proposals.find((item) => demo.session.proposalRecords[item.id]?.status === "pending");
  const allFinal = demo.scenario.proposals.every((item) => FINAL_STATUSES.has(demo.session.proposalRecords[item.id]?.status));
  const completed = demo.session.status === "completed";
  const currentStep = completed ? copy.steps.length - 1 : !demo.session.helper ? 0 : reviewMode || allFinal ? copy.steps.length - 2 : demo.scenario.workStepIndex;
  const waitingCount = Object.values(demo.statuses).filter((status) => status === "pending").length;
  const pendingId = pending?.id;

  useEffect(() => {
    if (pendingId) {
      setEditingProposal(null);
      setReviewMode(false);
    }
  }, [pendingId]);

  return <div className="shared-task owner-task">
    <Header compact />
    <main id="main">
      <header className="shared-task-header">
        <div><p>{copy.title} · {t.sampleSession}</p><h1>{demo.session.helper ? `${demo.session.helper.displayName} ${t.helpingWith.toLowerCase()} ${copy.sectionTitle}` : t.waitingForHelper}</h1></div>
        <span className="connected-copy" data-state={demo.session.helper ? "joined" : "waiting"}><i />{sessionStatus(demo, t)}</span>
      </header>
      <Progress steps={copy.steps} current={currentStep} label={t.progressLabel} />
      <div className="shared-task-grid">
        <section className="form-area">
          <div className="section-heading"><div><h2>{copy.sectionTitle}</h2><p>{copy.sectionLead}</p></div><span>{waitingCount} {t.suggestionsWaiting}</span></div>
          <ProtectedField owner label={copy.protectedField} />
          {completed ? <FinalReview completed /> : reviewMode || allFinal ? <FinalReview completed={false} /> : editingProposal ? <OwnerDirectEdit proposal={editingProposal} onClose={() => setEditingProposal(null)} /> : pending ? <OwnerReview proposal={pending} /> : <OwnerWaiting onEdit={setEditingProposal} onReview={() => setReviewMode(true)} />}
        </section>
        <Activity />
      </div>
    </main>
    <SafetyControls />
  </div>;
}

function statusText(status: ProposalStatus, t: ReturnType<typeof getMessages>["shared"]): string {
  const text: Record<ProposalStatus, string> = {
    draft: t.statusNotReady,
    prepared: t.statusReady,
    checking: t.statusChecking,
    pending: t.statusWaitingOwner,
    approved: t.statusApproved,
    rejected: t.statusRejected,
    "changes-requested": t.statusUpdate,
    applied: t.statusAdded,
    blocked: t.statusBlocked,
    revoked: t.statusEnded,
  };
  return text[status];
}

export function HelperTask() {
  const demo = useDemo();
  const t = getMessages(demo.language).shared;
  const copy = getScenarioCopy(demo.language, demo.scenarioId);
  const helperName = demo.session.helper?.displayName ?? "Helper";
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(
    demo.scenario.proposals.map((proposal) => [proposal.id, demo.session.proposalRecords[proposal.id]?.suggestedValue ?? proposal.proposed]),
  ));

  useEffect(() => {
    setValues((current) => Object.fromEntries(demo.scenario.proposals.map((proposal) => [
      proposal.id,
      current[proposal.id] ?? demo.session.proposalRecords[proposal.id]?.suggestedValue ?? proposal.proposed,
    ])));
  }, [demo.scenario.proposals, demo.session.proposalRecords]);

  const currentStep = demo.scenario.proposals.every((item) => FINAL_STATUSES.has(demo.session.proposalRecords[item.id]?.status)) ? copy.steps.length - 2 : demo.scenario.workStepIndex;
  const helperStatus = demo.stopped ? t.helpEnded : demo.paused ? t.helpPaused : `${helperName} ${t.joinedStatus}`;

  return <div className="shared-task helper-task">
    <Header compact />
    <main id="main">
      <header className="shared-task-header"><div><p>{copy.title} · {t.sampleSession}</p><h1>{demo.stopped ? t.helpEnded : `${helperName}: ${t.helpingWith} ${copy.sectionTitle}`}</h1></div><span className="connected-copy" data-state={demo.stopped ? "ended" : demo.paused ? "paused" : "joined"}><i />{helperStatus}</span></header>
      <Progress steps={copy.steps} current={currentStep} label={t.progressLabel} />
      <div className="shared-task-grid"><section className="form-area">
        <div className="section-heading"><div><h2>{copy.sectionTitle}</h2><p>{t.helperLead}</p></div></div>
        <ProtectedField owner={false} label={copy.protectedField} />
        <div className="helper-form-list">{demo.scenario.proposals.map((proposal) => {
          const record = demo.session.proposalRecords[proposal.id];
          const selectable = ["prepared", "changes-requested"].includes(record.status);
          return <article className="helper-answer" key={proposal.id}>
            <div><label>{proposal.label}</label><p>{t.currentAnswer}: <b>{demo.session.portalValues[proposal.target.field] || proposal.current}</b></p></div>
            <label className="helper-suggestion-input"><span>{t.suggestionInput}</span><input value={values[proposal.id] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [proposal.id]: event.target.value }))} maxLength={240} disabled={!selectable || demo.paused || demo.stopped} />{!demo.calm ? <small>{proposal.evidence}</small> : null}</label>
            <footer><span>{statusText(record.status, t)}</span>{selectable ? <button className="button" onClick={() => demo.sendProposals([{ proposalId: proposal.id, value: values[proposal.id] ?? "" }])} disabled={!values[proposal.id]?.trim() || demo.paused || demo.stopped}><Send />{t.sendSuggestion}</button> : null}</footer>
          </article>;
        })}</div>
      </section><Activity /></div>
    </main>
  </div>;
}
