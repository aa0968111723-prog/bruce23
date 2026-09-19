import type { ArchiveLocaleCopy, LocaleCopy } from "../lib/cms/schema.ts";
import { archiveItems } from "./archive.ts";
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

const featuredListExtras: Record<FeaturedWorkSlug, Pick<LocaleCopy, "modalities" | "stack">> = {
  "ai-director-os": {
    modalities: ["Text", "Image", "Video", "Audio", "Review flow"],
    stack: ["React", "Express", "tRPC", "Drizzle", "Postgres", "Fal.ai", "MCP"],
  },
  framelab: {
    modalities: ["Image sequence", "Timeline", "Pose ghost", "Chat", "MCP"],
    stack: ["TanStack Start", "TypeScript", "Postgres / PGLite", "FFmpeg", "MCP"],
  },
  "poster-vision-ai": {
    modalities: ["Image", "Heatmap", "OCR", "Edit advice"],
    stack: ["TanStack Start", "Python OpenCV", "YuNet", "Grok Vision", "SQLite"],
  },
  planform: {
    modalities: ["3D", "Floor plan", "Circulation", "Supply list", "Natural language"],
    stack: ["Vite", "TypeScript", "Three.js", "PWA", "localStorage / IndexedDB"],
  },
  duigao: {
    modalities: ["Image", "Video timestamps", "Annotations", "LINE share"],
    stack: ["Vite", "React", "TypeScript", "Supabase", "PWA"],
  },
  folio: {
    modalities: ["Canvas", "Design tokens", "Embed", "MCP"],
    stack: ["TypeScript", "MCP", "IndexedDB", "PGLite / Postgres"],
  },
  "hermes-console": {
    modalities: ["Chat", "Tasks", "MCP tools"],
    stack: ["TypeScript", "Node", "SQLite / Postgres", "MCP"],
  },
  "tku-zen-ai": {
    modalities: ["Text", "Breathing cue"],
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Vitest"],
  },
};

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
        "Probed 2026-09-19: ai-os-app.zeabur.app and vexlark.co both HTTP 200, title Aios. Not 502 and not paused. The team OS core flow is not verified here.",
        "The public deploy URL changes with the environment; this page does not claim a stable SLA or user count.",
        "Dev-time fake identities and seed accounts do not appear on this site.",
      ],
    ),
    ...featuredListExtras["ai-director-os"],
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
        "cabin-shale-k7q2 (Chinese) and lunar-falcon-8p2r (English) are the same FrameLab 0.4.0, not two products. The Chinese portfolio uses the Chinese public host as Live Demo.",
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
        "The public landing and /api/health are viewable. The studio needs sign-in. The lunar / cabin GitHub deploy repos are private; public source is FrameLab.",
      ],
    ),
    ...featuredListExtras.framelab,
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
    ...featuredListExtras["poster-vision-ai"],
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
        "Probed 2026-09-19: GET /version.json returns 1.0.0 commit 1b8513b. The public site is an SPA; this portfolio has not completed create-project → drag-object, so coreFlow is not passed.",
      ],
    ),
    ...featuredListExtras.planform,
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
    ...featuredListExtras.duigao,
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
    ...featuredListExtras.folio,
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
    ...featuredListExtras["hermes-console"],
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
    ...featuredListExtras["tku-zen-ai"],
    ...seo(
      "TKU Zen AI: a local companion for a busy mind",
      "A small chat surface. Replies carry intent, a message, and a breathing cue. The so-called AI is a local, reproducible response engine: no API key, and no cloud model dressed up as wired.",
    ),
  },
};

