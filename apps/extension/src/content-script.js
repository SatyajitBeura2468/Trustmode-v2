if (!document.querySelector("#trustmode-ribbon")) {
  const ribbon = document.createElement("div");
  ribbon.id = "trustmode-ribbon";
  ribbon.setAttribute("role", "status");
  Object.assign(ribbon.style, {
    position: "fixed", zIndex: "2147483647", top: "12px", left: "50%", transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", border: "1px solid #b9cafc",
    borderRadius: "9px", background: "#fff", color: "#142033", boxShadow: "0 8px 28px rgba(20,32,51,.15)",
    font: "600 13px system-ui,sans-serif"
  });
  ribbon.innerHTML = '<span style="width:9px;height:9px;border-radius:50%;background:#16785a"></span><strong>TrustMode</strong><span style="color:#607086">Nothing has changed yet</span>';
  document.documentElement.append(ribbon);
  chrome.storage.onChanged.addListener((changes) => {
    const session = changes.trustmodeSession?.newValue;
    if (!session) return;
    ribbon.lastElementChild.textContent = session.stopped ? "Session stopped" : session.paused ? "Session paused" : `${session.approved || 0} owner-approved changes`;
    ribbon.firstElementChild.style.background = session.stopped ? "#b4343f" : session.paused ? "#9d6200" : "#16785a";
  });
}
