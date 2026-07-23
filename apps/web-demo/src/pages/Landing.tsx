import { ArrowRight, Check, FileCheck2, GraduationCap, HeartPulse, School, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Mark } from "../components/Brand";
import { scenarioList } from "@trustmode/core";
import { useDemo } from "../state/DemoContext";
import { getMessages } from "../i18n";

const icons = { scholarship: GraduationCap, hospital: HeartPulse, admission: School };

function ProductTableau() {
  return (
    <div className="tableau" aria-label="A proposal moves safely from helper to owner">
      <section className="tableau-side tableau-helper">
        <UserRound aria-hidden="true" />
        <strong>HELPER</strong>
        <p>Prepares the task<br />in a Ghost Workspace</p>
        <div className="mini-form">
          <span>College admission</span>
          <i />
          <div><FileCheck2 /><span>Education details</span><Check /></div>
          <div><FileCheck2 /><span>Documents</span><Check /></div>
          <div className="mini-muted"><span>Payment info</span><small>Owner only</small></div>
        </div>
      </section>
      <div className="passage">
        <span>proposal<br />packet</span>
        <div className="packet"><FileCheck2 /><b>3 safe details</b><small>Ready for review</small></div>
        <ArrowRight />
      </div>
      <section className="tableau-side tableau-owner">
        <UserRound aria-hidden="true" />
        <strong>OWNER</strong>
        <p>Reviews, decides,<br />and applies</p>
        <div className="mini-review">
          <b>Review proposal</b>
          <div><span>Education details</span><ArrowRight /></div>
          <div><span>Documents</span><ArrowRight /></div>
          <p><Check /> You make the final call.</p>
          <button tabIndex={-1}>Approve & continue</button>
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
          <div className="section-intro">
            <h2>How it works<br />in 3 simple steps.</h2>
          </div>
          {[
            ["1", "Helper prepares", "Your helper works with safe structure and derived facts—not your private account.", "helper"],
            ["2", "TrustMode checks", "Every proposal is checked for purpose, privacy, risk, and consequence.", "checks"],
            ["3", "You decide", "Review what changes, what stays private, and apply only what you approve.", "owner"],
          ].map(([number, title, body, tone]) => (
            <article className={`step step--${tone}`} key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </section>

        <section className="scenarios">
          <div className="section-intro">
            <h2>Common moments<br />where help matters.</h2>
            <p>Explore the same safety model across three fictional services.</p>
          </div>
          <div className="scenario-rail">
            {scenarioList.map((scenario) => {
              const Icon = icons[scenario.id];
              return (
                <Link key={scenario.id} to={`/demo/${scenario.id}`} className={`scenario scenario--${scenario.id}`}>
                  <Icon />
                  <span><strong>{scenario.shortTitle}</strong><small>{scenario.description}</small></span>
                  <ArrowRight />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="manifesto">
          <Mark size={64} />
          <blockquote>“The helper may prepare the task, but never receives custody of the account or authority to execute it.”</blockquote>
          <Link className="button button--light" to="/safety">Explore the safety model <ArrowRight /></Link>
        </section>
      </main>
      <footer><BrandFooter /></footer>
    </>
  );
}

function BrandFooter() {
  return <div className="footer-inner"><div className="footer-brand"><Mark /><strong>TrustMode</strong></div><p>Concept prototype · Synthetic data only · Not for real sensitive accounts</p><span>© 2026 Satyajit Beura</span></div>;
}
