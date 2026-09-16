import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as ArrowRight, s as Github } from "../_libs/lucide-react.mjs";
import { a as processSteps, c as featuredProjects, i as modalities, o as site, r as cn } from "./router-D55OF8cm.mjs";
import { t as MediaFrame } from "./MediaFrame-NA5Zpa73.mjs";
import { t as ProjectCard } from "./ProjectCard-BEjR6pWl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D9aKPiLP.js
var import_jsx_runtime = require_jsx_runtime();
function LightField({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": "true",
		className: cn("pointer-events-none absolute inset-0 overflow-hidden", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orb drift absolute -left-16 top-10 size-64 rounded-full bg-mint/40 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orb drift absolute right-[-4rem] top-24 size-72 rounded-full bg-sky/35 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orb absolute bottom-10 left-1/3 size-40 rounded-full bg-sun/35 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orbit absolute left-1/2 top-20 size-80 -translate-x-1/2 rounded-full border border-line/70" })
		]
	});
}
function Home() {
	const featured = featuredProjects();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LightField, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium tracking-wide text-mint-deep",
						children: [
							site.nameEn,
							" · ",
							site.person
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl",
						children: site.headline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-lg text-base text-muted sm:text-lg",
						children: site.subhead
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-lg text-sm text-ink/80",
						children: site.narrative
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/work",
							className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-semibold text-primary-foreground shadow-card transition-transform duration-150 active:scale-[0.96]",
							children: ["看精選作品", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "inline-flex min-h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold text-ink shadow-card transition-transform duration-150 active:scale-[0.96]",
							children: "關於定位"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 flex flex-wrap gap-2 text-xs font-medium text-muted",
						children: [
							"AI Designer",
							"Multimodal",
							"Product Builder",
							"Interaction"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full bg-surface px-3 py-1.5 shadow-card",
							children: item
						}, item))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto w-full max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "float-card overflow-hidden rounded-2xl bg-surface p-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-[1.15rem]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/media/hero/light-lab.jpg",
								alt: "光域 AI 創作實驗室：晨光中漂浮的玻璃展品卡片",
								className: "aspect-[16/10] w-full object-cover",
								width: 1792,
								height: 1008
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center text-xs text-muted",
						children: "作品像漂在光場裡的展品。圖為工作室視覺，不是截圖。"
					})]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-6xl px-4 py-16 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-8 flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-semibold",
						children: "精選作品"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted",
						children: "只放最能代表定位的 8 件。狀態按真實進度標示，沒有使用者數或成效數字。"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/work",
						className: "inline-flex min-h-11 items-center text-sm font-medium text-mint-deep",
						children: "全部作品"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-5 md:grid-cols-2",
					children: featured.slice(0, 2).map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, {
						project,
						featured: true
					}, project.slug))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: featured.slice(2).map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project }, project.slug))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-surface-mint/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-semibold",
						children: "AI 創作流程"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "導演不是堆模型。先現場、再模態、再工具，最後問：這東西能不能被使用。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 overflow-hidden rounded-2xl shadow-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaFrame, {
							media: {
								src: "/media/hero/modalities.jpg",
								alt: "文字、圖像、影片、聲音與 3D 以光絲連在白桌上",
								kind: "image"
							},
							className: "aspect-[16/10] w-full object-cover"
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid gap-4 sm:grid-cols-2",
					children: processSteps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-surface p-5 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm text-mint-deep",
								children: step.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-lg font-semibold",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: step.body
							})
						]
					}, step.n))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto w-full max-w-6xl px-4 py-16 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-semibold",
					children: "多模態能力"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm text-muted",
					children: "不是六個開關全開。每件作品只使用它真正接上的模態，沒接上的會寫在限制裡。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: modalities.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-surface p-5 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-semibold",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: item.note
						})]
					}, item.label))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-line/80 bg-surface-blue/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-semibold",
					children: "公開簡介"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 max-w-xl text-sm text-muted",
					children: [site.role, "。GitHub 是專案真實性來源。本站不放電話、住址或內部帳號。"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: site.github,
						className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg",
						rel: "noreferrer",
						target: "_blank",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-4" }), "GitHub"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${site.email}`,
						className: "inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium shadow-card",
						children: site.email
					})]
				})]
			})
		})
	] });
}
//#endregion
export { Home as component };
