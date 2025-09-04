import "./styles.scss";

//
export const selDom = () => {
    const overlay = document.createElement("div");
    overlay.className = "sel-dom-overlay";
    overlay.draggable = false;
    overlay.tabIndex = -1;
    overlay.popover = "manual";

    //
    const box = document.createElement("div");
    box.className = "sel-dom-box";
    box.tabIndex = -1;

    //
    const hint = document.createElement("div");
    hint.className = "sel-dom-hint";
    hint.textContent = "Select area. Esc — cancel";
    hint.tabIndex = -1;

    //
    const sizeBadge = document.createElement("div");
    sizeBadge.className = "sel-dom-size-badge";
    sizeBadge.textContent = "";
    sizeBadge.tabIndex = -1;

    //
    const toast = document.createElement("div");
    toast.className = "sel-dom-toast";
    toast.tabIndex = -1;

    //
    box.appendChild(sizeBadge);
    overlay.appendChild(box);
    overlay.appendChild(hint);

    //
    document.documentElement.appendChild(toast);

    //
    toast.addEventListener("transitionend", () => {
        if (!toast.classList.contains("is-visible")) {
            //toast.classList.remove("is-visible");
            toast.textContent = "";
        }
    });

    //
    const showToast = (text: string) => {
        if (!toast.classList.contains("is-visible")) toast.classList.add("is-visible");
        if (toast.textContent == text) return; toast.textContent = text;

        //
        setTimeout(() => {
            if (toast.textContent != text) return;
            //toast.textContent = "";
            toast.classList.remove("is-visible");
        }, 1800);
    }

    //
    const showSelection = () => {
        overlay?.showPopover?.();
        overlay.style.setProperty("display", "block", "important");

        // reset box
        box.style.left = 0 + "px";
        box.style.top = 0 + "px";
        box.style.width = 0 + "px";
        box.style.height = 0 + "px";

        // reset size badge
        sizeBadge.textContent = "";
    }

    //
    const hideSelection = () => {
        overlay.style.removeProperty("display");
        overlay?.hidePopover?.();

        // reset box
        box.style.left = 0 + "px";
        box.style.top = 0 + "px";
        box.style.width = 0 + "px";
        box.style.height = 0 + "px";

        // reset size badge
        sizeBadge.textContent = "";
    }

    //
    return { overlay, box, hint, sizeBadge, showSelection, hideSelection, showToast, toast };
}

//
export default selDom;
