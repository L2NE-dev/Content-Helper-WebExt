/// <reference types="chrome"/>

//
const ext = typeof chrome != 'undefined' ? chrome : (typeof browser != 'undefined' ? browser : self);

//
const createCtxItems = ()=>{
    //
    ext.contextMenus.create({
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
    ext.contextMenus.create({
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

//
createCtxItems();

//
ext.runtime.onInstalled.addListener(() => {

});

//
ext.contextMenus.onClicked.addListener((info, tab) => {
    if (tab?.id != null) {
        ext.tabs.sendMessage(tab?.id, {
            "type": info.menuItemId
        })?.then?.((r)=>{
            console.log(r?.status || r);
        })?.catch?.(console.warn.bind(console));
    } else {
        ext.tabs.query({
            currentWindow: true,
            active: true,
        })?.then?.((tabs)=>{
            for (const tab of tabs) {
                if (tab?.id != null) {
                    ext.tabs.sendMessage(tab?.id, {
                        "type": info.menuItemId
                    })?.then?.((r)=>{
                        console.log(r?.status || r);
                    })?.catch?.(console.warn.bind(console));
                }
            }
        })?.catch?.(console.warn.bind(console));
    }
});
