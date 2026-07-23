import {
  ArrowRight,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  KeyRound,
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
import { getMessages } from "../i18n";

const modeCopy: Record<AssistanceMode, [string, string]> = {
  guide: ["Guide Me", "The helper explains each step. You perform every action."],
  together: ["Do It With Me", "The helper prepares small groups. You approve progressively."],
  prepare: ["Prepare It For Me", "The helper prepares the complete safe packet before review."],
};

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
  const [step, setStep] = useState<"scenario" | "contract" | "invite">(
    () => params.scenario ? "contract" : "scenario",
  );
  const [task, setTask] = useState(demo.session.contract.task);
  const [copied, setCopied] = useState(false);
  const [interpreted, setInterpreted] = useState<ScenarioId | null>(null);
  const appliedRouteScenario = useRef<ScenarioId | null>(null);
  const t = getMessages(demo.language);
  const routeScenario = params.scenario && params.scenario in scenarios
    ? params.scenario as ScenarioId
    : null;
  const selected = routeScenario ?? demo.scenarioId;
  const sessionHealth = useMemo(
    () => demo.session.status === "active" ? "Capability ready" : `Session ${demo.session.status}`,
    [demo.session.status],
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
    setStep("contract");
    navigate(`/demo/${id}`, { replace: true });
  };

  const interpret = () => choose(inferScenario(task));

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(demo.helperUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };

  const continueOnDevice = () => {
    demo.joinHelper(demo.session.invite.token, demo.session.invite.verificationCode);
    demo.setStage("workspace");
    navigate(`/demo/${selected}/session`);
  };

  return (
    <div className="demo-setup">
      <Header compact />
      <main id="main" className="setup-main">
        <div className="setup-progress" aria-label="Setup progress">
          {["Choose task", "Set boundaries", "Invite helper"].map((label, index) => {
            const current = step === "scenario" ? 0 : step === "contract" ? 1 : 2;
            return <span className={index <= current ? "active" : ""} key={label}><i>{index + 1}</i>{label}</span>;
          })}
        </div>

        {step === "scenario" ? (
          <section className="setup-panel">
            <p className="quiet-label">Start a controlled help session</p>
            <h1>{t.chooseTask}</h1>
            <p className="lead">{t.chooseLead}</p>
            <div className="task-composer">
              <label className="sr-only" htmlFor="task-description">Describe the task</label>
              <textarea
                id="task-description"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder="For example: Help me prepare my scholarship application."
              />
              <div>
                <span className="composer-privacy"><LockKeyhole /> Do not enter private values.</span>
                <button className="button" onClick={interpret} disabled={task.trim().length < 12}>
                  <Sparkles /> Interpret task <ArrowRight />
                </button>
              </div>
            </div>
            {interpreted ? <div className="interpretation-result" role="status">
              <Check />
              <span><b>Task matched to {scenarios[interpreted].shortTitle}</b> You can change this before creating the contract.</span>
            </div> : null}
            <div className="scenario-choice" aria-label="Controlled workflow templates">
              {scenarioList.map((scenario) => (
                <button key={scenario.id} onClick={() => choose(scenario.id)}>
                  <span style={{ background: scenario.accent }} />
                  <b>{scenario.shortTitle}</b>
                  <small>{scenario.description}</small>
                  <ArrowRight />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === "contract" ? (
          <section className="setup-panel contract">
            <div className="contract-heading">
              <div>
                <p className="quiet-label">Intent Contract</p>
                <h1>Clear boundaries before help begins.</h1>
                <p className="lead">For: <strong>{scenarios[selected].title}</strong>. Every proposal is checked against this contract.</p>
              </div>
              <aside>
                <ShieldCheck />
                <span><small>Contract</small><b>{demo.session.contract.id}</b></span>
                <em>Enforced locally</em>
              </aside>
            </div>
            <div className="mode-picker" role="radiogroup" aria-label="Assistance mode">
              {(Object.entries(modeCopy) as [AssistanceMode, [string, string]][]).map(([mode, copy]) => (
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
              <div><h2><Check /> The helper may</h2><ul><li>See allowlisted semantic fields</li><li>Use purpose-bound derived facts</li><li>Prepare reversible proposals</li><li>Ask for clarification</li></ul></div>
              <div><h2><X /> The helper may not</h2><ul><li>See credentials, OTPs, or raw documents</li><li>Change account recovery or payment details</li><li>Write directly to the controlled portal</li><li>Submit or perform irreversible actions</li></ul></div>
            </div>
            <div className="contract-proof">
              <KeyRound />
              <span><b>Owner authority is structural.</b> Unknown targets, stale values, sensitive intents, and final actions fail closed before review.</span>
              <strong>6 checks / proposal</strong>
            </div>
            <div className="setup-actions">
              <button className="text-button" onClick={() => setStep("scenario")}>Back</button>
              <button className="button button--large" onClick={() => { demo.setStage("invite"); setStep("invite"); }}>
                Create temporary capability <ArrowRight />
              </button>
            </div>
          </section>
        ) : null}

        {step === "invite" ? (
          <section className="setup-panel invite">
            <div className="invite-icon"><Link2 /></div>
            <p className="quiet-label">Temporary capability</p>
            <h1>Invite someone you trust.</h1>
            <p className="lead">The link opens only the Ghost Workspace for this contract. It cannot reveal owner data or execute changes.</p>
            <div className="invite-health">
              <span><i />{sessionHealth}</span>
              <span><Clock3 /> Expires in {formatDuration(demo.remainingSeconds)}</span>
              <span><ShieldCheck /> One verified helper</span>
            </div>
            <div className="invite-code">
              <span>{demo.helperUrl}</span>
              <button onClick={copyInvite}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}</button>
            </div>
            <div className="verification">
              <span>Verification code</span>
              <strong>{demo.session.invite.verificationCode}</strong>
              <small>Share this code separately from the link.</small>
            </div>
            <div className="invite-paths">
              <button className="button button--outline" onClick={() => window.open(demo.helperUrl, "_blank", "noopener,noreferrer")}>
                Open helper workspace <ExternalLink />
              </button>
              <button className="button button--large" onClick={continueOnDevice}>
                Continue on this device <ArrowRight />
              </button>
            </div>
            <p className="local-mode-note"><LockKeyhole /> Controlled-local mode synchronises same-origin tabs. No collaboration server receives the session.</p>
            <button className="text-button" onClick={() => setStep("contract")}>Back to boundaries</button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
