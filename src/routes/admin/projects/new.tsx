import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createProjectFn } from "@/lib/cms/admin-fn";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dirty = Boolean(title.trim() || slug.trim());

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  return (
    <form
      className="grid max-w-lg gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void createProjectFn({
          data: {
            slug,
            title,
            subtitle: "",
            category: "AI Product",
            year: String(new Date().getFullYear()),
            product_status: "prototype",
            publication_status: "draft",
            featured: false,
            sort_order: 99,
            summary: "",
            problem: "",
            role: "",
            decisions: [],
            modalities: [],
            process: [],
            outputs: [],
            stack: [],
            limitations: [],
            media: [],
            locale_json: {},
            github_sync_enabled: true,
            github_sync_status: "not_configured",
            live_demo_embed_enabled: false,
            live_demo_status: "not_configured",
            canva_status: "not_configured",
            experience_config: {},
            interaction_steps: [],
            source_evidence: [],
          },
        })
          .then((created) =>
            navigate({ to: "/admin/projects/$id/edit", params: { id: created.id } }),
          )
          .catch((err: unknown) => setError(err instanceof Error ? err.message : "建立失敗"));
      }}
    >
      <h1 className="font-display text-3xl">新增作品</h1>
      {dirty ? <p className="text-sm text-muted">有未儲存的修改。</p> : null}
      {error ? <p className="text-sm text-alert">{error}</p> : null}
      <label className="grid gap-1 text-sm">
        標題
        <input className="min-h-11 rounded-xl border border-line px-3" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">
        slug
        <input className="min-h-11 rounded-xl border border-line px-3" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-mint text-sm font-semibold text-primary-foreground">
        建立草稿
      </button>
    </form>
  );
}
