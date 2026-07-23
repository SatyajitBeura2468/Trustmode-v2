import { ArrowRight, Check, Clock3, Copy, Link2, Mic, ShieldCheck, Upload, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { scenarioList, scenarios, type AssistanceMode, type ScenarioId } from "@trustmode/core";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";
import { getMessages } from "../i18n";

const modeCopy: Record<AssistanceMode, [string, string]> = {
  guide: ["Guide Me", "The helper explains each step. You perform every action."],
  together: ["Do It With Me", "The helper prepares small groups. You approve progressively."],
  prepare: ["Prepare It For Me", "The helper prepares the safe task. You review before anything changes."],
};

export function DemoStart() {
  const params = useParams();
  const navigate = useNavigate();
  const demo = useDemo();
  const [step, setStep] = useState<"scenario" | "contract" | "invite">(() => params.scenario ? "contract" : "scenario");
  const [copied, setCopied] = useState(false);
  const t = getMessages(demo.language);
  const selected = params.scenario && params.scenario in scenarios ? params.scenario as ScenarioId : demo.scenarioId;

  const choose = (id: ScenarioId) => {
    demo.setScenario(id);
    setStep("contract");
    navigate(`/demo/${id}`, { replace: true });
  };
  const copyInvite = async () => {
    await navigator.clipboard?.writeText(`${location.origin}/helper?invite=TM-DEMO-2048`);
    setCopied(true);
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
            <p className="quiet-label">Start a safe help session</p>
            <h1>{t.chooseTask}</h1>
            <p className="lead">{t.chooseLead}</p>
            <div className="task-composer">
              <textarea defaultValue="Help me complete this scholarship application." aria-label="Describe the task" />
              <div><button className="icon-button" title="Voice input demo"><Mic /></button><button className="icon-button" title="Upload instructions demo"><Upload /></button><button className="button" onClick={() => choose("scholarship")}>Interpret task <ArrowRight /></button></div>
            </div>
            <div className="scenario-choice">
              {scenarioList.map((scenario) => <button key={scenario.id} onClick={() => choose(scenario.id)}><span style={{ background: scenario.accent }} /><b>{scenario.shortTitle}</b><small>{scenario.description}</small><ArrowRight /></button>)}
            </div>
          </section>
        ) : null}

        {step === "contract" ? (
          <section className="setup-panel contract">
            <p className="quiet-label">Intent Contract</p>
            <h1>Clear boundaries before help begins.</h1>
            <p className="lead">For: <strong>{scenarios[selected].title}</strong>. You can change these boundaries later.</p>
            <div className="mode-picker" role="radiogroup" aria-label="Assistance mode">
              {(Object.entries(modeCopy) as [AssistanceMode, [string, string]][]).map(([mode, copy]) => (
                <button role="radio" aria-checked={demo.mode === mode} className={demo.mode === mode ? "selected" : ""} onClick={() => demo.setMode(mode)} key={mode}>
                  <span>{demo.mode === mode ? <Check /> : null}</span><b>{copy[0]}</b><small>{copy[1]}</small>
                </button>
              ))}
            </div>
            <div className="contract-columns">
              <div><h2><Check /> The helper may</h2><ul><li>Prepare relevant form details</li><li>Use safe derived facts</li><li>Propose document types</li><li>Ask you for clarification</li></ul></div>
              <div><h2><X /> The helper may not</h2><ul><li>See passwords, OTPs, or full identity values</li><li>Download private documents</li><li>Change recovery or payment details</li><li>Submit the application</li></ul></div>
            </div>
            <div className="setup-actions"><button className="text-button" onClick={() => setStep("scenario")}>Back</button><button className="button button--large" onClick={() => { demo.setStage("invite"); setStep("invite"); }}>Start Safe Help <ArrowRight /></button></div>
          </section>
        ) : null}

        {step === "invite" ? (
          <section className="setup-panel invite">
            <div className="invite-icon"><Link2 /></div>
            <p className="quiet-label">Temporary invitation</p>
            <h1>Invite someone you trust.</h1>
            <p className="lead">This synthetic link opens only the Ghost Workspace. It expires after this demo session.</p>
            <div className="invite-code"><span>{location.origin}/helper?invite=TM-DEMO-2048</span><button onClick={copyInvite}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}</button></div>
            <div className="invite-facts"><span><Clock3 /> Expires in 30 minutes</span><span><ShieldCheck /> One helper only</span><span><ShieldCheck /> No account access</span></div>
            <div className="verification"><span>Verification code</span><strong>2048</strong><small>Tell this code to your helper separately.</small></div>
            <div className="setup-actions"><button className="text-button" onClick={() => setStep("contract")}>Back</button><button className="button button--large" onClick={() => { demo.setStage("workspace"); navigate(`/demo/${selected}/session`); }}>Open live demo <ArrowRight /></button></div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
