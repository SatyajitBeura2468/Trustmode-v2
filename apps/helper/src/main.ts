import { scenarios } from "@trustmode/core";
import "./style.css";

const scenario = scenarios.scholarship;
const root = document.querySelector<HTMLElement>("#app")!;
root.innerHTML = `
  <header><div class="brand"><span>▱</span>TrustMode</div><strong>${scenario.title}</strong><em>Synthetic helper demo</em></header>
  <div class="layout">
    <aside><h2>Task brief</h2><p>${scenario.task}</p><h3>You can</h3><ul><li>See semantic fields</li><li>Use derived facts</li><li>Prepare proposals</li></ul><h3>You cannot</h3><ul class="cannot"><li>See private documents</li><li>Edit the owner's form</li><li>Submit the application</li></ul></aside>
    <section><p class="label">Ghost Workspace</p><h1>Prepare the task.<br>Never take control.</h1><div class="privacy">Private values are replaced with safe, purpose-bound facts.</div>
      <div class="fields">${scenario.proposals.map((p) => `<button data-id="${p.id}"><span><small>${p.label}</small><b>${p.proposed}</b></span><span><small>Evidence</small>${p.evidence}</span><i>Add proposal →</i></button>`).join("")}</div>
    </section>
    <aside class="queue"><h2>Proposal queue</h2><div id="queue"><p>Choose a semantic field to prepare a proposal.</p></div><button id="send" disabled>Send for owner review</button><div class="boundary"><b>Owner-only boundary</b><span>Submit application</span><small>This action is unavailable.</small></div></aside>
  </div>`;

const selected = new Set<string>();
const queue = document.querySelector<HTMLElement>("#queue")!;
const send = document.querySelector<HTMLButtonElement>("#send")!;
document.querySelectorAll<HTMLButtonElement>("[data-id]").forEach((button) => button.addEventListener("click", () => {
  selected.add(button.dataset.id!);
  button.classList.add("selected");
  const items = scenario.proposals.filter((p) => selected.has(p.id));
  queue.innerHTML = items.map((p) => `<article><b>${p.statement}</b><small>${Math.round(p.confidence * 100)}% confidence · ${p.evidence}</small></article>`).join("");
  send.disabled = false;
}));
send.addEventListener("click", () => {
  send.textContent = "Waiting for owner…";
  send.disabled = true;
  new BroadcastChannel("trustmode-demo").postMessage({ type: "proposals-ready", ids: [...selected] });
});
