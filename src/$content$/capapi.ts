import { encode } from "@jsquash/jpeg";

//
type cropArea = { x: number, y: number, width: number, height: number }

// use chrome API to capture tab visible area
const captureTab = () => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "CAPTURE" }, (res) => {
            resolve(res || { ok: false, error: "no response" });
        });
    });
}

//
const encodeWithJSquash = async (frameData: VideoFrame|ImageBitmap, cropRect: cropArea)=>{
    const imageDataOptions: ImageDataSettings = {
        colorSpace: "srgb",
    }

    //
    if (frameData instanceof ImageBitmap) {
        const cnv = new OffscreenCanvas(cropRect.width, cropRect.height);
        const ctx = cnv.getContext("2d");
        ctx?.drawImage?.(frameData, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
        const idata = ctx?.getImageData?.(0, 0, cropRect.width, cropRect.height, imageDataOptions);
        if (idata) return encode(idata);
    } else { // @ts-ignore
        const idata = new ImageData(cropRect.codedWidth, cropRect.codedHeight, imageDataOptions);
        try { frameData?.copyTo?.(idata.data, { format: "RGBA", rect: cropRect }); } catch (e) { console.warn(e); }
        return encode(idata);
    }
}

//
export async function smartCaptureAndEncode({ x, y, width, height }: cropArea) {
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
    const sx = Math.max(0, Math.round(x * scaleX));
    const sy = Math.max(0, Math.round(y * scaleY));
    const sw = Math.max(1, Math.round(width * scaleX));
    const sh = Math.max(1, Math.round(height * scaleY));

    // @ts-ignore
    const capture = new ImageCapture(track);
    const bitmap = await capture.grabFrame();
    if (!bitmap) throw new Error("No frame from processor");

    //
    const jpegArrayBuffer = await encodeWithJSquash(bitmap, { x: sx, y: sy, width: sw, height: sh }); bitmap?.close?.();
    return jpegArrayBuffer;
}

//
export const fallbackCapture = async ({ x, y, width, height }: cropArea) => {
    const shot = await captureTab(); // @ts-ignore
    if (!shot.ok) throw new Error(shot.error || "capture failed"); // @ts-ignore

    // @ts-ignore
    const bitmap = await createImageBitmap(new Blob([Uint8Array.fromBase64(shot.dataUrl?.replace?.(/^data:image\/png;base64,/, ""), { alphabet: "base64url" })]), x, y, width, height);
    const arrayBuffer = await encodeWithJSquash(bitmap, { x: 0, y: 0, width: bitmap.width, height: bitmap.height });
    bitmap?.close?.(); return arrayBuffer;
}

//
export const captureAsPossible = async ({ x, y, width, height }: cropArea) => {
    try {
        return (await smartCaptureAndEncode({ x, y, width, height }) || await fallbackCapture({ x, y, width, height }));
    } catch {
        return (await fallbackCapture({ x, y, width, height }));
    }
}
