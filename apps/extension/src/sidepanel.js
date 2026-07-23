const proposals = {
  scholarship: [
    { id: "board", label: "Board", value: "CBSE", statement: "Select CBSE as the applicant’s board", evidence: "Class 10 certificate · verified" },
    { id: "passing-year", label: "Passing year", value: "2023", statement: "Set the applicant’s passing year to 2023", evidence: "Class 10 certificate · verified" },
    { id: "institution", label: "Institution", value: "Sunrise Public School", statement: "Set the institution to Sunrise Public School", evidence: "School record · verified" },
  ],
  hospital: [
    { id: "department", label: "Department", value: "General medicine", statement: "Select General medicine as the department", evidence: "Referral category · verified" },
    { id: "visit-type", label: "Visit type", value: "First consultation", statement: "Set visit type to First consultation", evidence: "Registration history · derived" },
    { id: "language", label: "Preferred language", value: "Odia", statement: "Request Odia language support", evidence: "Owner preference" },
  ],
  admission: [
    { id: "programme", label: "Programme", value: "B.Sc. Physics", statement: "Select B.Sc. Physics as the programme", evidence: "Course preference" },
    { id: "board", label: "Qualifying board", value: "CHSE Odisha", statement: "Set qualifying board to CHSE Odisha", evidence: "Class 12 certificate · verified" },
    { id: "hostel", label: "Hostel preference", value: "Interested", statement: "Mark hostel preference as Interested", evidence: "Owner preference" },
  ],
};

const app = document.querySelector("#app");
const connection = document.querySelector("#connection");
const pauseButton = document.querySelector("#pause");
const stopButton = document.querySelector("#stop");
let tabId = null;
let portal = null;
let selectedId = null;
let state = { version: 2, status: "ready", approved: 0, events: [] };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

async function saveState() {
  await chrome.storage.local.set({ trustmodeExtensionState: state });
}

async function sendToPortal(message) {
  if (!tabId) return null;
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    return null;
  }
}

function event(type, summary) {
  state.events = [...state.events, { id: crypto.randomUUID(), at: new Date().toISOString(), type, summary }].slice(-50);
}

function renderDisconnected() {
  connection.textContent = "No portal";
  connection.dataset.state = "offline";
  pauseButton.disabled = true;
  stopButton.disabled = true;
  app.innerHTML = `
    <section class="empty">
      <div class="empty-mark">⌁</div>
      <p class="eyebrow">Controlled surface required</p>
      <h1>Open a TrustMode portal to begin.</h1>
      <p>The extension runs only on the allowlisted synthetic portal. It cannot read arbitrary websites.</p>
      <a class="primary" href="https://trustmode-v2.vercel.app/portal/scholarship" target="_blank">Open controlled portal →</a>
    </section>`;
}

function renderList() {
  const available = proposals[portal.scenario] ?? [];
  connection.textContent = state.status === "paused" ? "Paused" : "Connected";
  connection.dataset.state = state.status;
  pauseButton.disabled = state.status === "stopped";
  stopButton.disabled = state.status === "stopped";
  pauseButton.innerHTML = state.status === "paused" ? "▶ <span>Resume</span>" : "Ⅱ <span>Pause</span>";
  app.innerHTML = `
    <section class="panel-heading">
      <p class="eyebrow">Owner review</p>
      <h1>${escapeHtml(portal.scenario)} application</h1>
      <div class="health"><i></i><span><b>Controlled portal connected</b><small>${portal.fields.length} allowlisted fields</small></span></div>
    </section>
    <section class="boundary"><b>Nothing changes without your approval.</b><p>Review one semantic proposal at a time. Credentials, OTPs, payments, recovery, and submission are unavailable.</p></section>
    <section class="proposal-list">
      <header><b>Prepared proposals</b><span>${state.approved} applied</span></header>
      ${available.map((proposal, index) => {
        const field = portal.fields.find((item) => item.id === proposal.id);
        return `<button data-proposal="${proposal.id}">
          <span>${index + 1}</span>
          <b>${escapeHtml(proposal.statement)}</b>
          <small>${escapeHtml(field?.value ?? "Unavailable")} → ${escapeHtml(proposal.value)}</small>
          <em>Review →</em>
        </button>`;
      }).join("")}
    </section>
    <button class="owner-only" id="submit-block"><small>OWNER-ONLY · BLOCKED</small><b>Submit application</b><span>TrustMode cannot execute this action.</span></button>
    <details class="activity"><summary>Activity log <b>${state.events.length}</b></summary>${state.events.slice().reverse().map((item) => `<p><small>${new Date(item.at).toLocaleTimeString()}</small>${escapeHtml(item.summary)}</p>`).join("") || "<p>No actions yet.</p>"}</details>`;
  app.querySelectorAll("[data-proposal]").forEach((button) => button.addEventListener("click", () => {
    selectedId = button.dataset.proposal;
    renderReview();
  }));
  app.querySelector("#submit-block")?.addEventListener("click", () => {
    event("BLOCKED", "Final submission denied by owner-only policy.");
    saveState();
    renderBlocked();
  });
}

