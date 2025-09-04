import { encode } from "@jsquash/jpeg";

//
export type cropArea = { x: number, y: number, width: number, height: number }

//
export const jpegConfig = { quality: 90, progressive: false, color_space: 2, optimize_coding: true, auto_subsample: true, baseline: true };

//
export const encodeWithJSquash = async (frameData?: VideoFrame|ImageBitmap|ImageData|null, rect?: cropArea)=>{
    if (!frameData) return null;

    //
    const imageDataOptions: ImageDataSettings = {
        colorSpace: "srgb",
    }

    // @ts-ignore
    rect ??= { x: 0, y: 0, width: frameData?.width || frameData?.codedWidth || 0, height: frameData?.height || frameData?.codedHeight || 0 };

    //
    if (frameData instanceof ImageData) {
        return encode(frameData, jpegConfig);
    } else
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
