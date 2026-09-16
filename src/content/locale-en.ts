import type { LocaleCopy } from "../lib/cms/schema.ts";
import { projects } from "./projects.ts";
import { site } from "./site.ts";

/** Featured slugs that must carry a real English overlay, not a zh copy. */
export const FEATURED_WORK_SLUGS = [
  "ai-director-os",
  "framelab",
  "poster-vision-ai",
  "planform",
  "duigao",
  "folio",
  "hermes-console",
  "tku-zen-ai",
] as const;

export type FeaturedWorkSlug = (typeof FEATURED_WORK_SLUGS)[number];

/** Chinese homepage overlays. Row `subhead` is already English; zh viewers should not be stuck on it. */
export const siteLocaleZh: Record<string, string> = {
  headline: site.headline,
  subhead: "以 AI 與多模態創作，設計明亮、用得上的體驗。",
  narrative: site.narrative,
  seoTitle: `${site.nameZh} · ${site.person}`,
  seoDescription: site.narrative,
};

export const siteLocaleEn: Record<string, string> = {
  headline: "Turn AI, design, and multimodal making into experiences people can actually use.",
  subhead: "Designing bright, usable experiences with AI and multimodal creativity.",
  narrative:
    "I turn AI, design, image, animation, 3D, interaction, and real workflows into digital experiences that are readable and usable.",
  seoTitle: `${site.nameEn} · Bruce Chen`,
  seoDescription:
    "I turn AI, design, image, animation, 3D, interaction, and real workflows into digital experiences that are readable and usable.",
};

function seo(title: string, summary: string): Pick<LocaleCopy, "seoTitle" | "seoDescription"> {
  return {
    seoTitle: `${title} · ${site.nameEn}`,
    seoDescription: summary,
  };
}

