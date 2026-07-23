import {
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  MessageCircle,
  Pause,
  Send,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function HelperWorkspacePage() {
  const demo = useDemo();
  const { openHelperSession } = demo;
  const [params] = useSearchParams();
  const sessionId = params.get("session");
  const token = params.get("token") ?? "";
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const [loadingCapability, setLoadingCapability] = useState(Boolean(sessionId && token));
  const [capabilityLoaded, setCapabilityLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!sessionId || !token) {
      setLoadingCapability(false);
      return () => { active = false; };
    }
    void openHelperSession(sessionId, token).then((loaded) => {
      if (active) {
        setCapabilityLoaded(loaded);
        setLoadingCapability(false);
      }
    });
    return () => { active = false; };
  }, [openHelperSession, sessionId, token]);
  const matchesSession = sessionId === demo.session.id && token === demo.session.invite.token;
  const joined = matchesSession && Boolean(demo.session.invite.joinedAt);
  const preparedIds = useMemo(
    () => demo.scenario.proposals
      .filter((proposal) => ["prepared", "changes-requested"].includes(demo.session.proposalRecords[proposal.id]?.status))
      .map((proposal) => proposal.id),
    [demo.scenario.proposals, demo.session.proposalRecords],
  );

  const verify = async () => {
    if (await demo.verifyHelperCapability(token, code)) setCode("");
  };

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

  if (loadingCapability) {
    return <div className="helper-shell"><Header compact /><main className="helper-invalid" id="main" aria-live="polite">
      <ShieldCheck />
      <p className="quiet-label">Loading protected workspace</p>
      <h1>Verifying the shared capability.</h1>
      <p>TrustMode is loading the helper-safe view for this contract.</p>
    </main></div>;
  }

  if (!matchesSession || !capabilityLoaded) {
    return <div className="helper-shell"><Header compact /><main className="helper-invalid" id="main">
      <WifiOff />
      <p className="quiet-label quiet-label--danger">Capability unavailable</p>
      <h1>This helper link is unavailable.</h1>
      <p>The capability may be expired, revoked, or incomplete. Ask the owner for a fresh link if needed.</p>
    </main></div>;
  }

  if (!joined) {
    return <div className="helper-shell"><Header compact /><main className="helper-verify" id="main">
      <div className="helper-verify-mark"><KeyRound /></div>
      <p className="quiet-label">Helper verification</p>
      <h1>Confirm the code from the owner.</h1>
      <p className="lead">The link and code must arrive separately. Verification grants access only to safe semantic fields for this contract.</p>
      <div className="capability-summary">
        <span><ShieldCheck /><b>{demo.scenario.title}</b><small>{demo.session.contract.id}</small></span>
        <span><Clock3 /><b>{formatDuration(demo.remainingSeconds)}</b><small>remaining</small></span>
        <span><LockKeyhole /><b>No account access</b><small>proposal capability only</small></span>
      </div>
      <label className="verification-input">
        <span>Six-digit verification code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
        />
      </label>
      {demo.lastError ? <p className="form-error" role="alert">{demo.lastError}</p> : null}
      <button className="button button--large" onClick={() => void verify()} disabled={code.length !== 6}>Verify and enter <ArrowRight /></button>
    </main></div>;
  }

  return <div className="helper-shell">
    <Header compact />
    <div className="helper-statusbar">
      <span><i className={demo.session.status} />Session {demo.session.status}</span>
      <span>{demo.session.contract.id}</span>
      <span><Clock3 />{formatDuration(demo.remainingSeconds)} remaining</span>
    </div>
    {demo.paused ? <div className="paused-banner"><Pause />Owner paused this session. Preparation is read-only.</div> : null}
    <main className="helper-product" id="main">
      <aside className="helper-brief">
        <p className="quiet-label">Task brief</p>
        <h2>{demo.scenario.title}</h2>
        <p>{demo.session.contract.task}</p>
        <h3>Allowed</h3>
        <ul><li>Read semantic field names</li><li>Use derived facts</li><li>Prepare reversible proposals</li><li>Ask purpose-bound questions</li></ul>
        <h3>Never available</h3>
        <ul className="denied"><li>Credentials and OTPs</li><li>Raw documents</li><li>Payments and recovery</li><li>Final submission</li></ul>
        <div className="helper-boundary"><LockKeyhole /><span><b>Owner data stays sealed.</b>No private source values cross into this workspace.</span></div>
      </aside>

      <section className="helper-main">
        <div className="workspace-heading">
          <div><p className="quiet-label">Ghost Workspace</p><h1>Prepare meaning, not control.</h1><span>{preparedIds.length} proposals available for preparation</span></div>
          <div className="session-health"><i /><span><b>Session healthy</b>Capability verified</span></div>
        </div>
        <div className="helper-fields">
          {demo.scenario.proposals.map((proposal) => {
            const record = demo.session.proposalRecords[proposal.id];
            const selectable = ["prepared", "changes-requested"].includes(record.status);
            return <button
              key={proposal.id}
              className={selected.has(proposal.id) ? "helper-field selected" : "helper-field"}
              onClick={() => selectable && toggle(proposal.id)}
              disabled={!selectable || demo.paused || demo.stopped}
            >
              <span className="proposal-check">{selected.has(proposal.id) ? <Check /> : null}</span>
              <span><small>Semantic field</small><b>{proposal.label}</b></span>
              <span><small>Safe suggestion</small><b>{proposal.proposed}</b></span>
              <span><small>Evidence</small>{proposal.evidence}</span>
              <em data-status={record.status}>{record.status.replace("-", " ")}</em>
            </button>;
          })}
        </div>
        <div className="helper-policy-note"><ShieldCheck /><span><b>Every selected proposal receives six checks.</b> Contract scope, target allowlist, freshness, sensitive intent, payload integrity, and owner authority.</span></div>
        <div className="helper-actions">
          <span>{selected.size} selected</span>
          <button className="button button--outline" onClick={() => setSelected(new Set(preparedIds))}>Select available</button>
          <button className="button" disabled={selected.size === 0 || demo.paused || demo.stopped} onClick={send}><Send />Check and send</button>
        </div>
      </section>

      <aside className="helper-activity">
        <p className="quiet-label">Owner connection</p>
        <div className="owner-presence"><CheckCircle2 /><span><b>{demo.scenario.ownerName}</b>Owner workspace connected</span></div>
        <h2>Purpose-bound messages</h2>
        <div className="message-list">
          {demo.session.messages.length ? demo.session.messages.slice(-5).map((item) => (
            <article key={item.id} data-from={item.from}><small>{item.from}</small><p>{item.body}</p></article>
          )) : <p>No messages yet. Ask only what is needed for this task.</p>}
        </div>
        <label className="message-composer"><span>Ask the owner</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a focused clarification…" /></label>
        <button className="button button--outline" disabled={!message.trim() || demo.paused || demo.stopped} onClick={() => {
          if (demo.sendMessage("helper", message)) setMessage("");
        }}><MessageCircle />Send question</button>
        <div className="owner-only-block"><Ban /><span><small>Owner-only</small><b>Submit application</b><em>Unavailable by protocol</em></span></div>
      </aside>
    </main>
  </div>;
}
