import TurndownService from 'turndown';
import markedKatex from "marked-katex-extension";
import temml from "temml";

//
import { marked } from 'marked';
import { escapeML, bySelector, serialize, extractFromAnnotation, getContainerFromTextSelection } from './core';
import { MathMLToLaTeX } from 'mathml-to-latex';

//
const turndownService = new TurndownService();

//
try {
    marked?.use?.(markedKatex?.({
        throwOnError: false,
        nonStandard: true
    }));
} catch(e) {
    console.warn(e);
}

// convert markdown text to html
export const convertToHtml = async (input: string): Promise<string> => { // convert markdown text to html
    const original = escapeML(input);
    // if already html, don't convert
    if (input?.trim()?.startsWith?.("<") && input?.trim()?.endsWith?.(">")) {
        return input;
    }
    try {
        // marked is synchronous, but we keep async for compatibility
        input = escapeML(await marked.parse(input) || "") || input;
    } catch (e) {
        input = "";
        console.warn(e);
    }
    input ||= original;
    return (input?.normalize?.()?.trim?.() || input?.trim?.() || input);
};

// convert html DOM to markdown
export const convertToMarkdown = (input: string): string => { // convert html DOM to markdown
    const original = escapeML(input);
    try {
        input = turndownService.turndown(input);
    } catch (e) {
        input = "";
        console.warn(e);
    }
    input ||= original;
    return (input?.normalize?.()?.trim?.() || input?.trim?.() || input);
};

// copy html DOM as markdown
export const copyAsMarkdown = async (target: HTMLElement)=>{ // copy html DOM as markdown
    const container = getContainerFromTextSelection(target);
    const markdown = convertToMarkdown(container?.innerHTML || "");
    if (markdown?.trim()) { navigator.clipboard.writeText(markdown?.trim?.()?.normalize?.()?.trim?.() || markdown?.trim?.() || markdown); }
}

// copy markdown text as html
export const copyAsHTML = async (target: HTMLElement)=>{ // copy markdown text as html
    const container = getContainerFromTextSelection(target);
    const html = await convertToHtml(container?.innerText || "");
    if (html?.trim()) { navigator.clipboard.writeText(html?.trim?.()?.normalize?.()?.trim?.() || html?.trim?.() || html); }
}

// copy mathml DOM as tex
export const copyAsTeX = async (target: HTMLElement)=>{
    const math = bySelector(target, "math");
    const mjax = bySelector(target, "[data-mathml]");
    const orig = bySelector(target, "[data-original]");
    const expr = bySelector(target, "[data-expr]");
    const img  = bySelector(target, ".mwe-math-fallback-image-inline[alt], .mwe-math-fallback-image-display[alt]");

    //
    let LaTeX = img?.getAttribute("alt") || getSelection()?.toString?.() || "";

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
    if (LaTeX?.trim()) { navigator.clipboard.writeText(LaTeX?.trim?.()?.normalize?.()?.trim?.() || LaTeX?.trim?.() || LaTeX)?.catch?.((e)=> { console.warn(e); }); }
}

// copy mathml DOM as mathml
export const copyAsMathML = async (target: HTMLElement)=>{ // copy mathml DOM as mathml
    const math = bySelector(target, "math");
    const mjax = bySelector(target, "[data-mathml]");
    const orig = bySelector(target, "[data-original]");
    const expr = bySelector(target, "[data-expr]");
    const img  = bySelector(target, ".mwe-math-fallback-image-inline[alt], .mwe-math-fallback-image-display[alt]");

    //
    let mathML = img?.getAttribute?.("alt") || "" || "";

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
    if (mathML?.trim()) { navigator.clipboard.writeText(mathML?.trim?.()?.normalize?.()?.trim?.() || mathML?.trim?.() || mathML)?.catch?.((e)=> { console.warn(e); }); }
}

/*
        "default_title": "Snip",
        "default_icon": "assets/512x.png"
*/