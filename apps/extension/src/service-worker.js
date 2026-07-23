chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => undefined);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return false;
  if (message.type === "TRUSTMODE_STATUS") {
    chrome.storage.local.get(["trustmodeSession"]).then(({ trustmodeSession }) => sendResponse(trustmodeSession ?? { active: false }));
    return true;
  }
  return false;
});