const linkedProjectLocaleEn: Record<string, LocaleCopy> = {
  "tamkang-world": {
    title: "Tamkang World",
    subtitle: "A 3D campus walk on Wuhu Hill",
    summary: "Walk Tamkang in the browser. The hill becomes a visitable campus — not a PDF tour, and not a Google Earth screenshot.",
    process: [
      "Open forge-bloom-k7xq.zeabur.app",
      "Tap Start tour",
      "WASD to move, mouse to look",
      "Open the campus atlas",
    ],
  },
  "tamsui-drama": {
    title: "Tamkang freshman quest",
    subtitle: "Campus quest · a drama world",
    summary: "Tamkang / Tamsui as a playable script. The public site is a campus quest, not FrameLab.",
    process: [
      "Open tku-tamsui-drama-world-k4x9.zeabur.app",
      "Wait for the world to load",
      "Start episode one under the lanterns",
      "Walk the campus gates",
    ],
  },
  skatehub: {
    title: "SkateHub",
    subtitle: "Toward health, toward sunlight",
    summary: "Inline-skate catalog, gear, and mileage. Public site dd-k3f9 — not Folio.",
    process: ["Open dd-k3f9.zeabur.app", "Browse gear", "Log mileage", "Return to your hub"],
  },
  "zen-studio": {
    title: "TKU Zen Studio",
    subtitle: "A bright desk for club work",
    summary: "Print, events, and daily making under one lamp — not another Drive folder.",
    process: [
      "Open delta-horizon-k7f2.zeabur.app",
      "Read today's prompt and upcoming events",
      "Start an IG post / carousel / story",
      "Edit due items on the calendar",
    ],
  },
  "focus-challenge": {
    title: "Focus challenge",
    subtitle: "60 seconds on the TKU Zen booth",
    summary:
      "Booth Stroop: register host and basics first, then two tutorial questions and a 15-second practice (not saved), then the official 60 seconds. A live game, not a psychological test, and not an activity-status dashboard.",
    problem:
      "The booth needs a 60-second game people can play on the spot. The official run still starts with host, name, department, grade, and phone — it is not tap-and-play with no form.",
    role: "Booth experience: registration, tutorial, timer, score write, and the public leaderboard.",
    process: [
      "Open leader-dna-mcp-a7k2.zeabur.app (the homepage is the registration screen)",
      "Fill host, name, department, grade, and phone before the tutorial (this portfolio does not submit that)",
      "Two tutorial questions and a 15-second practice (not scored, not saved)",
      "Start the official 60-second Stroop (POST /api/register and /api/result)",
      "See the score and the public leaderboard (masked names)",
    ],
    limitations: [
      "2026-09-19 GET /api/health returned ok, sheets true, smtp false.",
      "GET /api/leaderboard?scope=history returned 67 public rows: masked name, score, accuracy, title, time. No phone numbers or full names. Today's scope is 0 rows.",
      "The official 60-second run requires the form and writes the game sheet. This portfolio did not submit PII and has not completed an official 60-second black-box run, so coreFlow is not passed.",
    ],
  },
  lumen: {
    title: "Lumen",
    subtitle: "A multimodal voice orb in your pocket",
    summary: "Speak to design, search, and generate. Public site ai-chat-8rq3; GitHub wood-ivory-blaze-maple.",
    process: [
      "Open ai-chat-8rq3.zeabur.app",
      "Tap to listen or hold to speak",
      "Pick poster / photo / video / long task",
      "Continue from recent projects",
    ],
  },
  xiaocai: {
    title: "Xiaocai ledger",
    subtitle: "A small bright book for personal money",
    summary: "Log a line, see categories, know where the month went. Public site untitled-5.zeabur.app.",
    process: ["Open untitled-5.zeabur.app", "Log income or spend", "See categories", "See this month"],
    limitations: [
      "Public host HTTP 200, title Xiaocai ledger. The page is client-rendered; the ledger core flow is not verified here.",
      "This is not the portfolio admin.",
    ],
  },
  "tku-zen-agent": {
    title: "TKU Zen desk",
    subtitle: "Leader Zen club · Ask mode",
    summary: "A club writing and Q&A desk. Public site tku-zen-agent-k7f2 with ?mode=ask. Not the local tku-zen-ai companion.",
    process: [
      "Open tku-zen-agent-k7f2.zeabur.app/?mode=ask",
      "Without an access code you only see the sign-in gate",
      "Draft mode does not auto-publish",
      "Do not treat output as approved notices",
    ],
    limitations: [
      "Probed 2026-09-19: HTTP 200, title Tamkang Leader Zen club desk. Not 502.",
      "The desk needs an access code. Portfolio visitors cannot see club data.",
      "Not the local tku-zen-ai companion.",
    ],
  },
  cutos: {
    title: "CUTOS",
    subtitle: "Cut video by talking",
    summary: "A conversational video editor: find highlights with a sentence, see a timeline, get a cut plan.",
    process: [
      "Open cutos.zeabur.app",
      "Import one video",
      "Describe the cut in one sentence",
      "Review the Edit Plan, then apply it on a non-destructive timeline",
    ],
    limitations: [
      "Probed 2026-09-19: HTTP 200, title CUTOS — Conversational Video Editor. /api/health ok, /api/ready ready. Not 502.",
      "This portfolio has not imported a real video through import→plan→export, so coreFlow is not passed.",
    ],
  },
  "hermes-agent": {
    title: "Hermes Agent - Dashboard",
    subtitle: "Agent dashboard (sign-in required)",
    summary:
      "Nous Research Hermes Agent dashboard: sessions and the sign-in gate. Public domain hermes-agent-k7q2.zeabur.app. Unsigned visitors land on Sign in — Hermes Agent.",
    process: [
      "Open hermes-agent-k7q2.zeabur.app",
      "Unsigned visitors land on Sign in — Hermes Agent",
      "Sign in as the owner to enter the dashboard",
      "Read sessions and tool status",
    ],
  },
};

export function localeEnForSlug(slug: string): LocaleCopy | undefined {
  return featuredProjectLocaleEn[slug as FeaturedWorkSlug] ?? linkedProjectLocaleEn[slug];
}

