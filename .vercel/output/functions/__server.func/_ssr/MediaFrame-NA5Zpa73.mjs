import { i as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ImageOff } from "../_libs/lucide-react.mjs";
import { r as cn } from "./router-D55OF8cm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MediaFrame-NA5Zpa73.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MediaFrame({ media, className, priority = false }) {
	const [errored, setErrored] = (0, import_react.useState)(false);
	if (errored) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-surface-blue text-muted", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, {
			className: "size-7",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-4 text-center text-sm",
			children: media.alt
		})]
	});
	if (media.kind === "video") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("video", {
		className: cn("aspect-video w-full object-cover", className),
		controls: true,
		playsInline: true,
		preload: "metadata",
		poster: media.poster,
		onError: () => setErrored(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", { src: media.src }), "你的瀏覽器無法播放這段影片。"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: media.src,
		alt: media.alt,
		loading: priority ? "eager" : "lazy",
		decoding: "async",
		className: cn("h-full w-full object-cover", className),
		onError: () => setErrored(true)
	});
}
//#endregion
export { MediaFrame as t };
