/// <reference types="chrome"/>
import { MathMLToLaTeX } from 'mathml-to-latex';
import temml from "./temml/temml.mjs";

// @ts-ignore
const ext: any = typeof chrome != 'undefined' ? chrome : (typeof browser != 'undefined' ? browser : self);

//
const dummy = (unsafe)=>{
    return unsafe?.trim()?.replace?.(/&amp;/g, '&')
    ?.replace?.(/&lt;/g, '<')
    ?.replace?.(/&gt;/g, '>')
    ?.replace?.(/&quot;/g, '"')
    ?.replace?.(/&nbsp;/g, " ")
    ?.replace?.(/&#39;/g, "'") || unsafe;
}

//
const weak_dummy = (unsafe)=>{
    return unsafe?.trim()?.replace?.(/&amp;/g, '&')
    ?.replace?.(/&nbsp;/g, " ")
    ?.replace?.(/&quot;/g, '"')
    ?.replace?.(/&#39;/g, "'") || unsafe;
}

//
const tryXML = (unsafe: string): string => {
    const doc = new DOMParser().parseFromString(unsafe, "text/xml");
    if (doc?.querySelector("parsererror") || !doc) {
        return dummy(unsafe) || unsafe;
    };
    return weak_dummy(doc?.documentElement?.textContent) || dummy(unsafe) || unsafe;
}

//
const serialize = (xml: any): string => {
    const s = new XMLSerializer();
    return typeof xml == "string" ? xml : xml?.outerHTML || s.serializeToString(xml);
}

//
const escapeML = (unsafe: string): string => {
    if (/&amp;|&quot;|&#39;|&lt;|&gt;|&nbsp;/.test(unsafe.trim())) {
        if (unsafe?.trim()?.startsWith?.("&lt;") && unsafe?.trim()?.endsWith?.("&gt;")) {
            return tryXML(unsafe) || dummy(unsafe) || unsafe;
        }
        if (!(unsafe?.trim()?.startsWith?.("<") && unsafe?.trim()?.endsWith?.(">"))) {
            return dummy(unsafe) || unsafe;
        }
    }
    return weak_dummy(unsafe) || unsafe;
}

//
const copyAsMathML = (target: HTMLElement)=>{
    const math = bySelector(target, "math");
    const mjax = bySelector(target, "[data-mathml]");
    const orig = bySelector(target, "[data-original]");
    const expr = bySelector(target, "[data-expr]");
    const img  = bySelector(target, ".mwe-math-fallback-image-inline[alt], .mwe-math-fallback-image-display[alt]");

    //
    let mathML = img?.getAttribute?.("alt") || "";

    //
    try {
        if (!mathML) {
            // @ts-ignore
            const st = math?.outerHTML || "";
            if (!st && math) {
                // @ts-ignore
                const str = serialize(math);
                mathML = escapeML(str || st || mathML);
            }
            if (st) { mathML = escapeML(st || mathML); };
        }
        if (!mathML) { const ml = mjax?.getAttribute("data-mathml") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; }
        if (!mathML) { const ml = expr?.getAttribute("data-expr") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; }
        if (!mathML) { const ml = orig?.getAttribute("data-original") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; }
    } catch (e) {
        console.warn(e);
    }

    //
    const original = mathML;
    if (!(mathML?.trim()?.startsWith?.("<") && mathML?.trim()?.endsWith?.(">"))) {
        try { mathML = escapeML(temml.renderToString(mathML, {
            throwOnError: true,
            strict: false,
            xml: true
        }) || "") || mathML; } catch (e) { mathML = ""; console.warn(e); }
    }
    mathML ||= original;

    //
    if (mathML?.trim()) { navigator.clipboard.writeText(mathML?.trim?.()?.normalize?.()?.trim?.() || mathML?.trim?.() || mathML); }
}

// such as ChatGPT
const extractFromAnnotation = (math: any): string =>{
    if (!math.matches(".katex math, math.katex")) return "";
    const A = math?.querySelector?.("annotation");
    const C = A.textContent || "";
    const Q = C.replace(/^["'](.+(?=["']$))["']$/, '$1') || (C || "");
    return (escapeML(Q) || Q);
}



//
const bySelector = (target: HTMLElement, selector: string): HTMLElement | null =>{
    return (target.matches(selector) ? target : (target.closest(selector) ?? target.querySelector(selector)))
}

//
const copyAsLaTeX = (target: HTMLElement)=>{
    const math = bySelector(target, "math");
    const mjax = bySelector(target, "[data-mathml]");
    const orig = bySelector(target, "[data-original]");
    const expr = bySelector(target, "[data-expr]");
    const img  = bySelector(target, ".mwe-math-fallback-image-inline[alt], .mwe-math-fallback-image-display[alt]");

    //
    let LaTeX = img?.getAttribute("alt") || "";

    //
    try {
        if (!LaTeX) { const ml = expr?.getAttribute("data-expr") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; }
        if (!LaTeX) { const ml = orig?.getAttribute("data-original") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; }
        if (!LaTeX) { const ml = mjax?.getAttribute("data-mathml") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; }
        if (!LaTeX) {
            const st = math?.outerHTML || "";
            if (!st && math) {
                // @ts-ignore
                const str = serialize(math);
                LaTeX = escapeML(str || st || LaTeX);
            }
            if (st) { LaTeX = escapeML(st || LaTeX); };
            LaTeX = extractFromAnnotation(math) || LaTeX;
        };
    } catch (e) {
        console.warn(e);
    }

    //
    const original = LaTeX;
    try { LaTeX = MathMLToLaTeX.convert(LaTeX); } catch (e) { LaTeX = ""; console.warn(e); }
    LaTeX ||= original;

    //navigator.clipboard.writeText("$"+LaTeX+"$");
    if (LaTeX?.trim()) { navigator.clipboard.writeText(LaTeX?.trim?.()?.normalize?.()?.trim?.() || LaTeX?.trim?.() || LaTeX); }
}

//
const coordinate: [number, number] = [0, 0];
const lastElement: [HTMLElement | null] = [null];

//
document.addEventListener("pointerup", (e)=>{
    coordinate[0] = e.clientX || coordinate[0];
    coordinate[1] = e.clientY || coordinate[1];
});

//
document.addEventListener("contextmenu", (e)=>{
    coordinate[0] = e.clientX || coordinate[0];
    coordinate[1] = e.clientY || coordinate[1];
    lastElement[0] = e.target as HTMLElement;
});

//
document.addEventListener("pointerdown", (e)=>{
    coordinate[0] = e.clientX || coordinate[0];
    coordinate[1] = e.clientY || coordinate[1];
});

//
document.addEventListener("click", (e)=>{
    coordinate[0] = e.clientX || coordinate[0];
    coordinate[1] = e.clientY || coordinate[0];
});

//
const ctxAction = (request, sender, $resolve$)=>{
    const element = lastElement[0] || document.elementFromPoint(...coordinate);
    if (element) {
        if (request.type == "copy-as-mathml")
            copyAsMathML(element as HTMLElement);
        if (request.type == "copy-as-latex")
            copyAsLaTeX(element as HTMLElement);
        $resolve$?.({type: "log", status: "Copied"});
    } else {
        $resolve$?.({type: "log", status: "Element not detected"});
    }
}

//
ext.runtime.onMessage.addListener(ctxAction);
ext.runtime.sendMessage({
    type: "opened"
}, (response)=> {
    console.log("Ready to copying");
    response?.({type: "log", status: "Ready to copying"});
});

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
    // @ts-ignore
    createCtxItems(browser);
}

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
