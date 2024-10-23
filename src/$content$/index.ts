/// <reference types="chrome"/>
import { MathMLToLaTeX } from 'mathml-to-latex';

//
const escapeML = (unsafe: string): string => {
    if (/&amp;|&quot;|&#39;|'&lt;|&gt;/.test(unsafe)) {
        const doc = new DOMParser().parseFromString(unsafe, "text/xml");
        return doc.documentElement.textContent || "";
    }
    return unsafe;
}

//
const copyAsLaTeX = (target: HTMLElement)=>{
    const math = target.matches("math") ? target : (target.closest("math") ?? target.querySelector("math"));
    const mjax = target.matches("[data-mathml]") ? target : (target.closest("[data-mathml]") ?? target.querySelector("[data-mathml]"));//
    const img = target.matches("[alt]") ? target : (target.closest("[alt]") ?? target.querySelector("[alt]"));//

    //
    let LaTeX = img?.getAttribute("alt") || "";

    //
    try {
        if (mjax) { const ml = mjax.getAttribute("data-mathml"); LaTeX = (ml ? escapeML(ml) : LaTeX) || LaTeX; } else
        if (math) {
            const st = math?.outerHTML || "";
            if (!st && math) {
                const s = new XMLSerializer();
                const str = s.serializeToString(math);
                LaTeX = str || LaTeX;
            }
            if (st) { LaTeX = st || LaTeX; };
        };
    } catch (e) {
        console.warn(e);
    }

    //
    const original = LaTeX;
    try { LaTeX = MathMLToLaTeX.convert(LaTeX); } catch (e) { console.warn(e); }
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
    coordinate[0] = e.pageX || coordinate[0];
    coordinate[1] = e.pageY || coordinate[1];
});

//
document.addEventListener("contextmenu", (e)=>{
    coordinate[0] = e.pageX || coordinate[0];
    coordinate[1] = e.pageY || coordinate[1];
    lastElement[0] = e.target as HTMLElement;
});

//
document.addEventListener("pointerdown", (e)=>{
    coordinate[0] = e.pageX || coordinate[0];
    coordinate[1] = e.pageY || coordinate[1];
});

//
document.addEventListener("click", (e)=>{
    coordinate[0] = e.pageX || coordinate[0];
    coordinate[1] = e.pageY || coordinate[0];
});

//
/*document.addEventListener("pointermove", (e)=>{
    coordinate[0] = e.pageX;
    coordinate[1] = e.pageX;
});*/

//
chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.type == "copy-as-latex") {
        const element = lastElement[0] || document.elementFromPoint(...coordinate);
        if (element) {
            copyAsLaTeX(element as HTMLElement);
            callback?.({type: "log", status: "Copied"});
        } else {
            callback?.({type: "log", status: "Element not detected"});
        }
    } else {
        callback?.({type: "log", status: "Element not detected"});
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
