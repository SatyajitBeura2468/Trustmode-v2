import { ArrowLeft, Ban, Check, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { scenarios, type ScenarioId } from "@trustmode/core";
import { useDemo } from "../state/DemoContext";

export function ControlledPortalPage() {
  const params = useParams();
  const demo = useDemo();
  const [blocked, setBlocked] = useState(false);
  const scenarioId = params.scenario && params.scenario in scenarios
    ? params.scenario as ScenarioId
    : demo.scenarioId;
  const scenario = scenarios[scenarioId];
  const isActiveSession = demo.session.scenarioId === scenarioId;
  const appliedCount = useMemo(
    () => scenario.proposals.filter((proposal) => demo.session.proposalRecords[proposal.id]?.status === "applied").length,
    [demo.session.proposalRecords, scenario.proposals],
  );

  return <div className="portal-shell">
    <header className="portal-header">
      <div><ShieldCheck /><span><b>TrustMode controlled portal</b><small>Synthetic service adapter</small></span></div>
      <span className="portal-connection"><i />{isActiveSession ? "Owner session connected" : "Read-only template"}</span>
    </header>
    <main className="portal-main" id="main">
      <Link className="back-link" to={`/demo/${scenarioId}/session`}><ArrowLeft />Return to owner workspace</Link>
      <p className="quiet-label">Controlled execution surface</p>
      <h1>{scenario.title}</h1>
      <p className="lead">This fictional form proves that only owner-approved semantic changes can reach an allowlisted field.</p>
      <div className="portal-proof">
        <span><LockKeyhole /><b>No helper DOM access</b><small>Proposal packets only</small></span>
        <span><ShieldCheck /><b>Allowlisted adapter</b><small>{scenario.allowedTargets.length} controlled fields</small></span>
        <span><CheckCircle2 /><b>{appliedCount} changes applied</b><small>Owner-approved only</small></span>
      </div>
      <section className="portal-form" aria-label={`${scenario.title} controlled form`}>
        <header><span>Application details</span><em>{isActiveSession ? demo.session.id : "No active session"}</em></header>
        {scenario.proposals.map((proposal) => {
          const status = demo.session.proposalRecords[proposal.id]?.status;
          const applied = isActiveSession && status === "applied";
          const value = applied ? demo.session.portalValues[proposal.target.field] : proposal.current;
          return <label key={proposal.id}>
            <span>{proposal.label}<small>{applied ? "Applied after owner approval" : "Unchanged"}</small></span>
            <input
              readOnly
              data-trustmode-field={proposal.target.field}
              value={value}
              className={applied ? "changed" : ""}
            />
            {applied ? <Check aria-label="Applied" /> : null}
          </label>;
        })}
        <button type="button" className="portal-submit" onClick={() => setBlocked(true)}>
          Submit application <small>Owner-only final action</small>
        </button>
        {blocked ? <div className="portal-blocked" role="status"><Ban /><span><b>Submission remains blocked.</b>This controlled product applies reversible field changes only. No application was submitted.</span></div> : null}
      </section>
    </main>
  </div>;
}
