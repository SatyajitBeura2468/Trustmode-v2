import { ArrowRight, Check, FileCheck2, GraduationCap, HeartPulse, School, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Mark } from "../components/Brand";
import { scenarioList } from "@trustmode/core";
import { useDemo } from "../state/DemoContext";
import { getMessages, getScenarioCopy } from "../i18n";

const icons = { scholarship: GraduationCap, hospital: HeartPulse, admission: School };

function ProductTableau() {
  const { language } = useDemo();
  const t = getMessages(language).landing;
  return (
    <div className="tableau" aria-label={t.tableauAria}>
      <section className="tableau-side tableau-helper">
        <UserRound aria-hidden="true" />
        <strong>{t.helper}</strong>
        <p>{t.helperLead}</p>
        <div className="mini-form">
          <span>{getScenarioCopy(language, "admission").title}</span>
          <i />
          <div><FileCheck2 /><span>{getScenarioCopy(language, "admission").sectionTitle}</span><Check /></div>
          <div><FileCheck2 /><span>{getScenarioCopy(language, "admission").steps[2]}</span><Check /></div>
          <div className="mini-muted"><span>{t.privateExample}</span><small>{t.ownerOnly}</small></div>
        </div>
      </section>
      <div className="passage">
        <span>{t.suggestion}</span>
        <div className="packet"><FileCheck2 /><b>{t.suggestion}</b><small>{t.readyReview}</small></div>
        <ArrowRight />
      </div>
      <section className="tableau-side tableau-owner">
        <UserRound aria-hidden="true" />
        <strong>{t.owner}</strong>
        <p>{t.ownerLead}</p>
        <div className="mini-review">
          <b>{t.reviewSuggestion}</b>
          <div><span>{getScenarioCopy(language, "admission").sectionTitle}</span><ArrowRight /></div>
          <div><span>{getScenarioCopy(language, "admission").steps[2]}</span><ArrowRight /></div>
          <p><Check /> {t.finalCall}</p>
          <button tabIndex={-1}>{t.approveContinue}</button>
        </div>
      </section>
    </div>
  );
}

export function Landing() {
  const { language } = useDemo();
  const t = getMessages(language);
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <h1>{t.headline}</h1>
            <p>{t.support}</p>
            <div className="hero-actions">
              <Link className="button button--large" to="/demo">{t.tryDemo} <ArrowRight /></Link>
              <a className="text-link" href="#how">{t.seeHow} <ArrowRight /></a>
            </div>
            <p className="demo-note">{t.synthetic}</p>
          </div>
          <ProductTableau />
        </section>

        <section className="how" id="how">
          <div className="section-intro"><h2>{t.landing.howTitle}</h2></div>
          {t.landing.steps.map(([title, body], index) => (
            <article className={`step step--${index === 0 ? "helper" : index === 2 ? "owner" : "checks"}`} key={title}>
              <span>{index + 1}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </section>

        <section className="scenarios">
          <div className="section-intro">
            <h2>{t.landing.momentsTitle}</h2>
            <p>{t.landing.momentsLead}</p>
          </div>
          <div className="scenario-rail">
            {scenarioList.map((scenario) => {
              const Icon = icons[scenario.id];
              const copy = getScenarioCopy(language, scenario.id);
              return (
                <Link key={scenario.id} to={`/demo/${scenario.id}`} className={`scenario scenario--${scenario.id}`}>
                  <Icon />
                  <span><strong>{copy.shortTitle}</strong><small>{copy.description}</small></span>
                  <ArrowRight />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="manifesto">
          <Mark size={64} />
          <blockquote>“{t.landing.promise}”</blockquote>
          <Link className="button button--light" to="/safety">{t.landing.exploreSafety} <ArrowRight /></Link>
        </section>
      </main>
      <footer><BrandFooter /></footer>
    </>
  );
}

function BrandFooter() {
  const { language } = useDemo();
  const t = getMessages(language);
  return <div className="footer-inner"><div className="footer-brand"><Mark /><strong>TrustMode</strong></div><p>{t.landing.footer}</p><span>© 2026 Satyajit Beura</span></div>;
}
