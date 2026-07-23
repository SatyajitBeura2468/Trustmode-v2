const CONTROLLED_PATH = /^\/portal\/(scholarship|hospital|admission)\/?$/;
const pathMatch = location.pathname.match(CONTROLLED_PATH);
const applied = new Map();

function controlledFields() {
  return [...document.querySelectorAll("[data-trustmode-field]")].filter(
    (node) => node instanceof HTMLInputElement,
  );
}

function context() {
  return {
    controlled: Boolean(pathMatch),
    scenario: pathMatch?.[1] ?? null,
    title: document.title,
    url: location.href,
    fields: controlledFields().map((input) => ({
      id: input.dataset.trustmodeField,
      value: input.value,
      label: input.closest("label")?.querySelector("span")?.firstChild?.textContent?.trim() ?? input.dataset.trustmodeField,
    })),
  };
}

function ensureRibbon() {
  let ribbon = document.querySelector("#trustmode-ribbon");
  if (ribbon) return ribbon;
  ribbon = document.createElement("div");
  ribbon.id = "trustmode-ribbon";
  ribbon.setAttribute("role", "status");
  Object.assign(ribbon.style, {
    position: "fixed",
    zIndex: "2147483647",
    top: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 14px",
    border: "1px solid #b9cafc",
    borderRadius: "9px",
    background: "#fff",
    color: "#142033",
    boxShadow: "0 8px 28px rgba(20,32,51,.15)",
    font: "600 13px system-ui,sans-serif",
  });
  ribbon.innerHTML = '<span data-dot style="width:9px;height:9px;border-radius:50%;background:#16785a"></span><strong>TrustMode</strong><span data-state style="color:#607086">Controlled portal connected</span>';
  document.documentElement.append(ribbon);
  return ribbon;
}

function setRibbon(state, color = "#16785a") {
  const ribbon = ensureRibbon();
  ribbon.querySelector("[data-state]").textContent = state;
  ribbon.querySelector("[data-dot]").style.background = color;
}

function applyField(field, expectedCurrent, value) {
  if (!pathMatch || typeof field !== "string" || typeof value !== "string") {
    return { ok: false, code: "TM-EXT-001", reason: "Malformed controlled action." };
  }
  const input = controlledFields().find((node) => node.dataset.trustmodeField === field);
  if (!input) return { ok: false, code: "TM-EXT-203", reason: "Target is not allowlisted on this portal." };
  if (input.value !== expectedCurrent && applied.get(field) !== input.value) {
    return { ok: false, code: "TM-EXT-304", reason: "Portal value changed after review." };
  }
  input.value = value;
  input.classList.add("changed");
  input.dataset.trustmodeApplied = "true";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  applied.set(field, value);
  setRibbon(`Owner applied ${field}`, "#16785a");
  return { ok: true, code: "TM-EXT-101", reason: "Owner-approved value applied to the controlled field." };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return false;
  if (message.type === "TRUSTMODE_GET_CONTEXT") {
    sendResponse(context());
    return false;
  }
  if (message.type === "TRUSTMODE_APPLY") {
    sendResponse(applyField(message.field, message.expectedCurrent, message.value));
    return false;
  }
  if (message.type === "TRUSTMODE_SESSION_STATE") {
    if (message.state === "stopped") setRibbon("Session stopped", "#b4343f");
    else if (message.state === "paused") setRibbon("Session paused", "#9d6200");
    else setRibbon("Session active", "#16785a");
    sendResponse({ ok: true });
    return false;
  }
  return false;
});

if (pathMatch) ensureRibbon();
