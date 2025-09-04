import "./index.scss";

//
const implementSettings = () => {
    const apiKey = document.getElementById('api-key') as HTMLInputElement;
    const apiUrl = document.getElementById('api-url') as HTMLInputElement;
    const saveSettings = document.getElementById('save-settings') as HTMLButtonElement;

    //
    chrome.storage.local.get('apiUrl').then((res) => { if (apiUrl) apiUrl.value = (res.apiUrl || "")?.trim?.() || ""; })?.catch?.(console.warn.bind(console));
    chrome.storage.local.get('apiKey').then((res) => { if (apiKey) apiKey.value = (res.apiKey || "")?.trim?.() || ""; })?.catch?.(console.warn.bind(console));

    //
    saveSettings?.addEventListener('click', async () => {
        chrome.storage.local.set({ apiUrl: (apiUrl?.value as string || (await chrome.storage.local.get('apiUrl')?.catch?.(console.warn.bind(console)))?.apiUrl || "")?.trim?.() || "" });
        chrome.storage.local.set({ apiKey: (apiKey?.value as string || (await chrome.storage.local.get('apiKey')?.catch?.(console.warn.bind(console)))?.apiKey || "")?.trim?.() || "" });

        //
        if (apiKey) apiKey.value = apiKey.value?.trim?.() || "";
        if (apiUrl) apiUrl.value = apiUrl.value?.trim?.() || "";
    })//?.catch?.(console.warn.bind(console));

    // trim values for better user experience
    apiUrl?.addEventListener('change', () => { apiUrl.value = apiUrl.value?.trim?.() || ""; });
    apiKey?.addEventListener('change', () => { apiKey.value = apiKey.value?.trim?.() || ""; });

    //
    const showApiKey = document.getElementById('show-api-key') as HTMLInputElement;
    showApiKey?.addEventListener('click', () => {

        apiKey.type = showApiKey!.checked ? "text" : "password";
    })//?.catch?.(console.warn.bind(console));
}

//
const implementActions = () => {
    const snipAndRecognize = document.getElementById('snip-and-recognize') as HTMLButtonElement;
    snipAndRecognize?.addEventListener('click', () => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0]?.id!, { type: "START_SNIP" })?.catch?.(console.warn.bind(console));
            document?.documentElement?.blur?.();
            document?.body?.blur?.();
            (document?.activeElement as any)?.blur?.();
            window?.close?.();
            //chrome.action.setPopup({ popup: "" });
        })//?.catch?.(console.warn.bind(console));
    })//?.catch?.(console.warn.bind(console));
}

//
implementSettings();
implementActions();
