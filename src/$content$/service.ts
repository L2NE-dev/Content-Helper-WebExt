import { showToast } from "../$overlay$/sel-dom";
import { ext } from "../$utils$/core";
import { coordinate, lastElement } from "../$utils$/state";
import { opMap } from "./operations";

// action for context menu
export const ctxAction = (request, sender, $resolve$)=>{
    if (opMap.has(request.type)) {
        const element = lastElement?.[0] || document.elementFromPoint(...coordinate);
        if (element) { opMap.get(request.type)?.(element as HTMLElement); };
        $resolve$?.({type: "log", status: element ? "Copied" : "Element not detected"});
    } else {
        $resolve$?.({type: "log", status: "Operation not exists"});
    }
}

// message exchange with context menu in service worker
ext.runtime.onMessage.addListener(ctxAction);

/*
ext.runtime.sendMessage({ type: "opened" })?.then?.((message)=> {
    console.log("Ready to copying");
    console.log(message);
});
*/

//
const COPY_HACK = async (data)=>{
    if (data) {
        try {
            await navigator?.clipboard?.writeText?.(data)?.catch?.(err => {
                console.warn('Failed to copy text: ', err);
            });
            console.log('Text copied to clipboard');
        } catch (err) {
            console.warn('Failed to copy text: ', err);
        }
    }
}

//
ext.runtime.onMessage.addListener((res, sender, sendResponse)=>{
    (async ()=>{
        if (res?.type == "COPY_HACK") {
            await COPY_HACK(res?.data);
            sendResponse({ok: res?.ok ?? true, data: res?.data});
            showToast(res?.ok ? "Copying is done" : (res?.error || "Failed to copy"));
        }
    })();
    return true;
});
