// start snip by clicking on extension icon // @ts-ignore
chrome.action.onClicked.addListener(async (tab) => {
    try {
        /*await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ["contentScript.js"]
        });*/
        // tell content script to start selection mode
        chrome.tabs.sendMessage(tab.id!, { type: "START_SNIP" });
    } catch (e) {
        console.error("Injection failed:", e);
    }
});

// service worker makes screenshot of visible area
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "CAPTURE") {
        const windowId = sender?.tab?.windowId;
        chrome.tabs.captureVisibleTab(
            windowId!,
            { format: "png" },
            (dataUrl) => { // @ts-ignore
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    sendResponse({ ok: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ ok: true, dataUrl });
                }
            }
        );
        return true; // leave port open for async response
    }

    //
    if (msg?.type === "DOWNLOAD" && msg.dataUrl) {
        chrome.downloads.download(
            { url: msg.dataUrl, filename: "snip.png", saveAs: true },
            (id) => { // @ts-ignore
                if (chrome.runtime.lastError) {
                    sendResponse({ ok: false, error: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ ok: true, id });
                }
            }
        );
        return true;
    }
});
