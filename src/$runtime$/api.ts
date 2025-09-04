import { setApiKey } from "../$private$/KEY";
setApiKey?.();

//
const API_BASE = 'https://api.proxyapi.ru/openai/v1/'//'https://openai.api.proxyapi.ru/';
const ENDPOINT = 'responses';
const MODEL = 'gpt-5-mini';

//
const INSTRUCTION = `
Recognize data from image, also preferred to orient by fonts in image.

In recognition result, do not include image itself.

In recognited from image data (what you seen in image), do:
- If textual content, format as Markdown string (multiline).
- If math (expression, equation, formula), format as $KaTeX$
- If table, format as |$table$|
- If image, format as [$image$]($image$)
- If code, format as \`\`\`$code$\`\`\`
- If JSON, format as JSON string.
- If phone number, format as as correct phone number.
- If email, format as as correct email.
- If URL, format as as correct URL.
- If date, format as as correct date.
- If time, format as as correct time.
- If other, format as $text$.

If nothing found, return "No data recognized".
`;

//
export const recognizeImage = async (msg, sendResponse?) => {
    const { input } = msg;
    const token = (await chrome.storage.local.get('apiKey'))?.apiKey; console.log(token);
    if (!token) return sendResponse?.({ ok: false, error: "No API key" });

    //
    const r: any = await fetch(`${API_BASE}${ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            model: MODEL, // ваш
            input,
            reasoning: { effort: "low" },
            //temperature: 0.2,
            instructions: INSTRUCTION
        })
    })?.catch?.(e => {
        console.warn(e);
        return { ok: false, error: String(e) };
    });

    //
    const data = await r?.json?.()?.catch?.((e) => {
        console.warn(e);
        return { ok: false, error: String(e) };
    }) || {}; console.log(data);

    //
    const output = { ok: r?.ok, data };
    sendResponse?.(output);
    return output;
}; // async response

//
export const enableGptApi = (ext) => {
    ext.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type !== 'gpt:recognize') return;
        recognizeImage(msg, sendResponse);
        return true;
    });
};

//const res = await chrome.runtime.sendMessage({ type: 'gpt:complete', prompt: '...' });

/*
chrome.runtime.onConnect.addListener(port => {
    if (port.name !== 'gpt') return;

    //
    port.onMessage.addListener(async (msg) => {
        await import('./KEY')?.then?.(({ setApiKey }) => setApiKey?.())?.catch?.(() => {});

        //
        if (msg.type !== 'start') return;
        const ctrl = new AbortController();
        const onDisconnect = () => ctrl.abort();
        port.onDisconnect.addListener(onDisconnect);

        //
        try {
            const tokenObj = await chrome.storage.local.get('apiKey');
            const r = await fetch(`${API_BASE}${ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenObj.apiKey}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    inputs: msg.inputs,
                    instruction: INSTRUCTION,
                    stream: true
                }),
                signal: ctrl.signal
            });

            //
            if (!r.ok || !r.body) {
                port.postMessage({ type: 'error', status: r.status });
                port.disconnect();
                return;
            }

            //
            const reader = r.body.getReader();
            const td = new TextDecoder();
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read(); if (done) break;
                buffer += td.decode(value, { stream: true });

                //
                let idx;
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const chunk = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('data: ')) {
                            const payload = line.slice(6).trim();
                            if (payload === '[DONE]') continue;
                            try {
                                const json = JSON.parse(payload);
                                const delta = json.choices?.[0]?.delta?.content ?? '';
                                if (delta) port.postMessage({ type: 'delta', delta });
                            } catch {  }
                        }
                    }
                }
            }
            port.postMessage({ type: 'done', buffer: buffer.trim() });
        } catch (e) {
            port.postMessage({ type: 'error', error: String(e) });
        } finally {
            port.onDisconnect.removeListener(onDisconnect);
            port.disconnect();
        }
    });
});*/

/*
const port = chrome.runtime.connect({ name: 'gpt' });
port.onMessage.addListener(msg => {
    if (msg.type === 'delta') appendToUI(msg.delta);
    if (msg.type === 'done') finishUI();
});
port.postMessage({
    type: 'start',
    model: MODEL,
    messages: [{ role: 'user', content: '...' }]
});*/
// Для отмены: port.disconnect()
