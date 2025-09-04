// start snip by clicking on extension icon // @ts-ignore
/*
chrome.action.onClicked.addListener(async (tab) => {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ["contentScript.js"]
        });
        // tell content script to start selection mode
        chrome.tabs.sendMessage(tab.id!, { type: "START_SNIP" });
    } catch (e) {
        console.error("Injection failed:", e);
    }
});*/

//
import { encodeWithJSquash } from "../$utils$/compress";
import { recognizeImage } from "./api";

//
const ableToShowJPEG = async (data_url: string) => { // @ts-ignore
    const bitmap: any = await createImageBitmap(new Blob([Uint8Array.fromBase64(data_url?.replace?.('data:image/jpeg;base64,', ""), { alphabet: "base64" })], { type: "image/png" }))?.catch?.(e => { console.warn(e); return null; });
    return bitmap?.width > 0 && bitmap?.height > 0;
}

//
const COPY_HACK = (ext, data, tabId?)=>{
    return ext.tabs.query({
        currentWindow: true,
        lastFocusedWindow: true,
        active: true,
    })?.then?.((tabs)=>{
        for (const tab of tabs) {
            if (tab?.id != null && tab?.id >= 0) {
                //ctxAction({"type": info.menuItemId}, null, ()=>{});
                return chrome.tabs.sendMessage?.(tab.id, { type: "COPY_HACK", data })?.catch?.(console.warn.bind(console));
            }
        }
    })?.catch?.(console.warn.bind(console));

    //
    if (tabId != null && tabId >= 0) { return chrome.tabs.sendMessage?.(tabId, { type: "COPY_HACK", data })?.catch?.(console.warn.bind(console)); }
}



// service worker makes screenshot of visible area
export const enableCapture = (ext) => {
    ext.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg?.type === "CAPTURE") {
            const windowId = sender?.tab?.windowId; //@ts-ignore
            chrome.tabs.captureVisibleTab({ format: "png", scale: 1, rect: msg.rect ?? {x: 0, y: 0, width: 0, height: 0} }, async ($dataUrl) => { // @ts-ignore
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    sendResponse({ ok: false, error: chrome.runtime.lastError.message, dataUrl: $dataUrl });
                } else {
                    // @ts-ignore
                    const bitmap = await createImageBitmap(new Blob([Uint8Array.fromBase64($dataUrl?.replace?.('data:image/png;base64,', ""), { alphabet: "base64" })], { type: "image/png" })/*, rect.x, rect.y, rect.width, rect.height*/);
                    const arrayBuffer = await encodeWithJSquash(bitmap)?.catch?.(e => { console.warn(e); return null; }); bitmap?.close?.(); // @ts-ignore
                    let dataUrl = arrayBuffer ? `data:image/jpeg;base64,${new Uint8Array(arrayBuffer)?.toBase64?.({ alphabet: "base64" })}` : $dataUrl;

                    //
                    if (!dataUrl || !(await ableToShowJPEG(dataUrl))) {
                        //sendResponse({ ok: false, error: "Unable to show JPEG", dataUrl });
                        dataUrl = $dataUrl;
                    }

                    //
                    const res = await recognizeImage({ //@ts-ignore
                        //type: "gpt:recognize",
                        input: [{
                            role: "user",
                            content: [ //@ts-ignore
                                {type: "input_image", image_url: dataUrl, detail: "high"}
                            ]
                        }]
                    });

                    //
                    if (res?.ok) {
                        await COPY_HACK(ext, res?.data?.output?.at?.(-1)?.content?.[0]?.text, sender?.tab?.id)?.catch?.(console.warn.bind(console));
                    }

                    //
                    sendResponse(res); //return res;
                }
            });
        }

        //
        if (msg?.type === "DOWNLOAD" && msg.dataUrl) {
            chrome.downloads.download(
                { url: msg.dataUrl, filename: "snip.png", saveAs: true },
                (id) => { // @ts-ignore
                    if (chrome.runtime.lastError) {
                        sendResponse({ ok: false, error: chrome.runtime.lastError.message, dataUrl: msg.dataUrl });
                    } else {
                        sendResponse({ ok: true, id });
                    }
                }
            );
        }
        return true;
    });
}
