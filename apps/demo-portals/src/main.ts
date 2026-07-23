import { scenarioList, scenarios, type ScenarioId } from "@trustmode/core";
import "./style.css";
const root = document.querySelector<HTMLElement>("#app")!;
let active: ScenarioId = "scholarship";
const render = () => {
  const s = scenarios[active];
  root.innerHTML = `<header><b>TrustMode controlled portals</b><span>Fictional service · synthetic data only</span></header><nav>${scenarioList.map(x=>`<button data-scenario="${x.id}" class="${x.id===active?"active":""}">${x.shortTitle}</button>`).join("")}</nav><section><p>Controlled demo portal</p><h1>${s.title}</h1><div class="notice">Only changes approved by the owner appear here.</div><form>${s.proposals.map(p=>`<label>${p.label}<input data-field="${p.id}" value="${p.current}" readonly></label>`).join("")}<button type="button" id="submit">Submit application <small>Owner only</small></button></form><aside id="status">Nothing has changed yet.</aside></section>`;
  root.querySelectorAll<HTMLButtonElement>("[data-scenario]").forEach(b=>b.onclick=()=>{active=b.dataset.scenario as ScenarioId;render()});
  root.querySelector<HTMLButtonElement>("#submit")!.onclick=()=>root.querySelector<HTMLElement>("#status")!.innerHTML="<b>Owner confirmation required.</b> TrustMode will never submit this demo automatically.";
};
render();
new BroadcastChannel("trustmode-demo").addEventListener("message", (event) => {
  if (event.data?.type !== "apply" || event.data.scenario !== active) return;
  const field = root.querySelector<HTMLInputElement>(`[data-field="${event.data.id}"]`);
  if (field) { field.value = String(event.data.value); field.classList.add("changed"); }
});
