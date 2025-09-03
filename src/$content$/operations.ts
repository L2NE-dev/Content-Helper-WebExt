import { copyAsHTML, copyAsMathML, copyAsMarkdown, copyAsTeX } from "../$utils$/convert";
import { startSnip } from "./snip";

//
export const opMap = new Map([
    ['copy-as-latex', copyAsTeX],
    ['copy-as-mathml', copyAsMathML],
    ['copy-as-markdown', copyAsMarkdown],
    ['copy-as-html', copyAsHTML]
]);
