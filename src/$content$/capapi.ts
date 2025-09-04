import { encodeWithJSquash, type cropArea } from "../$utils$/compress";

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
