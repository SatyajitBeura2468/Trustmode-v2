import { ArrowRight, Clock3, KeyRound, LockKeyhole, ShieldCheck, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";
import { HelperTask } from "../components/SharedTask";
import { getMessages, getScenarioCopy } from "../i18n";

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
  const [name, setName] = useState("");
  const [loadingInvitation, setLoadingInvitation] = useState(Boolean(sessionId && token));
  const [invitationLoaded, setInvitationLoaded] = useState(false);
  const t = getMessages(demo.language);
  const scenarioCopy = getScenarioCopy(demo.language, demo.scenarioId);

  useEffect(() => {
    let active = true;
    if (!sessionId || !token) {
      setLoadingInvitation(false);
      return () => { active = false; };
    }
    void openHelperSession(sessionId, token).then((loaded) => {
      if (active) {
        setInvitationLoaded(loaded);
        setLoadingInvitation(false);
      }
    });
    return () => { active = false; };
  }, [openHelperSession, sessionId, token]);

  const matchesSession = sessionId === demo.session.id && token === demo.session.invite.token;
  const joined = matchesSession && invitationLoaded && demo.helperVerified;
  const cleanName = name.trim().replace(/\s+/g, " ");

  const verify = async () => {
    if (await demo.verifyHelperCapability(token, code, cleanName)) {
      setCode("");
      setName("");
    }
  };

  if (loadingInvitation) {
    return <div className="helper-shell"><Header compact /><main className="helper-invalid" id="main" aria-live="polite">
      <ShieldCheck />
      <p className="quiet-label">{t.helper.loadingLabel}</p>
      <h1>{t.helper.loadingTitle}</h1>
      <p>{t.helper.loadingBody}</p>
    </main></div>;
  }

  if (!matchesSession || !invitationLoaded) {
    return <div className="helper-shell"><Header compact /><main className="helper-invalid" id="main">
      <WifiOff />
      <p className="quiet-label quiet-label--danger">{t.helper.unavailableLabel}</p>
      <h1>{t.helper.unavailableTitle}</h1>
      <p>{t.helper.unavailableBody}</p>
    </main></div>;
  }

  if (!joined) {
    return <div className="helper-shell"><Header compact /><main className="helper-verify" id="main">
      <div className="helper-verify-mark"><KeyRound /></div>
      <p className="quiet-label">{t.helper.verifyLabel}</p>
      <h1>{t.helper.verifyTitle}</h1>
      <p className="lead">{t.helper.verifyLead}</p>
      <div className="helper-join-summary">
        <span><ShieldCheck /><b>{scenarioCopy.title}</b><small>{demo.session.contract.task}</small></span>
        <span><Clock3 /><b>{formatDuration(demo.remainingSeconds)}</b><small>{t.helper.remaining}</small></span>
        <span><LockKeyhole /><b>{t.helper.noAccount}</b><small>{t.helper.suggestionsOnly}</small></span>
      </div>
      <label className="verification-input helper-name-input">
        <span>{t.helper.nameLabel}</span>
        <input
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t.helper.namePlaceholder}
        />
      </label>
      <label className="verification-input">
        <span>{t.helper.codeLabel}</span>
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
      <button className="button button--large" onClick={() => void verify()} disabled={code.length !== 6 || cleanName.length < 2}>
        {t.helper.enter} <ArrowRight />
      </button>
    </main></div>;
  }

  return <HelperTask />;
}
