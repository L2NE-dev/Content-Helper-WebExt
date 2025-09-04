import type { cropArea } from "../$utils$/compress";

//
let __snipInjected = false;
let __snipActive = false;

// use chrome API to capture tab visible area
const captureTab = (rect?: cropArea) => { // @ts-ignore
    return chrome.runtime.sendMessage({ type: "CAPTURE", rect })?.then?.(res => {
        console.log(res);
        return (res || { ok: false, error: "no response" });
    })?.catch?.(err => console.warn(err));
}

//
export const startSnip = (() => { // @ts-ignore
    if (__snipInjected) return;
    __snipInjected = true;

    //
    chrome.runtime.onMessage.addListener((msg) => {
        console.log(msg?.type);
        if (msg?.type === "START_SNIP") startSnip();
    });

    //
    function startSnip() {
        if (__snipActive) return;
        __snipActive = true;

        //
        const overlay = document.createElement("div");
        overlay.draggable = false;
        overlay.style.cssText = `
position: fixed; inset: 0; z-index: 2147483647;
cursor: crosshair; background: rgba(0,0,0,.25);
user-select: none; -webkit-user-select: none; user-drag: none; -webkit-user-drag: none;`;
        overlay.tabIndex = -1;

        //
        const box = document.createElement("div");
        box.style.cssText = `
position: absolute; border: 1px solid #4da3ff;
background: rgba(77,163,255,.2);
pointer-events: none; user-drag: none; -webkit-user-drag: none;`;

        //
        const hint = document.createElement("div");
        hint.style.cssText = `
position: fixed; top: 10px; right: 10px;
background: rgba(0,0,0,.6); color: #fff;
font: 12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
padding: 6px 8px; border-radius: 6px; pointer-events: none; user-drag: none; -webkit-user-drag: none;`;
        hint.textContent = "Select area. Esc — cancel";

        //
        const sizeBadge = document.createElement("div");
        sizeBadge.style.cssText = `
position: absolute; transform: translateY(-100%);
background: #1f2937; color: #fff; font: 12px/1.4 system-ui;
padding: 2px 6px; border-radius: 4px; pointer-events: none; user-drag: none; -webkit-user-drag: none;`;

        //
        overlay.appendChild(box);
        overlay.appendChild(hint);
        document.documentElement.appendChild(overlay);
        overlay.focus();

        //
        let startX = 0, startY = 0, currX = 0, currY = 0, dragging = false;

        //
        const onKeyDown = (e) => { if (e.key === "Escape") cleanup(); };
        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            currX = startX;
            currY = startY;
            updateBox();
            document.addEventListener("mousemove", onMouseMove, true);
            document.addEventListener("mouseup", onMouseUp, true);
            document.addEventListener("mousecancel", onMouseCancel, true);
        };

        //
        const onMouseMove = (e) => {
            if (!dragging) return;
            currX = e.clientX;
            currY = e.clientY;
            updateBox();
        };

        //
        const onMouseCancel = () => {
            if (!dragging) return; dragging = false;
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);
            document.removeEventListener("mousecancel", onMouseCancel, true);
        };

        //
        const onMouseUp = async () => {
            if (!dragging) return; dragging = false;
            document.removeEventListener("mousemove", onMouseMove, true);
            document.removeEventListener("mouseup", onMouseUp, true);

            //
            const x = Math.min(startX, currX);
            const y = Math.min(startY, currY);
            const w = Math.abs(currX - startX);
            const h = Math.abs(currY - startY);
            console.log(x, y, w, h);

            //
            cleanupOverlayKeepFlag();

            //
            if (w < 2 || h < 2) { __snipActive = false; return; }

            //
            await captureTab({ x, y, width: w, height: h })?.catch?.(err => {
                console.warn(err);
                return null;
            });

            //await navigator.clipboard.writeText(data_url);

            // open in new tab for debug
            //window.open(data_url, "_blank");
            //chrome.tabs.create({ url: data_url });

            __snipActive = false;
        };

        //
        function updateBox() {
            const x = Math.min(startX, currX);
            const y = Math.min(startY, currY);
            const w = Math.abs(currX - startX);
            const h = Math.abs(currY - startY);
            box.style.left = x + "px";
            box.style.top = y + "px";
            box.style.width = w + "px";
            box.style.height = h + "px";

            sizeBadge.textContent = `${Math.max(0, Math.round(w))} × ${Math.max(0, Math.round(h))}`;
            if (!sizeBadge.isConnected) box.appendChild(sizeBadge);
            sizeBadge.style.left = "0px";
            sizeBadge.style.top = "0px";
        }

        //
        function cleanupOverlayKeepFlag() {
            document.removeEventListener("keydown", onKeyDown, true);
            overlay.removeEventListener("mousedown", onMouseDown, true);
            overlay.remove();
        }

        //
        function cleanup() {
            cleanupOverlayKeepFlag();
            __snipActive = false;
        }

        //
        function toast(text) {
            const t = document.createElement("div");
            t.textContent = text;
            t.style.cssText = `
position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
background: rgba(0,0,0,.8); color: #fff; padding: 8px 12px;
border-radius: 8px; font: 12px/1.4 system-ui; z-index: 2147483647;`;
            document.documentElement.appendChild(t);
            setTimeout(() => t.remove(), 1800);
        }

        //
        overlay.addEventListener("mousedown", onMouseDown, true);
        document.addEventListener("keydown", onKeyDown, true);
    }
})();
