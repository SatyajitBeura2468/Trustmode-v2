const steps = [
  { title: "What do you need help with?", body: '<label>Task<textarea id="task">Help me complete this scholarship application.</textarea></label><button class="primary" data-next>Interpret task →</button>' },
  { title: "Set clear boundaries.", body: '<p class="safe">The helper may prepare education details and propose document types.</p><p class="blocked">The helper may not see passwords, OTPs, full identity values, make payments, or submit.</p><button class="primary" data-next>Start Safe Help →</button>' },
  { title: "Invite someone you trust.", body: '<div class="code"><span>Temporary demo link</span><b>TM-DEMO-2048</b><small>Expires in 30 minutes · one helper</small></div><button class="primary" data-next>Helper joined →</button>' },
  { title: "Priya prepared 3 details.", body: '<p>Nothing has changed yet.</p><article><small>PROPOSAL 1 OF 3</small><h2>Select CBSE as the applicant’s board</h2><p>From: Class 10 certificate · verified</p><div class="privacy">Your complete document stays hidden.</div><button class="approve" data-approve>Approve and apply</button><button data-next>Skip</button></article>' },
  { title: "Your receipt is ready.", body: '<div class="receipt"><b>1 owner-approved change</b><p>Submit application was blocked.</p><p>No passwords, OTPs, or raw documents were shared.</p></div><button class="primary" data-restart>Start another practice</button>' }
];
let index = 0;
let approved = 0;
let paused = false;
let stopped = false;
const app = document.querySelector("#app");
const state = document.querySelector("#state");
const sync = () => chrome.storage.local.set({ trustmodeSession: { active: !stopped, paused, stopped, approved } });
const render = () => {
  const step = steps[index];
  app.innerHTML = `<p class="step">STEP ${index + 1} OF ${steps.length}</p><h1>${step.title}</h1>${step.body}`;
  app.querySelector("[data-next]")?.addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); render(); });
  app.querySelector("[data-approve]")?.addEventListener("click", () => { approved += 1; index = steps.length - 1; sync(); render(); });
  app.querySelector("[data-restart]")?.addEventListener("click", () => { index = 0; approved = 0; stopped = false; sync(); render(); });
};
document.querySelector("#pause").addEventListener("click", (event) => { if (stopped) return; paused = !paused; event.currentTarget.textContent = paused ? "▶ Resume" : "Ⅱ Pause"; state.textContent = paused ? "Paused" : "Active"; sync(); });
document.querySelector("#stop").addEventListener("click", () => {
  if (!confirm("Stop and revoke this session? Pending proposals will be discarded.")) return;
  stopped = true; state.textContent = "Stopped"; app.innerHTML = '<p class="step danger">SESSION REVOKED</p><h1>You are back in control.</h1><p>Invitation revoked. Nothing else changed.</p><button class="primary" id="restart">Start fresh practice</button>';
  document.querySelector("#restart").addEventListener("click", () => { index = 0; stopped = false; sync(); render(); }); sync();
});
sync(); render();