export const ARCHIVE_ITEM_IDS = [
  "landscape-series",
  "flashmob-813",
  "tku-zen-poster",
  "tku-zen-brand-deck",
  "tku-zen-page2",
  "leader-quiz",
  "stroop-challenge",
  "graphic-portfolio",
] as const;

export type ArchiveItemId = (typeof ARCHIVE_ITEM_IDS)[number];

export const archiveLocaleEn: Record<ArchiveItemId, ArchiveLocaleCopy> = {
  "landscape-series": {
    title: "Landscapes and sunrise",
    summary:
      "Landscapes, sunrise, and river light. This is an SVG translation of light direction — not the original photo, and not a Canva embed.",
    caption: "SVG translation · not the original photo",
    alt: "A light translation of a misty river landscape — not the original photo, and not a Canva embed",
    originNote:
      "Originals come from the existing portfolio photography category (landscape / sunrise). This pass does not host large original files, and there is no public embed.",
  },
  "flashmob-813": {
    title: "813 Positive Light · old-street flash mob",
    summary:
      "Street-music flash mob: venue and performer coordination through on-site execution. The image is an SVG translation of the event atmosphere — not the original photo, and not a Canva embed.",
    caption: "SVG translation · not the original photo",
    alt: "A bright translation of an old-street flash mob — not the original photo",
    originNote:
      "Event name and role come from the existing portfolio Events page. No unauthorized portraits, and no public embed.",
  },
  "tku-zen-poster": {
    title: "TKU Zen club print",
    summary:
      "Club identity and event visuals. This site uses a local SVG translation — not a Canva embed, and it cannot page.",
    caption: "Local SVG translation · no share URL yet",
    alt: "A local SVG translation of TKU Zen club print — not a public embed",
    originNote:
      "Original is the Canva design “淡大禪學社”. There is no public share URL, so nothing embeds and nothing pages.",
  },
  "tku-zen-brand-deck": {
    title: "TKU Zen",
    summary:
      "Cover visual for club narrative and event notes. This site uses a local SVG translation. There is no public share URL, so it cannot page.",
    caption: "Local SVG translation · no share URL yet",
    alt: "A local SVG translation of the TKU Zen deck cover",
    originNote:
      "Original is the Canva deck “淡大禪學社 TKU Zen”. There is no public share URL, so nothing embeds and nothing pages.",
  },
  "tku-zen-page2": {
    title: "TKU Zen event page",
    summary:
      "An inner page of the same deck. This site uses a local SVG translation. There is no public share URL, so it cannot page.",
    caption: "Local SVG translation · no share URL yet",
    alt: "A local SVG translation of an inner TKU Zen event slide",
    originNote:
      "Original is page 2 of the same Canva deck. There is no public share URL, so nothing embeds and nothing pages.",
  },
  "leader-quiz": {
    title: "Explore your leadership traits",
    summary:
      "Ten on-site booth scenarios that map vision / empathy / decision / adaptability tendencies. This is an exploratory interaction, not a formal psychological test. The image is an SVG translation, not a Canva embed.",
    caption: "SVG translation · on-site atmosphere",
    alt: "A translation of a booth tablet and four-axis radar — not a Canva embed",
    originNote:
      "Public repo urban-green-rose-pixel. This site does not collect or display phone numbers or raffle personal data.",
  },
  "stroop-challenge": {
    title: "60-second focus challenge",
    summary:
      "Booth stroop challenge: scan, play, see a title. The leaderboard shows name / department / score only. The image here is not a live-score screenshot, and not Canva.",
    caption: "SVG translation · not a live-score screenshot",
    alt: "A light translation of the booth stroop challenge — not a live-score screenshot, and not Canva",
    originNote: "Public repo ever-marble-flora-clover. This site publishes no score data.",
  },
  "graphic-portfolio": {
    title: "Graphic design portfolio",
    summary:
      "Graphic work collected as a Google Slides deck. This is an SVG translation — not a scan of the original, and not a Canva embed.",
    caption: "SVG translation · not a scan of the original",
    alt: "A paper-and-swatch translation of the graphic portfolio — not a scan of the original, and not a Canva embed",
    originNote:
      "Drive file “平面設計作品集” is source index only; the inner folder is not public, and there is no public embed.",
  },
};

export function archiveLocaleEnForId(id: string): ArchiveLocaleCopy | undefined {
  return archiveLocaleEn[id as ArchiveItemId];
}

export function localeZhFromArchive(id: string): ArchiveLocaleCopy | undefined {
  const item = archiveItems.find((entry) => entry.id === id);
  if (!item) return undefined;
  return {
    title: item.title,
    summary: item.summary,
    caption: item.media?.caption,
    alt: item.media?.alt,
    originNote: item.originNote,
  };
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
    modalities: project.modalities,
    stack: project.stack,
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
