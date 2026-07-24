import { Accessibility, Languages, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDemo, type Language } from "../state/DemoContext";
import { getMessages } from "../i18n";

export function Mark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M5 8 21 4v35L5 43V8Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="m43 8-16-4v35l16 4V8Z" fill="none" stroke="#16785a" strokeWidth="3" />
      <path d="M24 10v7m0 7v14" stroke="#315ff4" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Brand() {
  return <Link to="/" className="brand" aria-label="TrustMode home"><Mark /><span>TrustMode</span></Link>;
}

export function Header({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, toggleLarge, calm, toggleCalm } = useDemo();
  const t = getMessages(language);
  const [open, setOpen] = useState(false);
  const labels: Record<Language, string> = { en: "English", hi: "हिन्दी", or: "ଓଡ଼ିଆ" };
  return (
    <header className={`site-header ${compact ? "site-header--compact" : ""}`}>
      <Brand />
      <button className="icon-button mobile-menu" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "nav nav--open" : "nav"} aria-label="Main navigation">
        {!compact ? <>
          <Link to="/#how">{t.how}</Link>
          <Link to="/safety">{t.safety}</Link>
          <Link to="/accessibility">{t.accessibility}</Link>
        </> : null}
        <button
          className={calm ? "simple-view-toggle active" : "simple-view-toggle"}
          onClick={toggleCalm}
          aria-pressed={calm}
        >
          {calm ? t.simpleViewOn : t.simpleView}
        </button>
        <label className="language-control">
          <Languages size={18} aria-hidden="true" />
          <span className="sr-only">{t.languageLabel}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t.languageLabel}>
            {Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <button className="icon-button" onClick={toggleLarge} aria-label={t.largerText}><Accessibility /></button>
        {!compact ? <Link className="button button--small" to="/demo">{t.start}</Link> : null}
      </nav>
    </header>
  );
}
