import { resolve } from "node:path";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.json" with { type: "json" };

//
export const __dirname = resolve(import.meta.dirname, "./");
export default {
	plugins: [
		crx({ manifest: defineManifest(manifest as any) }),
	],
	server: {
		port: 5173,
		open: false,
		origin: "http://localhost:5173",
	},
	build: {
		chunkSizeWarningLimit: 1600,
		assetsInlineLimit: 1024 * 1024,
		minify: false,//"terser",
		sourcemap: "hidden",
		target: "esnext",
	},
	css: {
		scss: {
			api: "modern",
		},
		preprocessorOptions: {
			scss: {
			},
		},
	},
};
