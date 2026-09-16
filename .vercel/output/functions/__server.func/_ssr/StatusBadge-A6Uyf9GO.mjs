import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as cn, u as statusLabel } from "./router-D55OF8cm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-A6Uyf9GO.js
var import_jsx_runtime = require_jsx_runtime();
var tone = {
	completed: "bg-surface-mint text-mint-deep",
	"in-progress": "bg-surface-blue text-sky",
	prototype: "bg-surface text-muted ring-1 ring-line",
	concept: "bg-surface text-muted ring-1 ring-line",
	planned: "bg-sun/30 text-ink"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-medium", tone[status]),
		children: statusLabel[status]
	});
}
//#endregion
export { StatusBadge as t };
