import { encode } from "@jsquash/jpeg";

//
type cropArea = { x: number, y: number, width: number, height: number }

// use chrome API to capture tab visible area
const captureTab = (rect?: cropArea) => { // @ts-ignore
    return chrome.runtime.sendMessage({ type: "CAPTURE", rect })?.then?.(res => {
        console.log(res);
        return (res || { ok: false, error: "no response" });
    })?.catch?.(err => console.warn(err));
}

//
const jpegConfig = { quality: 90, progressive: false, color_space: 2, optimize_coding: true, auto_subsample: true, baseline: true };

//
const encodeWithJSquash = async (frameData: VideoFrame|ImageBitmap, rect?: cropArea)=>{
    const imageDataOptions: ImageDataSettings = {
        colorSpace: "srgb",
    }

    // @ts-ignore
    rect ??= { x: 0, y: 0, width: frameData?.width || frameData?.codedWidth || 0, height: frameData?.height || frameData?.codedHeight || 0 };

    //
    if (frameData instanceof ImageBitmap) {
        const cnv = new OffscreenCanvas(rect.width, rect.height);
        const ctx = cnv.getContext("2d");
        ctx?.drawImage?.(frameData, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
        const idata = ctx?.getImageData?.(0, 0, rect.width, rect.height, imageDataOptions);
        if (idata) return encode(idata, jpegConfig);
    } else { // @ts-ignore
        const idata = new ImageData(rect.codedWidth, rect.codedHeight, imageDataOptions);
        try { frameData?.copyTo?.(idata.data, { format: "RGBA", rect }); } catch (e) { console.warn(e); }
        return encode(idata, jpegConfig);
    }
}

//
export async function smartCaptureAndEncode(rect: cropArea) {
    const stream = await navigator.mediaDevices.getDisplayMedia({ // @ts-ignore
        video: { preferCurrentTab: true },
        audio: false
    });

    //
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    //
    const [track] = stream.getVideoTracks();
    if (!track) throw new Error("No video track");

    //
    const settings = track.getSettings();
    const capW = settings?.width || 0;
    const capH = settings?.height || 0;
    const scaleX = capW / vw;
    const scaleY = capH / vh;

    //
    const sx = Math.max(0, Math.round(rect.x * scaleX));
    const sy = Math.max(0, Math.round(rect.y * scaleY));
    const sw = Math.max(1, Math.round(rect.width * scaleX));
    const sh = Math.max(1, Math.round(rect.height * scaleY));

    // @ts-ignore
    const capture = new ImageCapture(track);
    const bitmap = await capture.grabFrame();
    if (!bitmap) throw new Error("No frame from processor");

    //
    const jpegArrayBuffer = await encodeWithJSquash(bitmap, { x: sx, y: sy, width: sw, height: sh }); bitmap?.close?.();

    //
    return jpegArrayBuffer;
}

//
export const fallbackCapture = async (rect: cropArea) => {
    const shot = await captureTab(rect); // @ts-ignore
    if (!shot?.ok) throw new Error(shot?.error || "capture failed"); // @ts-ignore

    // @ts-ignore
    const bitmap = await createImageBitmap(new Blob([Uint8Array.fromBase64(shot?.dataUrl?.replace?.('data:image/png;base64,', ""), { alphabet: "base64" })], { type: "image/png" })/*, rect.x, rect.y, rect.width, rect.height*/);

    //
    const arrayBuffer = await encodeWithJSquash(bitmap);
    bitmap?.close?.(); return arrayBuffer;
}

//
export const captureAsPossible = async (rect: cropArea) => {
    /*try {
        return (await smartCaptureAndEncode(rect) || await fallbackCapture(rect));
    } catch {
        return (await fallbackCapture(rect));
    }*/
    return (await fallbackCapture(rect));
}
