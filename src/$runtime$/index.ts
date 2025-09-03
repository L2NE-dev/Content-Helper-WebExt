import { ext } from "../$utils$/core";
import { createCtxItems } from "./menu";
import { enableCapture } from "./capture";
import { enableGptApi } from "./api";

//
createCtxItems(ext);
enableCapture(ext);
enableGptApi(ext);