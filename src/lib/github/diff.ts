export type GithubComparable = {
  github_url?: string | null;
  github_owner?: string | null;
  github_repo?: string | null;
  github_branch?: string | null;
  github_sync_status?: string | null;
  github_readme?: string | null;
  github_file_tree?: Array<{ path: string; type: string }> | null;
  github_languages?: Record<string, number> | null;
  github_topics?: string[] | null;
  github_latest_commit?: { sha?: string; message?: string } | null;
  github_metadata?: {
    name?: string;
    description?: string | null;
    homepage?: string | null;
    defaultBranch?: string;
    updatedAt?: string;
    language?: string | null;
    private?: boolean;
    archived?: boolean;
  } | null;
};

export type GithubDiffRow = {
  field: string;
  label: string;
  current: string;
  incoming: string;
  changed: boolean;
};

/** Owner Chinese narrative is never part of a GitHub sync diff. */
export const NARRATIVE_FIELDS_NEVER_SYNCED = [
  "title",
  "subtitle",
  "summary",
  "problem",
  "role",
  "decisions",
  "modalities",
  "process",
  "outputs",
  "limitations",
  "media",
  "locale_json",
  "seo_title",
  "seo_description",
  "experience_mode",
  "experience_config",
  "interaction_steps",
] as const;

function text(value: unknown): string {
  if (value == null || value === "") return "（空）";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function readmePreview(value: string | null | undefined): string {
  if (!value) return "（空）";
  const compact = value.replace(/\s+/g, " ").trim();
  return `${compact.slice(0, 80)}${compact.length > 80 ? "…" : ""} · ${value.length} 字`;
}

function treeSummary(tree: GithubComparable["github_file_tree"]): string {
  if (!tree?.length) return "（空）";
  const files = tree.filter((item) => item.type === "file" || item.type === "blob").length;
  return `${tree.length} 筆（約 ${files} 檔）`;
}

function langSummary(languages: GithubComparable["github_languages"]): string {
  if (!languages) return "（空）";
  const keys = Object.keys(languages);
  if (keys.length === 0) return "（空）";
  return keys
    .sort((a, b) => (languages[b] ?? 0) - (languages[a] ?? 0))
    .slice(0, 6)
    .join(", ");
}

export function githubSyncDiff(current: GithubComparable, incoming: GithubComparable): GithubDiffRow[] {
  const rows: GithubDiffRow[] = [
    {
      field: "github_url",
      label: "儲存庫 URL",
      current: text(current.github_url),
      incoming: text(incoming.github_url),
      changed: text(current.github_url) !== text(incoming.github_url),
    },
    {
      field: "github_owner",
      label: "Owner",
      current: text(current.github_owner),
      incoming: text(incoming.github_owner),
      changed: text(current.github_owner) !== text(incoming.github_owner),
    },
    {
      field: "github_repo",
      label: "Repo",
      current: text(current.github_repo),
      incoming: text(incoming.github_repo),
      changed: text(current.github_repo) !== text(incoming.github_repo),
    },
    {
      field: "github_branch",
      label: "預設分支",
      current: text(current.github_branch ?? current.github_metadata?.defaultBranch),
      incoming: text(incoming.github_branch ?? incoming.github_metadata?.defaultBranch),
      changed:
        text(current.github_branch ?? current.github_metadata?.defaultBranch) !==
        text(incoming.github_branch ?? incoming.github_metadata?.defaultBranch),
    },
    {
      field: "description",
      label: "GitHub description",
      current: text(current.github_metadata?.description),
      incoming: text(incoming.github_metadata?.description),
      changed: text(current.github_metadata?.description) !== text(incoming.github_metadata?.description),
    },
    {
      field: "homepage",
      label: "GitHub homepage",
      current: text(current.github_metadata?.homepage),
      incoming: text(incoming.github_metadata?.homepage),
      changed: text(current.github_metadata?.homepage) !== text(incoming.github_metadata?.homepage),
    },
    {
      field: "languages",
      label: "語言",
      current: langSummary(current.github_languages),
      incoming: langSummary(incoming.github_languages),
      changed: langSummary(current.github_languages) !== langSummary(incoming.github_languages),
    },
    {
      field: "topics",
      label: "Topics",
      current: text(current.github_topics?.join(", ")),
      incoming: text(incoming.github_topics?.join(", ")),
      changed: text(current.github_topics?.join(", ")) !== text(incoming.github_topics?.join(", ")),
    },
    {
      field: "latest_commit",
      label: "最新提交",
      current: current.github_latest_commit?.sha
        ? `${current.github_latest_commit.sha.slice(0, 7)} ${current.github_latest_commit.message ?? ""}`.trim()
        : "（空）",
      incoming: incoming.github_latest_commit?.sha
        ? `${incoming.github_latest_commit.sha.slice(0, 7)} ${incoming.github_latest_commit.message ?? ""}`.trim()
        : "（空）",
      changed: (current.github_latest_commit?.sha ?? "") !== (incoming.github_latest_commit?.sha ?? ""),
    },
    {
      field: "file_tree",
      label: "檔案樹",
      current: treeSummary(current.github_file_tree),
      incoming: treeSummary(incoming.github_file_tree),
      changed: treeSummary(current.github_file_tree) !== treeSummary(incoming.github_file_tree),
    },
    {
      field: "readme",
      label: "README 摘要",
      current: readmePreview(current.github_readme),
      incoming: readmePreview(incoming.github_readme),
      changed: (current.github_readme ?? "") !== (incoming.github_readme ?? ""),
    },
    {
      field: "sync_status",
      label: "探測狀態",
      current: text(current.github_sync_status),
      incoming: text(incoming.github_sync_status),
      changed: text(current.github_sync_status) !== text(incoming.github_sync_status),
    },
  ];
  return rows;
}
