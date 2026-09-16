import type { Sql } from "../db";
import { parseGithubRepoUrl } from "@/lib/github/parse";
import { diffGithubFields, fetchPublicGithubSnapshot } from "@/lib/github/client";
import { githubHttp } from "./github-http.server";
import { getAdminProject } from "./queries";

export async function previewGithubForProject(sql: Sql, id: string) {
  const project = await getAdminProject(sql, id);
  if (!project) throw new Error("找不到專案");
  const parsed = parseGithubRepoUrl(project.githubUrl);
  if (!parsed) throw new Error("尚未設定有效 GitHub 網址");
  const http = await githubHttp(sql);
  const result = await fetchPublicGithubSnapshot(parsed.owner, parsed.repo, http);
  if (!result.ok) {
    return {
      ok: false as const,
      error: result.error,
      rateLimited: result.rateLimited,
      lastSync: project.githubLastSyncedAt,
      changes: [] as Array<{ field: string; from: unknown; to: unknown }>,
    };
  }
  const changes = diffGithubFields(
    {
      github_branch: project.githubBranch,
      github_metadata: project.githubMetadata,
      github_languages: project.githubLanguages,
      github_topics: project.githubTopics,
      github_latest_commit: project.githubLatestCommit,
      github_readme: project.githubReadme,
      github_is_private: project.githubIsPrivate,
    },
    result.snapshot,
  );
  return {
    ok: true as const,
    snapshot: result.snapshot,
    changes,
    lastSync: project.githubLastSyncedAt,
    narrativeUntouched: true as const,
  };
}

export async function applyGithubForProject(sql: Sql, id: string, actor: string) {
  const preview = await previewGithubForProject(sql, id);
  if (!preview.ok) {
    await sql.query(
      `update projects set github_sync_status='failed', updated_at=now(), updated_by=$2 where id=$1`,
      [id, actor],
    );
    return preview;
  }
  const snap = preview.snapshot;
  const status = snap.isPrivate ? "connected" : "verified";
  await sql.query(
    `update projects set
      github_owner=$2, github_repo=$3, github_branch=$4,
      github_metadata=$5::jsonb, github_readme=$6, github_file_tree=$7::jsonb,
      github_languages=$8::jsonb, github_topics=$9::jsonb, github_latest_commit=$10::jsonb,
      github_is_private=$11, github_sync_status=$12, github_last_synced_at=now(),
      updated_at=now(), updated_by=$13
     where id=$1`,
    [
      id,
      snap.owner,
      snap.repo,
      snap.defaultBranch,
      JSON.stringify({
        description: snap.description,
        homepage: snap.homepage,
        updated_at: snap.updatedAt,
        html_url: snap.htmlUrl,
        archived: snap.archived,
      }),
      snap.readme,
      JSON.stringify(snap.fileTree),
      JSON.stringify(snap.languages),
      JSON.stringify(snap.topics),
      JSON.stringify(snap.latestCommit),
      snap.isPrivate,
      status,
      actor,
    ],
  );
  return { ok: true as const, status };
}