export const featuredProjectLocaleEn: Record<FeaturedWorkSlug, LocaleCopy> = {
  "ai-director-os": {
    title: "AI Director OS: a team creation operating system",
    subtitle: "An AI creation and collaboration OS for teams",
    summary:
      "Projects, assets, generation, storyboards, review, and delivery live in one operating system, so worldview and character cards enter generation automatically instead of being pasted as prompts.",
    problem:
      "Once multimodal work splits into image, video, audio, boards, and review, context breaks. Teams need an OS they can collaborate, review, and deliver with — not a one-shot generate page.",
    role: "Product builder / AI Director: worldview injection, the generation desk, review, and delivery.",
    ...seo(
      "AI Director OS: a team creation operating system",
      "Projects, assets, generation, storyboards, review, and delivery live in one operating system, so worldview and character cards enter generation automatically instead of being pasted as prompts.",
    ),
  },
  framelab: {
    title: "FrameLab: a visual-first frame-by-frame workstation",
    subtitle: "A visual-first AI frame-by-frame animation workstation",
    summary:
      "Not an NLE, and not a generic video-analysis site. The core is a Frame Graph, timeline, Context Engine, chat, and MCP, so a bad frame is repaired as a bad frame.",
    problem:
      "Animation problems are local. If contact breaks on F122, F100–F200 should not be regenerated. You need to see hand pops and onion skin, not a 0.72 JSON score.",
    role: "Interaction and tool design: the visual center of the workstation, timeline, repair loop, and MCP command layer.",
    ...seo(
      "FrameLab: a visual-first frame-by-frame workstation",
      "Not an NLE, and not a generic video-analysis site. The core is a Frame Graph, timeline, Context Engine, chat, and MCP, so a bad frame is repaired as a bad frame.",
    ),
  },
  "poster-vision-ai": {
    title: "Poster Vision AI: print visual QA",
    subtitle: "A visual inspection desk for posters and print",
    summary:
      "After a poster is uploaded, real pixel math plus optional Grok Vision estimates figure and title weight, then returns numbered edit advice. Gaze and heatmaps are always labeled as AI estimates.",
    problem:
      "Club and event print often feels large on the author's screen, then the headline disappears in print or as an IG thumb. The need is actionable edits, not vague aesthetic notes.",
    role: "Visual AI product design: inspection flow, purpose scoring, before/after compare, and feedback records.",
    ...seo(
      "Poster Vision AI: print visual QA",
      "After a poster is uploaded, real pixel math plus optional Grok Vision estimates figure and title weight, then returns numbered edit advice. Gaze and heatmaps are always labeled as AI estimates.",
    ),
  },
  planform: {
    title: "PLANFORM: 3D isometric event rehearsal",
    subtitle: "Event-space rehearsal · 3D isometric layout",
    summary:
      "Lay it out before you walk in. Rehearse the room, props, flow, and interaction, then hand partners a run-of-show graphic. Installable as a PWA; not listed in an app store.",
    problem:
      "Tamkang classrooms and TKU Zen tea talks, lectures, and freshman events only reveal a check-in table blocking a door, or mats too tight for the aisle, on the day. The need is layout without CAD.",
    role: "Spatial experience design and product building: presets, circulation, crowd simulation, and share graphics.",
    ...seo(
      "PLANFORM: 3D isometric event rehearsal",
      "Lay it out before you walk in. Rehearse the room, props, flow, and interaction, then hand partners a run-of-show graphic. Installable as a PWA; not listed in an app store.",
    ),
  },
  duigao: {
    title: "Duigao: club poster review",
    subtitle: "A review room for club event print",
    summary:
      "A finished poster becomes a link. Partners do not edit the original; they point at the surface. The poster is the main view, and talking is faster than editing.",
    problem:
      "Print edits scatter across LINE groups and miss both position and version. The need is phone-first review: tap a spot, say one line.",
    role: "Interaction design and product building: the phone workspace, version switching, invite permissions, and share preview.",
    ...seo(
      "Duigao: club poster review",
      "A finished poster becomes a link. Partners do not edit the original; they point at the surface. The poster is the main view, and talking is faster than editing.",
    ),
  },
  folio: {
    title: "Folio: an embeddable design editor",
    subtitle: "A focused design editor that embeds and can be driven by agents",
    summary:
      "Canvas, shortcuts, an external-site bridge, and MCP server and client share one typed command layer. There is no second document model.",
    problem:
      "Posters, social, slides, and UI drafts need a focused editor, and agents should use the same commands instead of a separate automation API.",
    role: "Creative-tool design: the command layer, design checks, publish/embed, and MCP safety bounds.",
    ...seo(
      "Folio: an embeddable design editor",
      "Canvas, shortcuts, an external-site bridge, and MCP server and client share one typed command layer. There is no second document model.",
    ),
  },
  "hermes-console": {
    title: "Hermes Console: a bright creation desk",
    subtitle: "A bright single workspace for creation intel",
    summary:
      "Open and use it — no sign-in, no email. Hermes runs tools; the Console keeps sessions, tasks, activity, and copy versions, and can attach Lumen, FrameLab, and Duigao MCP.",
    problem:
      "Agents, project folders, and tool entry points are scattered. The need is a bright desk where chat, tasks, and MCP connections stay together, and secrets never enter the browser.",
    role: "AI product and console design: a no-login workspace, connection probes, and tool entry points.",
    ...seo(
      "Hermes Console: a bright creation desk",
      "Open and use it — no sign-in, no email. Hermes runs tools; the Console keeps sessions, tasks, activity, and copy versions, and can attach Lumen, FrameLab, and Duigao MCP.",
    ),
  },
  "tku-zen-ai": {
    title: "TKU Zen AI: a local companion for a busy mind",
    subtitle: "Local zen companion for a busy mind",
    summary:
      "A small chat surface. Replies carry intent, a message, and a breathing cue. The so-called AI is a local, reproducible response engine: no API key, and no cloud model dressed up as wired.",
    problem:
      "Campus sites need a calm chat entry that can be used immediately, without sending club records or personal data into an external model.",
    role: "On-site experience design: tone, breathing cues, and a fully local response boundary.",
    ...seo(
      "TKU Zen AI: a local companion for a busy mind",
      "A small chat surface. Replies carry intent, a message, and a breathing cue. The so-called AI is a local, reproducible response engine: no API key, and no cloud model dressed up as wired.",
    ),
  },
};

export function localeEnForSlug(slug: string): LocaleCopy | undefined {
  return featuredProjectLocaleEn[slug as FeaturedWorkSlug];
}

export function localeZhFromProject(slug: string): LocaleCopy | undefined {
  const project = projects.find((item) => item.slug === slug);
  if (!project) return undefined;
  return {
    title: project.title,
    subtitle: project.subtitle,
    summary: project.summary,
    problem: project.problem,
    role: project.role,
    seoTitle: `${project.title} · ${site.nameZh}`,
    seoDescription: project.summary,
  };
}

/** Fill empty English, or English that is still a zh/row duplicate. Never clobber distinct admin copy. */
export function mergeSeedEnglish(
  existingEn: Record<string, string> | undefined,
  existingZh: Record<string, string> | undefined,
  seedEn: Record<string, string>,
  staleValues: string[] = [],
): Record<string, string> {
  const stale = new Set(staleValues.map((item) => item.trim()).filter(Boolean));
  const next: Record<string, string> = { ...(existingEn ?? {}) };
  for (const [key, value] of Object.entries(seedEn)) {
    const now = (next[key] ?? "").trim();
    const zh = (existingZh?.[key] ?? "").trim();
    if (!now || now === zh || stale.has(now)) next[key] = value;
  }
  return next;
}
