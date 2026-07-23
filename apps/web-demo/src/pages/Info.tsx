import { ArrowRight, CheckCircle2, Eye, Keyboard, Languages, ShieldCheck, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "../components/Brand";
import { useDemo } from "../state/DemoContext";

export function InfoPage({ type }: { type: "safety" | "accessibility" | "practice" }) {
  const demo = useDemo();
  const content = {
    safety: {
      title: "Safety is the operating model.",
      lead: "TrustMode separates preparation from execution, reveals only what is needed, and keeps consequential actions owner-only.",
      items: [["Proposal, not control", "Helpers prepare meaning-based actions. They never receive the live account."], ["Private by structure", "Derived facts replace raw values and documents whenever possible."], ["Consequences first", "The owner sees where data goes, what changes, and whether it is reversible."], ["Stop means stop", "Emergency stop revokes the invitation and invalidates every pending proposal."]],
    },
    accessibility: {
      title: "Clear enough for a first time.",
      lead: "The visible journey stays simple while policy, privacy, and validation work underneath.",
      items: [["One decision at a time", "Mobile review focuses on one proposal with plain before-and-after language."], ["Larger and clearer", "Text, spacing, and contrast can increase without losing content."], ["Language choice", "Core demo navigation supports English, Hindi, and Odia."], ["Keyboard and voice", "Every action remains keyboard accessible; voice is optional and never final authority."]],
    },
    practice: {
      title: "Practice without consequences.",
      lead: "Explore a fully synthetic workflow and learn how proposal-based help feels before using any future real service.",
      items: [["Safe fictional data", "No real person, account, document, payment, or submission is involved."], ["Try dangerous actions", "See how owner-only and intent-drift rules block unsafe requests."], ["Pause and recover", "Interrupt the session and confirm nothing continues in the background."], ["Read the receipt", "Finish with a plain-language record of actions, disclosures, and blocks."]],
    },
  }[type];
  const icons = [ShieldCheck, Eye, Keyboard, Languages];
  return <><Header /><main id="main" className="info-page"><p className="quiet-label">{type}</p><h1>{content.title}</h1><p className="lead">{content.lead}</p><div className="info-list">{content.items.map(([title, body], index) => { const Icon = icons[index]; return <article key={title}><Icon /><span><h2>{title}</h2><p>{body}</p></span><CheckCircle2 /></article>; })}</div>{type === "accessibility" ? <div className="access-controls"><button onClick={demo.toggleLarge}><Volume2 />Larger and Clearer</button><button onClick={demo.toggleContrast}><Eye />High contrast</button><button onClick={demo.toggleCalm}><Keyboard />Calm Mode</button></div> : null}<Link className="button button--large" to="/demo">Open the safe demo <ArrowRight /></Link></main></>;
}
