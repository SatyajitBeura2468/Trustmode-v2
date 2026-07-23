chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    trustmodeExtensionState: {
      version: 2,
      status: "ready",
      approved: 0,
      events: [],
    },
  });
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => undefined);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return false;
  if (message.type === "TRUSTMODE_STATUS") {
    chrome.storage.local.get(["trustmodeExtensionState"]).then(({ trustmodeExtensionState }) => {
      sendResponse(trustmodeExtensionState ?? { version: 2, status: "ready", approved: 0, events: [] });
    });
    return true;
  }
  return false;
});
