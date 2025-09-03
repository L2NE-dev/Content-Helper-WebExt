import { ctxAction } from "../$content$/service";

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
    ext?.contextMenus?.create?.({
        id: 'copy-as-latex',
        title: 'Copy as LaTeX',
        visible: true,
        contexts
    });

    //
    ext?.contextMenus?.create?.({
        id: 'copy-as-mathml',
        title: 'Copy as MathML',
        visible: true,
        contexts
    });

    //
    ext?.contextMenus?.onClicked?.addListener?.((info, tab) => {
        if (tab?.id != null) {
            ctxAction({"type": info.menuItemId}, {}, ()=>{});
        } else {
            ext.tabs.query({
                currentWindow: true,
                active: true,
            })?.then?.((tabs)=>{
                for (const tab of tabs) {
                    if (tab?.id != null) {
                        ctxAction({"type": info.menuItemId}, null, ()=>{});
                    }
                }
            })?.catch?.(console.warn.bind(console));
        }
    });
}

// @ts-ignore
if (typeof browser != "undefined") {
    // @ts-ignore
    createCtxItems(browser);
}
