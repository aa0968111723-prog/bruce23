import type { Project } from "../../content/types";
import { archiveItems } from "../../content/archive";
import { projects } from "../../content/projects";
import { site } from "../../content/site";
import type { ExperienceMode } from "./schema";
import { parseGithubRepoUrl } from "../github/parse";

export const SEED_NAME = "portfolio-cms-v1";

export type ExperienceSeed = {
  mode: ExperienceMode;
  config: Record<string, unknown>;
  steps: unknown[];
};

export const EXPERIENCE_BY_SLUG: Record<string, ExperienceSeed> = {
  "ai-director-os": {
    mode: "process-map",
    config: {
      label: "作品集互動展示",
      honestNote: "沒有把完整產品嵌進來。節點對應公開 README 的真實流程與目錄。",
      nodes: [
        { id: "project", label: "專案", path: "client/", stage: "建立專案與世界觀快速層" },
        { id: "world", label: "世界觀", path: "shared/", stage: "logline／調性自動注入提示詞" },
        { id: "assets", label: "素材", path: "assets-src/", stage: "成品自動入素材庫" },
        { id: "gen", label: "生成", path: "server/", stage: "Fal queue；無金鑰為假生成模式" },
        { id: "storyboard", label: "分鏡", path: "docs/product/", stage: "排序與短影音母版" },
        { id: "review", label: "審批", path: "server/", stage: "三態機：送審／通過／退回" },
        { id: "deliver", label: "交付", path: "server/services/jianying.ts", stage: "時間軸與素材包" },
      ],
    },
    steps: [
      "建立專案與世界觀",
      "多模態生成並入庫",
      "分鏡排序",
      "組長審批",
      "匯出交付包",
    ],
  },
  framelab: {
    mode: "timeline",
    config: {
      label: "作品集互動展示 · CPU 模式",
      honestNote: "這是作品集時間軸，不是線上 FrameLab。Wan / RIFE 在來源 README 標為 PROVIDER_NOT_AVAILABLE。",
      frames: 24,
      problemFrames: [12, 13],
      demo: "classic-ball",
    },
    steps: ["匯入或載入示範球", "標記 key / breakdown / generated", "onion skin 比較", "點問題幀看修復概念"],
  },
  "poster-vision-ai": {
    mode: "image-comparison",
    config: {
      label: "像素推估 · 不是眼動儀",
      honestNote: "熱圖是對比與面積的演算法推估。沒有把 Grok Vision 或 OpenCV 服務假裝連上。",
      samples: ["/media/covers/poster-vision-ai.jpg", "/media/archive/tku-zen-poster.jpg"],
    },
    steps: ["選樣本或上傳", "看區域與對比", "讀限制"],
  },
  planform: {
    mode: "spatial-preview",
    config: {
      label: "等角場佈預覽",
      honestNote: "本頁不做容留人數或避難寬度法定計算，也不宣稱符合法規。",
      room: { w: 9, d: 7, name: "教室模板" },
    },
    steps: ["旋轉視角", "點物件看用途與尺寸", "看動線"],
  },
  duigao: {
    mode: "image-comparison",
    config: {
      label: "對稿註記層",
      honestNote: "示範註記不連對稿私人資料表。看稿是乾淨原稿，意見是覆蓋層。",
      versions: ["初稿", "改一"],
    },
    steps: ["點位置", "切版本", "對照"],
  },
  folio: {
    mode: "github-explorer",
    config: {
      label: "Folio 來源瀏覽",
      honestNote: "沒有在作品集內嵌完整編輯器。Canva 原作需管理員填入公開分享連結。",
    },
    steps: ["看 GitHub 目錄", "開原始檔"],
  },
  "hermes-console": {
    mode: "github-explorer",
    config: {
      label: "工作區來源",
      honestNote: "GitHub 倉庫網址不是 MCP。未設定 HERMES_API_URL 時產品應顯示尚未連線，本頁不假裝已連上。",
    },
    steps: ["看 README 摘要", "開儲存庫"],
  },
  "tku-zen-ai": {
    mode: "conversation-preview",
    config: {
      label: "本地禪意引擎",
      honestNote: "回覆來自本站移植的確定性引擎，不是雲端 LLM，也沒有把社團名冊送出。",
      engine: "local-zen",
    },
    steps: ["輸入一句話", "看意圖與呼吸提示"],
  },
};

export function defaultExperience(slug: string, project: Project): ExperienceSeed {
  if (EXPERIENCE_BY_SLUG[slug]) return EXPERIENCE_BY_SLUG[slug];
  if (project.links.live) {
    return {
      mode: "live-demo",
      config: { label: "公開網址（狀態可能變動）" },
      steps: [],
    };
  }
  return { mode: "media-gallery", config: {}, steps: [] };
}

export function seedProjectValues(project: Project, index: number) {
  const parsed = project.links.github ? parseGithubRepoUrl(project.links.github) : null;
  const exp = defaultExperience(project.slug, project);
  const demoUrl = project.links.live ?? project.links.demo ?? null;
  return {
    id: `proj_${project.slug}`,
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle,
    summary: project.summary,
    problem: project.problem,
    role: project.role,
    decisions: project.decisions,
    modalities: project.modalities,
    process: project.process,
    outputs: project.outputs,
    stack: project.stack,
    limitations: project.limitations,
    category: project.category,
    year: project.year,
    product_status: project.status,
    publication_status: "published" as const,
    featured: project.featured,
    sort_order: index,
    media: project.media,
    github_url: parsed?.htmlUrl ?? project.links.github ?? null,
    github_owner: parsed?.owner ?? null,
    github_repo: parsed?.repo ?? null,
    github_branch: parsed ? "main" : null,
    github_sync_enabled: Boolean(parsed),
    github_sync_status: parsed ? "pending" : "not_configured",
    github_public_approved: true,
    live_demo_url: demoUrl,
    live_demo_label: demoUrl ? "公開網址（狀態可能變動）" : null,
    live_demo_type: demoUrl ? "link" : "none",
    live_demo_embed_enabled: false,
    live_demo_status: demoUrl ? "pending" : "not_configured",
    experience_mode: exp.mode,
    experience_config: exp.config,
    interaction_steps: exp.steps,
    source_evidence: project.sourceReferences.map((ref) => ({
      label: ref.label,
      href: ref.href,
      note: ref.note,
      kind: "github" as const,
    })),
  };
}

export function seedSite() {
  return {
    profile: {
      nameZh: site.nameZh,
      nameEn: site.nameEn,
      person: site.person,
      role: site.role,
      headline: site.headline,
      subhead: site.subhead,
      narrative: site.narrative,
      email: site.email,
      github: site.github,
      location: site.location,
    },
    homepage: {
      explorationTitle: "從模態走進作品",
      explorationBody:
        "圖像、影片、空間、文宣、互動各自連到真實專案。不是裝飾節點。",
    },
    seo: {
      title: `${site.nameZh} · ${site.person}`,
      description: site.headline,
    },
  };
}

export { projects as seedProjects, archiveItems as seedArchive };
