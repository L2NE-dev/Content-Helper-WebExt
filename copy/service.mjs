/// <reference types="chrome"/>
chrome.runtime.onInstalled.addListener(() => {
    //
    chrome.contextMenus.create({
        id: 'copy-as-latex',
        title: 'Copy as LaTeX',
        visible: true,
        contexts: [
            "all",
            "page",
            "frame",
            "selection",
            "link",
            "editable",
            "image",
            "video",
            "audio",
            "browser_action",
            "page_action",
            "action"
        ]
    });

    //
    chrome.contextMenus.create({
        id: 'copy-as-mathml',
        title: 'Copy as MathML',
        visible: true,
        contexts: [
            "all",
            "page",
            "frame",
            "selection",
            "link",
            "editable",
            "image",
            "video",
            "audio",
            "browser_action",
            "page_action",
            "action"
        ]
    });
});

//
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab?.id != null) {
        chrome.tabs.sendMessage(tab?.id, {
            "type": info.menuItemId
        })?.then?.((r)=>{
            console.log(r?.status || r);
        })?.catch?.(console.warn.bind(console));
    } else {
        chrome.tabs.query({
            currentWindow: true,
            active: true,
        })?.then?.((tabs)=>{
            for (const tab of tabs) {
                if (tab?.id != null) {
                    chrome.tabs.sendMessage(tab?.id, {
                        "type": info.menuItemId
                    })?.then?.((r)=>{
                        console.log(r?.status || r);
                    })?.catch?.(console.warn.bind(console));
                }
            }
        })?.catch?.(console.warn.bind(console));
    }
});
