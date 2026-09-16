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

export type LocaleBag = Record<string, unknown>;

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

function lists(
  decisions: string[],
  process: string[],
  outputs: string[],
  limitations: string[],
): Pick<LocaleCopy, "decisions" | "process" | "outputs" | "limitations"> {
  return { decisions, process, outputs, limitations };
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
    ...lists(
      [
        "Practical first: Fal.ai is the only vendor. Without a key, fake-generate mode tests the full flow instead of pretending something was generated.",
        "Worldview, characters, and the asset library enter prompts automatically so people copy-paste less.",
        "Deduct estimated points first, refund on failure. External citations stay drafts; important copy needs lead review.",
        "MCP uses revocable, expiring, personal connection keys — not a shared superadmin key as the production default.",
      ],
      [
        "Create a project and a worldview quick layer",
        "Multimodal generation (image / video / audio / text) into the asset library",
        "Storyboard order and short-video master copy",
        "Lead 3-state review",
        "Export a timeline and asset pack to an NLE",
      ],
      [
        "Public repo ai_os (the creation system)",
        "Predecessor Healing Studio multimodal studio",
        "Delivery pack: video / image / script shot list and FCP / Premiere timeline",
      ],
      [
        "The asset knowledge base (RAG) is not done.",
        "Database-layer RLS as a second isolation boundary is not done.",
        "The public deploy URL changes with the environment; this page does not claim a stable SLA or user count.",
        "Dev-time fake identities and seed accounts do not appear on this site.",
      ],
    ),
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
    ...lists(
      [
        "Each frame is a graph node: type, neighbors, character, motion, revision.",
        "Inbetween gets a Motion Plan first, then a linear-blend candidate; only bad frames are regenerated.",
        "Wan / RIFE and other GPU adapters report PROVIDER_NOT_AVAILABLE when unloaded — no fake depth or fake pose.",
        "UI, REST, and MCP share the same application commands.",
      ],
      [
        "Import a video or image sequence",
        "Mark key / breakdown / generated on the timeline",
        "Onion skin, pose ghost, motion path",
        "Box a region, then Ask / Repair",
        "Accept a candidate or regenerate only the problem window",
      ],
      [
        "A runnable workstation UI plus REST / MCP",
        "Pixel metrics (MAE, histogram, luma flicker)",
        "CPU-mode linear-blend inbetween",
      ],
      [
        "SAM 2, RTMPose, SEA-RAFT, RIFE, and Wan are adapters only — unavailable until a model is registered.",
        "Not an NLE, and not a full production pipeline export.",
        "Grok vision needs XAI_API_KEY and only frames the user sends.",
      ],
    ),
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
    ...lists(
      [
        "Area, saliency, contrast, and composition use pixel math; semantic / OCR is what goes to a vision model.",
        "Heatmaps and first-look marks are labeled estimates, not eye-tracking.",
        "Scores are computed per run; model failures go into degraded[] — no fake success.",
        "Originals are not stored permanently by default.",
      ],
      [
        "Upload a poster and pick a print purpose",
        "Geometry engine detects elements and text regions",
        "Optional semantic tags",
        "Problems and advice",
        "Before/after compare and feedback",
      ],
      [
        "Analysis JSON: elements, area ratios, readability, phone-thumb metrics",
        "REST API for later systems",
      ],
      [
        "The heatmap is not real eye-tracking.",
        "v1 feedback is stored, not self-trained.",
        "Without an API key, OCR degrades to text-region boxes.",
        "Vercel without Python falls back to a JS saliency engine.",
      ],
    ),
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
    ...lists(
      [
        "Preset-first, everything customizable. One project per event — they do not overwrite each other.",
        "AI only understands sentences and goals; coordinates, collision, aisles, and capacity are computed in code.",
        "Without a cloud key, the local structured parser still works and results are reproducible.",
        "Fire or accessibility items are design reminders; the program forbids writing “meets all codes.”",
      ],
      [
        "Pick a classroom template and headcount",
        "Place mats and zones",
        "Draw circulation",
        "Local DES queue simulation",
        "Share a run-of-show graphic and a partner read-only view",
      ],
      [
        "Installable PWA",
        "Layout / circulation / mat / work-zone / supply graphics",
        "Print with both metres and millimetres",
      ],
      [
        "No legal occupancy or egress-width calculation.",
        "Not listed on the App Store.",
        "This is pre-event rehearsal, not a live command system.",
      ],
    ),
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
    ...lists(
      [
        "The review view is always a clean original; notes are an overlay.",
        "Share links use #room + invite high-entropy secrets; the database stores only hashes.",
        "The frontend holds a publishable key only — no service role.",
        "If a cloud room cannot be created, it says sharing is unavailable — no fake-success link that only works while the host keeps the page open.",
      ],
      [
        "Upload a print version",
        "Tap a spot or circle a region to comment",
        "To-do / done",
        "Optional visual proposal layer",
        "Copy a link to LINE",
      ],
      [
        "Phone and desktop share one state, different shells",
        "Color / black-and-white / split compare",
        "Open Graph share card assembled by an Edge Function; the invite stays in the browser fragment",
      ],
      [
        "Single video upload, no resume; the cap is deliberately conservative.",
        "HEVC .mov may not play in some browsers — the page explains instead of showing a black frame.",
        "This portfolio never reads Duigao private tables or tokens.",
      ],
    ),
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
    ...lists(
      [
        "Cross-origin sites without the SDK get Live iframe or Snapshot — not a fake DOM read.",
        "MCP writes default to dry-run; unpublished documents do not appear on public /mcp/$id.",
        "Secrets stay on the server; SSRF denies intranet, localhost, and metadata.",
        "No accounts by default; drafts live in device IndexedDB.",
      ],
      [
        "Create text / shapes / components on the canvas",
        "Design checks (contrast, overflow, safe area)",
        "Optional 3-mode external site import",
        "Publish to get embed and MCP",
      ],
      [
        "Public repo canva2 (the Folio editor)",
        "folio-design-bridge v1 SDK",
        "Unit and golden-path tests recorded in the README (no usage metrics here)",
      ],
      [
        "No standalone bitmap object type; images exist as a pixel layer or Snapshot.",
        "Write tokens do not auto-expire; republish to rotate.",
        "External MCP connections live in one Node process memory and are not shared across instances.",
      ],
    ),
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
    ...lists(
      [
        "Home goes straight to the workspace; writes still check Origin and rate-limit.",
        "Without HERMES_API_URL it still opens and shows not connected.",
        "A GitHub repo URL is not MCP. The connect page probes only after a real HTTPS endpoint and token.",
        "The backend rejects browser-sent service URLs or keys.",
      ],
      [
        "Open the workspace",
        "Optionally set a Hermes connection",
        "Probe Lumen / FrameLab / Duigao MCP",
        "Hand poster, animation, and review intent to the matching tools",
      ],
      ["Public repo hermes-console", "Workspace API and readiness checks"],
      [
        "Needs persistent disk and a long-lived Node process — not a fit for stateless serverless.",
        "Contract tests are not live third-party verification.",
        "This page shows no keys, invite codes, or secrets from internal console screenshots.",
      ],
    ),
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
    ...lists(
      [
        "The response engine lives in src/lib/zen.ts; same input, same output.",
        "No network calls at all.",
        "Only public product behavior — no club lists or test accounts.",
      ],
      ["Enter one mood line", "Map intent", "Reply with a message and a breathing cue", "Retestable"],
      ["Next.js app and /api/chat", "Unit tests covering the response engine"],
      [
        "Not a large language model; it does not pretend to have long memory or multi-turn reasoning.",
        "Not tku-zen-agent (the private club document agent). This page only shows public tku-zen-ai.",
      ],
    ),
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
    decisions: project.decisions,
    process: project.process,
    outputs: project.outputs,
    limitations: project.limitations,
  };
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function listsEqual(a: unknown, b: unknown): boolean {
  const left = normalizeList(a);
  const right = normalizeList(b);
  return left.length === right.length && left.every((item, i) => item === right[i]);
}

/** Fill empty English, or English that is still a zh/row duplicate. Never clobber distinct admin copy. */
export function mergeSeedEnglish(
  existingEn: LocaleBag | undefined,
  existingZh: LocaleBag | undefined,
  seedEn: LocaleBag,
  staleValues: string[] = [],
): LocaleBag {
  const stale = new Set(staleValues.map((item) => item.trim()).filter(Boolean));
  const next: LocaleBag = { ...(existingEn ?? {}) };
  for (const [key, value] of Object.entries(seedEn)) {
    if (Array.isArray(value)) {
      const nowList = normalizeList(next[key]);
      const zhList = normalizeList(existingZh?.[key]);
      if (!nowList.length || listsEqual(nowList, zhList) || stale.has(nowList.join("\n"))) {
        next[key] = normalizeList(value);
      }
      continue;
    }
    if (typeof value !== "string") continue;
    const nowRaw = next[key];
    const zhRaw = existingZh?.[key];
    const now = typeof nowRaw === "string" ? nowRaw.trim() : "";
    const zh = typeof zhRaw === "string" ? zhRaw.trim() : "";
    if (!now || now === zh || stale.has(now)) next[key] = value;
  }
  return next;
}