function renderReview() {
  const proposal = (proposals[portal.scenario] ?? []).find((item) => item.id === selectedId);
  const field = portal.fields.find((item) => item.id === selectedId);
  if (!proposal || !field) return renderList();
  app.innerHTML = `
    <button class="back" id="back">← All proposals</button>
    <section class="review">
      <p class="eyebrow">Current proposal</p>
      <h1>${escapeHtml(proposal.statement)}</h1>
      <p>${escapeHtml(proposal.evidence)}</p>
      <div class="diff"><span><small>Before</small><b>${escapeHtml(field.value)}</b></span><i>→</i><span><small>After</small><b>${escapeHtml(proposal.value)}</b></span></div>
      <div class="checks"><header><b>Policy check</b><strong>Pass · TM-EXT-101</strong></header>
        <span>✓ Controlled target</span><span>✓ Current value fresh</span><span>✓ Reversible change</span>
        <span>✓ No sensitive intent</span><span>✓ Owner approval required</span><span>✓ Payload complete</span>
      </div>
      <div class="privacy"><b>Your private data stays hidden.</b><p>Only this synthetic field value is applied to the controlled portal.</p></div>
      <button class="approve" id="approve">Approve and apply</button>
      <button id="reject">Reject proposal</button>
    </section>`;
  app.querySelector("#back").addEventListener("click", renderList);
  app.querySelector("#reject").addEventListener("click", () => {
    event("REJECTED", proposal.statement);
    saveState();
    renderList();
  });
  app.querySelector("#approve").addEventListener("click", async () => {
    const result = await sendToPortal({
      type: "TRUSTMODE_APPLY",
      field: proposal.id,
      expectedCurrent: field.value,
      value: proposal.value,
    });
    if (!result?.ok) {
      app.querySelector(".review").insertAdjacentHTML("beforeend", `<p class="error">${escapeHtml(result?.reason ?? "Portal connection was lost.")}</p>`);
      return;
    }
    state.approved += 1;
    event("APPLIED", `${proposal.statement} · ${result.code}`);
    await saveState();
    portal = await sendToPortal({ type: "TRUSTMODE_GET_CONTEXT" });
    renderList();
  });
}

function renderBlocked() {
  app.innerHTML = `<section class="empty blocked"><div class="empty-mark">×</div><p class="eyebrow">TM-EXT-506 · Action blocked</p><h1>Submission stays with you.</h1><p>The extension refused the final action. No application, payment, or account operation occurred.</p><button class="primary" id="return">Return to safe review →</button></section>`;
  app.querySelector("#return").addEventListener("click", renderList);
}

async function setSessionStatus(next) {
  state.status = next;
  event(next.toUpperCase(), `Owner set extension session to ${next}.`);
  await saveState();
  await sendToPortal({ type: "TRUSTMODE_SESSION_STATE", state: next });
  renderList();
}

pauseButton.addEventListener("click", () => setSessionStatus(state.status === "paused" ? "active" : "paused"));
stopButton.addEventListener("click", async () => {
  if (!confirm("Stop this extension session? The controlled portal will remain unchanged.")) return;
  await setSessionStatus("stopped");
});

async function initialize() {
  const stored = await chrome.storage.local.get(["trustmodeExtensionState"]);
  if (stored.trustmodeExtensionState?.version === 2) state = stored.trustmodeExtensionState;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id ?? null;
  portal = await sendToPortal({ type: "TRUSTMODE_GET_CONTEXT" });
  if (!portal?.controlled) return renderDisconnected();
  renderList();
}

initialize();
