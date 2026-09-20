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
        "The public first screen is a landing page, not Create project. Entering the workbench needs sign-in; without a group you cannot create a project.",
      ],
      [
        "Open ai-os-app.zeabur.app (title Aios · AI creation OS | turn an idea into a team plan)",
        "First screen eyebrow “A daily AI project workbench for teams”, h1 “Turn an idea into a plan the team can actually finish.”",
        "Primary CTA “Enter the workbench” goes to /login; header also has “Sign in to the workbench”",
        "Creating a project needs sign-in and a group. This portfolio did not sign in.",
      ],
      [
        "Public repo ai_os (the creation system)",
        "Predecessor Healing Studio multimodal studio",
        "Delivery pack: video / image / script shot list and FCP / Premiere timeline",
      ],
      [
        "The asset knowledge base (RAG) is not done.",
        "Database-layer RLS as a second isolation boundary is not done.",
        "Probed 2026-09-20: JS first screen is the landing h1 plus Enter the workbench → /login. /api/health ok. Not 502 and not paused. The team OS core flow is not verified here; coreFlow stays false.",
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
        "The public first screen is a landing page: “Give it keyframes. Repair only the frames that break.” The studio needs sign-in; guests cannot import or repair frames.",
      ],
      [
        "Open cabin-shale-k7q2.zeabur.app (title FrameLab)",
        "First screen subtitle “Frame-by-frame animation workstation”, h1 “Give it keyframes. Repair only the frames that break.”",
        "Primary CTA “Sign in to the studio” goes to /login; “System status” is /api/health",
        "After sign-in, the same shot becomes the sample timeline. This portfolio did not sign in, import, or repair a frame.",
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
        "Probed 2026-09-20: GET / HTTP 200, h1 “Give it keyframes. Repair only the frames that break.” Primary CTA “Sign in to the studio” → /login. /api/health FrameLab 0.4.0 RUNNING. Studio needs sign-in. This portfolio did not sign in, import a clip, or repair a frame, so coreFlow is not passed.",
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
        "Probed 2026-09-20: no public Zeabur host. README only documents local and Docker. This portfolio does not invent a Live Demo. coreFlow is not passed.",
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
        "Opening the app shows “My projects” and “+ New project”, not the 3D canvas first.",
        "Preset-first, everything customizable. One project per event — they do not overwrite each other.",
        "AI only understands sentences and goals; coordinates, collision, aisles, and capacity are computed in code.",
        "Without a cloud key, the local structured parser still works and results are reproducible.",
        "Fire or accessibility items are design reminders; the program forbids writing “meets all codes.” The live JS says the tool does not compute occupancy or egress width.",
      ],
      [
        "Open planform-iso-k7d2.zeabur.app (home is “My projects”, button “+ New project”)",
        "Create a project, then pick a Tamkang classroom template and headcount (frontend-only, localStorage)",
        "Drag objects on the canvas, or use mat layout A/B/C by headcount",
        "Draw circulation",
        "Share a run-of-show graphic and a partner read-only view (no backend API)",
      ],
      [
        "Installable PWA",
        "Layout / circulation / mat / work-zone / supply graphics",
        "Print with both metres and millimetres",
      ],
      [
        "No legal occupancy or egress-width calculation. Live JS: this tool does not compute occupancy or egress width.",
        "Not listed on the App Store.",
        "This is pre-event rehearsal, not a live command system.",
        "Probed 2026-09-19: GET / HTTP 200, title PLANFORM｜活動空間彩排. /version.json 1.0.0 (1b8513b). Live JS first screen is “My projects” and “+ New project”. No /api routes. This portfolio has not completed new-project → drag-object in a browser, so coreFlow is not passed.",
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
        "The public first screen is “What are we reviewing today?” — a space picker, not an immediate upload. Make an image / Create an event room opens a room.",
      ],
      [
        "Open duigao-k7q2.zeabur.app (title 對稿｜圖片與影片協作空間)",
        "First screen is “Start new work”, h2 “What are we reviewing today?”; pick Make an image or Create an event room",
        "On-page three steps are Upload → Share link → Finalize; this portfolio did not upload or pin-comment",
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
        "Probed 2026-09-20: GET / HTTP 200, title 對稿｜圖片與影片協作空間. Live JS first screen h2 “What are we reviewing today?” with Make an image / Create an event room. On-page steps are Upload → Share link → Finalize. Video upload needs sign-in. This portfolio did not create a room, upload a poster, or pin-comment, so coreFlow is not passed.",
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
        "Open the file cabinet (on this device, no sign-in)",
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
        "Probed 2026-09-19: GET / HTTP 200, title Folio. First screen is the file cabinet, local, no sign-in. This portfolio has not created and published a document on the public host, so coreFlow is not passed.",
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
        "Open 344.zeabur.app (no sign-in)",
        "First screen is “What do you want to do today?”, Quick start (Research / Create / Analyze), and a personal workspace",
        "Optionally open Settings and connections",
        "The portfolio conversation preview is not an Agent execution",
      ],
      ["Public repo hermes-console", "Workspace API and readiness checks"],
      [
        "Needs persistent disk and a long-lived Node process — not a fit for stateless serverless.",
        "Contract tests are not live third-party verification.",
        "This page shows no keys, invite codes, or secrets from internal console screenshots.",
        "Probed 2026-09-20: GET / HTTP 200, title Hermes. First screen h1 is “What do you want to do today?” plus Quick start (Research / Create / Analyze). This portfolio has not sent a real task, so coreFlow is not passed.",
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
        "The public chat first screen is the English welcome, not an immediate intent map. Suggestion chips match src/app/page.tsx.",
      ],
      [
        "Open the public chat page src/app/page.tsx (no public Zeabur host)",
        "First screen h1 “TKU Zen AI”, subtitle “A calm companion for a busy mind”",
        "Welcome “Welcome to TKU Zen AI. Take a breath, and share whatever is on your mind.” Breath “Inhale calm, exhale tension — three times.”",
        "Suggestion chips are the four English lines from page.tsx. This portfolio page runs the same local engine, not a cloud LLM.",
      ],
      ["Next.js app and /api/chat", "Unit tests covering the response engine"],
      [
        "Not a large language model; it does not pretend to have long memory or multi-turn reasoning.",
        "Not tku-zen-agent (the club document agent behind an access-code gate). This page only shows public tku-zen-ai.",
        "Read 2026-09-20 public src/app/page.tsx: h1 TKU Zen AI, Take a breath welcome, English suggestion chips. No public Zeabur host. This portfolio has not sent a real mood line, so coreFlow is not passed.",
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
      "Open forge-bloom-k7xq.zeabur.app (title Tamkang World)",
      "The public gate is Campus pass: guests can tour Wuhu Hill, or continue with Google / X",
      "Tap Tour as guest to return to the 3D home",
    ],
    limitations: [
      "GitHub forge-bloom-quiet-falcon is public (unauthenticated private:false on 2026-09-20).",
      "Performance depends on the device; this is not a full digital twin.",
      "Probed 2026-09-19: GET / HTTP 200, title Tamkang World. Description lists Kenan Slope, lantern avenue, maritime museum, and Chueh-sheng Library. og: a 3D campus walk on Wuhu Hill.",
      "GET /login HTTP 200, h1 Campus pass. Guests can tour; sign-in saves stamps. Public JS has no Start tour, campus atlas, or WASD. This portfolio has not finished a guest 3D walk, so coreFlow is not passed.",
    ],
  },
  "tamsui-drama": {
    title: "Tamkang freshman quest",
    subtitle: "Campus quest · a drama world",
    summary: "Tamkang / Tamsui as a playable script. The public site is a campus quest, not FrameLab.",
    process: [
      "Open tku-tamsui-drama-world-k4x9.zeabur.app",
      "Title is Tamkang freshman quest — Anjie's campus gates",
      "First screen is Loading the Tamkang · Tamsui world…",
      "Public JS describes lantern avenue, the library, and Ching-Sheng Hall",
    ],
    limitations: [
      "Probed 2026-09-19: GET / HTTP 200, title 淡江新生導覽 — 安倢的校園闖關. HTML first screen is Loading the Tamkang · Tamsui world… Public JS has no 第一集. This portfolio has not finished the quest, so coreFlow is not passed.",
    ],
  },
  skatehub: {
    title: "SkateHub",
    subtitle: "Toward health, toward sunlight",
    summary: "Inline-skate catalog, gear, and mileage. Public site dd-k3f9 — not Folio.",
    process: ["Open dd-k3f9.zeabur.app", "Browse gear", "Log mileage", "Return to your hub"],
    limitations: [
      "Probed 2026-09-19: GET / HTTP 200, title SkateHub｜Toward health, toward sunlight. JS slogan catalogs gear and mileage. No sign-in shell. This portfolio has not logged real mileage, so coreFlow is not passed.",
    ],
  },
  "zen-studio": {
    title: "TKU Zen Studio",
    subtitle: "A bright desk for club work",
    summary: "Print, events, and daily making under one lamp — not another Drive folder.",
    process: [
      "Open delta-horizon-k7f2.zeabur.app",
      "First screen is “What can we make today?”",
      "Read upcoming events and AI suggestions",
      "Due items have no reviewer; opening the studio auto-publishes them",
    ],
    limitations: [
      "Probed 2026-09-19: GET / HTTP 200, title 禪學社 Studio. First screen is What can we make today? The page says due items auto-publish with no reviewer. This portfolio has not generated a post, so coreFlow is not passed.",
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
    limitations: [
      "Probed 2026-09-19: GET / HTTP 200, title Lumen. First screen is What do you want to do? / tap to listen. This portfolio has not held-to-speak, so coreFlow is not passed.",
    ],
  },
  xiaocai: {
    title: "Xiaocai ledger",
    subtitle: "A small bright book for personal money",
    summary: "Log a line, see categories, know where the month went. Public site untitled-5.zeabur.app.",
    process: [
      "Open untitled-5.zeabur.app",
      "First screen says tap to log a line quickly",
      "It can log offline on the device",
      "Sign-in syncs to the account",
    ],
    limitations: [
      "Probed 2026-09-20: HTTP 200, title Xiaocai ledger. JS first screen: tap to log a line. Offline works; sign-in syncs. This portfolio has not logged a real line, so coreFlow is not passed.",
      "This is not the portfolio admin.",
    ],
  },
  "tku-zen-agent": {
    title: "TKU Zen desk",
    subtitle: "Leader Zen club · Ask mode",
    summary: "A club writing and Q&A desk. Public site tku-zen-agent-k7f2 with ?mode=ask. Not the local tku-zen-ai companion.",
    process: [
      "Open tku-zen-agent-k7f2.zeabur.app/?mode=ask (title Tamkang Leader Zen club desk)",
      "GET /api/auth returns mode=token, authenticated=false; GET /api/health is 401 Please enter an access code",
      "Unsigned first screen: h1 Tamkang Leader Zen club, Enter access code, Enter the desk",
      "The one-sentence workbench is after auth; this portfolio did not enter a code",
    ],
    limitations: [
      "Probed 2026-09-20: GET / HTTP 200. /api/auth mode=token authenticated=false. Not 502.",
      "The desk needs an access code. Portfolio visitors cannot see club data, so coreFlow is not passed.",
      "The unsigned probe did not reach Start with one sentence.",
      "Repository metadata conflicts with the repo's own privacy rules. The source link is withheld pending owner visibility and content review; this site does not copy source documents or rosters.",
      "Not the local tku-zen-ai companion.",
    ],
  },
  cutos: {
    title: "CUTOS",
    subtitle: "Cut video by talking",
    summary: "A conversational video editor: find highlights with a sentence, see a timeline, get a cut plan.",
    process: [
      "Open cutos.zeabur.app",
      "First screen product line is Conversational Video Editor; main block is Import video — load the demo clip or upload",
      "Describe the cut in one sentence",
      "Review the Edit Plan, then apply it on a non-destructive timeline",
    ],
    limitations: [
      "Probed 2026-09-20: HTTP 200, title CUTOS — Conversational Video Editor. First screen product line AI 對話式影片剪輯; main block Import video with Load demo clip / Upload. /api/health ok.",
      "This portfolio has not loaded the demo clip or uploaded a real video, so coreFlow is not passed.",
    ],
  },
  "hermes-agent": {
    title: "Hermes Agent - Dashboard",
    subtitle: "Agent dashboard (sign-in required)",
    summary:
      "Nous Research Hermes Agent dashboard: sessions and the sign-in gate. Public domain hermes-agent-k7q2.zeabur.app. Unsigned visitors land on Sign in — Hermes Agent.",
    process: [
      "Open hermes-agent-k7q2.zeabur.app (unsigned visitors redirect to /login)",
      "Title is Sign in — Hermes Agent; h1 Sign in; Username & Password",
      "Only the owner can sign in to the dashboard",
      "This portfolio does not submit credentials, so sessions stay hidden",
    ],
    limitations: [
      "Sign-in required. Portfolio visitors cannot see dashboard contents.",
      "Probed 2026-09-20: GET / redirects to /login?next=/, HTTP 200, title Sign in — Hermes Agent. h1 Sign in. Username & Password. This portfolio did not sign in, so coreFlow is not passed.",
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
