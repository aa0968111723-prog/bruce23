import { b as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as Globe, s as Github, u as ArrowLeft } from "./_libs/lucide-react.mjs";
import { l as projects, n as Route } from "./_ssr/router-D55OF8cm.mjs";
import { t as MediaFrame } from "./_ssr/MediaFrame-NA5Zpa73.mjs";
import { t as StatusBadge } from "./_ssr/StatusBadge-A6Uyf9GO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-D5AEh347.js
var import_jsx_runtime = require_jsx_runtime();
function CaseStudy() {
	const project = Route.useLoaderData();
	const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto w-full max-w-4xl px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/work",
				className: "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "作品總覽"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-medium tracking-wide text-muted",
							children: [
								project.category,
								" · ",
								project.year
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: project.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl font-semibold sm:text-5xl",
						children: project.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-lg text-muted",
						children: project.subtitle
					})
				]
			}),
			project.media[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
				className: "mt-8 overflow-hidden rounded-2xl shadow-float",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaFrame, {
					media: project.media[0],
					priority: true,
					className: "aspect-[4/3]"
				}), project.media[0].caption ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
					className: "bg-surface-blue px-4 py-3 text-xs text-muted",
					children: project.media[0].caption
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 grid gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: "一句話",
						children: project.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: "問題",
						children: project.problem
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: "我的角色",
						children: project.role
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "設計決策",
						items: project.decisions
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "AI 使用方式 / 多模態",
						items: project.modalities
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "流程",
						items: project.process
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "產出",
						items: project.outputs
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "技術",
						items: project.stack
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "限制與尚未完成",
						items: project.limitations
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 flex flex-wrap gap-3",
				children: [
					project.links.github ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: project.links.github,
						className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg",
						rel: "noreferrer",
						target: "_blank",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-4" }), "GitHub"]
					}) : null,
					project.links.live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: project.links.live,
						className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 text-sm font-medium shadow-card",
						rel: "noreferrer",
						target: "_blank",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4" }), "公開網址（狀態可能變動）"]
					}) : null,
					project.links.demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: project.links.demo,
						className: "inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground",
						rel: "noreferrer",
						target: "_blank",
						children: "Demo"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "資料來源"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: project.sourceReferences.map((ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-muted",
						children: [ref.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: ref.href,
							className: "text-mint-deep",
							rel: "noreferrer",
							target: "_blank",
							children: ref.label
						}) : ref.label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" — ", ref.note] })]
					}, ref.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14 border-t border-line pt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "其他作品"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3",
					children: others.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/work/$slug",
						params: { slug: item.slug },
						className: "flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: item.subtitle
						})] })
					}) }, item.slug))
				})]
			})
		]
	});
}
function Block({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-xl font-semibold",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-[0.95rem] leading-relaxed text-ink/85",
		children
	})] });
}
function ListBlock({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-xl font-semibold",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-3 grid gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "rounded-xl bg-surface-blue/70 px-4 py-3 text-sm leading-relaxed text-ink/85",
			children: item
		}, item))
	})] });
}
//#endregion
export { CaseStudy as component };
