//import { ctxAction } from "../$content$/service";

//
export const createCtxItems = (ext)=>{
    const contexts = [
        "all",
        "page",
        "frame",
        "selection",
        "link",
        "editable",
        "image",
        "video",
        "audio",
        "action"
    ];

    //
    try {
        ext?.contextMenus?.create?.({
            id: 'copy-as-latex',
            title: 'Copy as LaTeX',
            visible: true,
            contexts
        })?.catch?.(console.warn.bind(console));
    } catch (err) {
        console.warn(err);
    }

    //
    try {
        ext?.contextMenus?.create?.({
            id: 'copy-as-mathml',
            title: 'Copy as MathML',
            visible: true,
            contexts
        })?.catch?.(console.warn.bind(console));
    } catch (err) {
        console.warn(err);
    }

    //
    try {
        ext?.contextMenus?.create?.({
            id: 'copy-as-markdown',
            title: 'Copy as Markdown',
            visible: true,
            contexts
        })?.catch?.(console.warn.bind(console));
    } catch (err) {
        console.warn(err);
    }

    //
    try {
        ext?.contextMenus?.create?.({
            id: 'copy-as-html',
            title: 'Copy as HTML',
            visible: true,
            contexts
        })?.catch?.(console.warn.bind(console));
    } catch (err) {
        console.warn(err);
    }

    //
    try {
        ext?.contextMenus?.create?.({
            id: 'START_SNIP',
            title: 'Snip and Recognize (AI, Markdown)', //, LaTeX, JSON, contact, date, time, URL, email, phone...
            visible: true,
            contexts
        })?.catch?.(console.warn.bind(console));
    } catch (err) {
        console.warn(err);
    }

    //
    ext?.contextMenus?.onClicked?.addListener?.((info, tab) => {
        if (tab?.id != null && tab?.id >= 0) {
            //ctxAction({"type": info.menuItemId}, {}, ()=>{});
            chrome.tabs.sendMessage?.(tab.id, { type: info.menuItemId })?.then?.((message)=> {
                console.log(message, tab.id);
            });
        } else {
            ext.tabs.query({
                currentWindow: true,
                lastFocusedWindow: true,
                active: true,
            })?.then?.((tabs)=>{
                for (const tab of tabs) {
                    if (tab?.id != null && tab?.id >= 0) {
                        //ctxAction({"type": info.menuItemId}, null, ()=>{});
                        chrome.tabs.sendMessage?.(tab.id, { type: info.menuItemId })?.then?.((message)=> {
                            console.log(message, tab.id);
                        });
                    }
                }
            })?.catch?.(console.warn.bind(console));
        }
    });
}

/*
// @ts-ignore
if (typeof browser != "undefined") {
    // @ts-ignore
    createCtxItems(browser);
}
*/