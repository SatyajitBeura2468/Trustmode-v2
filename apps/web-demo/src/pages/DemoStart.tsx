import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { scenarioList, scenarios, type AssistanceMode, type ScenarioId } from "@trustmode/core";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";
import { getMessages, getScenarioCopy } from "../i18n";

function inferScenario(task: string): ScenarioId {
  const value = task.toLowerCase();
  if (/\b(hospital|doctor|appointment|patient|clinic|medical)\b/.test(value)) return "hospital";
  if (/\b(college|admission|university|course|hostel)\b/.test(value)) return "admission";
  return "scholarship";
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function DemoStart() {
  const params = useParams();
  const navigate = useNavigate();
  const demo = useDemo();
  const [step, setStep] = useState<"scenario" | "permissions" | "invite">(
    () => params.scenario ? "permissions" : "scenario",
  );
  const [task, setTask] = useState(demo.session.contract.task);
  const [copied, setCopied] = useState(false);
  const [interpreted, setInterpreted] = useState<ScenarioId | null>(null);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const appliedRouteScenario = useRef<ScenarioId | null>(null);
  const t = getMessages(demo.language);
  const routeScenario = params.scenario && params.scenario in scenarios
    ? params.scenario as ScenarioId
    : null;
  const selected = routeScenario ?? demo.scenarioId;
  const selectedCopy = getScenarioCopy(demo.language, selected);
  const invitationHealth = useMemo(
    () => demo.session.status === "active" ? t.setup.invitationReady : t.setup.unavailable,
    [demo.session.status, t.setup.invitationReady, t.setup.unavailable],
  );

  useEffect(() => {
    if (!routeScenario || appliedRouteScenario.current === routeScenario) return;
    appliedRouteScenario.current = routeScenario;
    setTask(scenarios[routeScenario].task);
    if (demo.scenarioId !== routeScenario) {
      demo.configureSession(routeScenario, demo.mode, scenarios[routeScenario].task);
    }
  }, [demo, routeScenario]);

  const choose = (id: ScenarioId) => {
    demo.configureSession(id, demo.mode, task);
    setInterpreted(id);
    setStep("permissions");
    navigate(`/demo/${id}`, { replace: true });
  };

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(demo.helperUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  const continueAsOwner = () => {
    demo.setStage("workspace");
    navigate(`/demo/${selected}/session`);
  };

  const createInvitation = async () => {
    setCreatingInvitation(true);
    const published = await demo.publishSession();
    setCreatingInvitation(false);
    if (published) {
      demo.setStage("invite");
      setStep("invite");
    }
  };

  const current = step === "scenario" ? 0 : step === "permissions" ? 1 : 2;

  return (
    <div className="demo-setup">
      <Header compact />
      <main id="main" className="setup-main">
        <div className="setup-progress" aria-label="Setup progress">
          {t.setup.progress.map((label, index) => (
            <span className={index <= current ? "active" : ""} key={label}><i>{index + 1}</i>{label}</span>
          ))}
        </div>

        {step === "scenario" ? (
          <section className="setup-panel">
            <p className="quiet-label">{t.setup.sample}</p>
            <h1>{t.setup.chooseTask}</h1>
            <p className="lead">{t.setup.chooseLead}</p>
            <div className="task-composer">
              <label className="sr-only" htmlFor="task-description">{t.setup.chooseTask}</label>
              <textarea
                id="task-description"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder={t.setup.placeholder}
              />
              <div>
                <span className="composer-privacy"><LockKeyhole /> {t.setup.privacyNote}</span>
                <button className="button" onClick={() => choose(inferScenario(task))} disabled={task.trim().length < 12}>
                  <Sparkles /> {t.setup.interpret} <ArrowRight />
                </button>
              </div>
            </div>
            {interpreted ? <div className="interpretation-result" role="status">
              <Check />
              <span><b>{t.setup.matched} {getScenarioCopy(demo.language, interpreted).shortTitle}.</b> {t.setup.canChange}</span>
            </div> : null}
            <div className="scenario-choice" aria-label="Sample workflows">
              {scenarioList.map((scenario) => {
                const copy = getScenarioCopy(demo.language, scenario.id);
                return (
                  <button key={scenario.id} onClick={() => choose(scenario.id)}>
                    <span style={{ background: scenario.accent }} />
                    <b>{copy.shortTitle}</b>
                    <small>{copy.description}</small>
                    <ArrowRight />
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {step === "permissions" ? (
          <section className="setup-panel contract">
            <div className="contract-heading">
              <div>
                <p className="quiet-label">{t.setup.permissionsLabel}</p>
                <h1>{t.setup.permissionsTitle}</h1>
                <p className="lead">{selectedCopy.title}. {t.setup.permissionsLead}</p>
              </div>
              <aside className="owner-control-proof">
                <ShieldCheck />
                <span><small>{t.setup.controlTitle}</small><b>{t.setup.controlBadge}</b></span>
              </aside>
            </div>
            <div className="mode-picker" role="radiogroup" aria-label="Assistance mode">
              {(Object.entries(t.setup.modes) as [AssistanceMode, [string, string]][]).map(([mode, copy]) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={demo.mode === mode}
                  className={demo.mode === mode ? "selected" : ""}
                  onClick={() => demo.configureSession(selected, mode, task)}
                  key={mode}
                >
                  <span>{demo.mode === mode ? <Check /> : null}</span>
                  <b>{copy[0]}</b>
                  <small>{copy[1]}</small>
                </button>
              ))}
            </div>
            <div className="contract-columns">
              <div><h2><Check /> {t.setup.canTitle}</h2><ul>{t.setup.canItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h2><X /> {t.setup.cannotTitle}</h2><ul>{t.setup.cannotItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
            <div className="contract-proof plain-proof">
              <ShieldCheck />
              <span><b>{t.setup.controlTitle}</b> {t.setup.controlBody}</span>
              <strong>{t.setup.controlBadge}</strong>
            </div>
            <div className="setup-actions">
              <button className="text-button" onClick={() => setStep("scenario")}>{t.setup.back}</button>
              <button className="button button--large" onClick={() => void createInvitation()} disabled={creatingInvitation}>
                {creatingInvitation ? t.setup.creatingInvitation : t.setup.createInvitation} <ArrowRight />
              </button>
            </div>
          </section>
        ) : null}

        {step === "invite" ? (
          <section className="setup-panel invite">
            <div className="invite-icon"><Link2 /></div>
            <p className="quiet-label">{t.setup.invitationLabel}</p>
            <h1>{t.setup.invitationTitle}</h1>
            <p className="lead">{t.setup.invitationLead}</p>
            <div className="invite-health">
              <span><i />{invitationHealth}</span>
              <span><Clock3 /> {t.setup.expiresIn} {formatDuration(demo.remainingSeconds)}</span>
              <span><ShieldCheck /> {t.setup.oneHelper}</span>
            </div>
            <div className="invite-code">
              <span>{t.setup.linkReady}</span>
              <button onClick={copyInvite}>{copied ? <Check /> : <Copy />}{copied ? t.setup.copied : t.setup.copyLink}</button>
            </div>
            <div className="verification">
              <span>{t.setup.verificationCode}</span>
              <strong>{demo.session.invite.verificationCode}</strong>
              <small>{t.setup.shareSeparately}</small>
            </div>
            <div className="invite-paths">
              <button className="button button--outline" onClick={() => window.open(demo.helperUrl, "_blank", "noopener,noreferrer")}>
                {t.setup.openHelper} <ExternalLink />
              </button>
              <button className="button button--large" onClick={continueAsOwner}>
                {t.setup.continueOwner} <ArrowRight />
              </button>
            </div>
            <p className="local-mode-note"><LockKeyhole /> {t.setup.invitationNote}</p>
            <button className="text-button" onClick={() => setStep("permissions")}>{t.setup.backPermissions}</button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
