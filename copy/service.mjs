/// <reference types="chrome"/>

//
const ext = typeof chrome != 'undefined' ? chrome : (typeof browser != 'undefined' ? browser : self);

//
const sendToContent = (info, tab)=>{
    ext?.tabs?.sendMessage(tab?.id, {
        "type": info.menuItemId
    })?.then?.((r)=>{
        console.log(r?.status || r);
    })?.catch?.(console.warn.bind(console));
}

//
const createCtxItems = (ext)=>{
    //
    ext?.contextMenus?.create?.({
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
            "page_action",
            "action"
        ]
    });

    //
    ext?.contextMenus?.create?.({
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
            "page_action",
            "action"
        ]
    });
}

// @ts-ignore
if (typeof browser != "undefined") {
    createCtxItems(browser);
} else {
    ext.runtime.onInstalled.addListener(() => {
        createCtxItems(ext);
    });
}

//
ext?.contextMenus?.onClicked?.addListener?.((info, tab) => {
    if (tab?.id != null) {
        sendToContent(info, tab);
    } else {
        ext.tabs.query({
            currentWindow: true,
            active: true,
        })?.then?.((tabs)=>{
            for (const tab of tabs) {
                if (tab?.id != null) {
                    sendToContent(info, tab);
                }
            }
        })?.catch?.(console.warn.bind(console));
    }
});
