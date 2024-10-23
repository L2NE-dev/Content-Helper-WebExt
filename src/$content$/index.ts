/// <reference types="chrome"/>
import { MathMLToLaTeX } from 'mathml-to-latex';
import temml from "./temml/temml.mjs";

//
const escapeML = (unsafe: string): string => {
    if (/&amp;|&quot;|&#39;|'&lt;|&gt;/.test(unsafe)) {
        const doc = new DOMParser().parseFromString(unsafe, "text/xml");
        if (doc.querySelector("parsererror")) {
            return unsafe.replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
        }
        return doc.documentElement.textContent || unsafe;
    }
    return unsafe;
}

//
const copyAsMathML = (target: HTMLElement)=>{
    //"annotation"
    const math = target.matches("math") ? target : (target.closest("math") ?? target.querySelector("math"));
    const mjax = target.matches("[data-mathml]") ? target : (target.closest("[data-mathml]") ?? target.querySelector("[data-mathml]"));//
    const orig = target.matches("[data-original]") ? target : (target.closest("[data-original]") ?? target.querySelector("[data-original]"));//
    const expr = target.matches("[data-expr]") ? target : (target.closest("[data-expr]") ?? target.querySelector("[data-expr]"));//
    const img = target.matches("[alt]") ? target : (target.closest("[alt]") ?? target.querySelector("[alt]"));//

    //
    let mathML = img?.getAttribute("alt") || "";

    //
    try {
        if (math) {
            const st = math?.outerHTML || "";
            if (!st && math) {
                const s = new XMLSerializer();
                const str = s.serializeToString(math);
                mathML = str || mathML;
            }
            if (st) { mathML = st || mathML; };
        } else
        if (mjax) { const ml = mjax.getAttribute("data-mathml") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; } else
        if (expr) { const ml = expr.getAttribute("data-expr") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; } else
        if (orig) { const ml = orig.getAttribute("data-original") || ""; mathML = (ml ? escapeML(ml) : mathML) || mathML; }
    } catch (e) {
        console.warn(e);
    }

    //
    const original = mathML;
    try { mathML = escapeML(temml.renderToString(mathML, {
        throwOnError: true,
        strict: false,
        xml: true
    }) || "") || mathML; } catch (e) { mathML = ""; console.warn(e); }
    mathML ||= original;

    //
    if (mathML = mathML?.trim()?.normalize()?.trim()) {
        //navigator.clipboard.writeText("$"+LaTeX+"$");
        navigator.clipboard.writeText(mathML);
    }
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
const copyAsLaTeX = (target: HTMLElement)=>{
    const math = target.matches("math") ? target : (target.closest("math") ?? target.querySelector("math"));
    const mjax = target.matches("[data-mathml]") ? target : (target.closest("[data-mathml]") ?? target.querySelector("[data-mathml]"));//
    const orig = target.matches("[data-original]") ? target : (target.closest("[data-original]") ?? target.querySelector("[data-original]"));//
    const expr = target.matches("[data-expr]") ? target : (target.closest("[data-expr]") ?? target.querySelector("[data-expr]"));//
    const img = target.matches("[alt]") ? target : (target.closest("[alt]") ?? target.querySelector("[alt]"));//

    //
    let LaTeX = img?.getAttribute("alt") || "";

    //
    try {
        if (expr) { const ml = expr.getAttribute("data-expr") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; } else
        if (orig) { const ml = orig.getAttribute("data-original") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; } else
        if (mjax) { const ml = mjax.getAttribute("data-mathml") || ""; LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; } else
        if (math) {
            const st = math?.outerHTML || "";
            if (!st && math) {
                const s = new XMLSerializer();
                const str = s.serializeToString(math);
                LaTeX = str || LaTeX;
            }
            if (st) { LaTeX = st || LaTeX; };
            LaTeX = extractFromAnnotation(math) || LaTeX;
        };
    } catch (e) {
        console.warn(e);
    }

    //
    const original = LaTeX;
    try { LaTeX = MathMLToLaTeX.convert(LaTeX); } catch (e) { LaTeX = ""; console.warn(e); }
    LaTeX ||= original;

    //
    if (LaTeX = LaTeX?.trim()?.normalize()?.trim()) {
        //navigator.clipboard.writeText("$"+LaTeX+"$");
        navigator.clipboard.writeText(LaTeX);
    }
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
/*document.addEventListener("pointermove", (e)=>{
    coordinate[0] = e.clientX;
    coordinate[1] = e.clientX;
});*/

//
chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.type == "copy-as-mathml") {
        const element = lastElement[0] || document.elementFromPoint(...coordinate);
        if (element) {
            copyAsMathML(element as HTMLElement);
            callback?.({type: "log", status: "Copied"});
        } else {
            callback?.({type: "log", status: "Element not detected"});
        }
    } else
    if (request.type == "copy-as-latex") {
        const element = lastElement[0] || document.elementFromPoint(...coordinate);
        if (element) {
            copyAsLaTeX(element as HTMLElement);
            callback?.({type: "log", status: "Copied"});
        } else {
            callback?.({type: "log", status: "Element not detected"});
        }
    } else {
        callback?.({type: "log", status: "Wrong command"});
    }
    //console.log(request, sender, callback);
});

//
chrome.runtime.sendMessage({
    type: "opened"
}, (response)=> {
    console.log("Ready to copying");
    response?.({type: "log", status: "Ready to copying"});
});
