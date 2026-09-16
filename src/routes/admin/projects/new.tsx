import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { createProjectFn } from "@/lib/cms/admin-fns";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const created = await createProjectFn({
            data: {
              slug,
              title,
              category: "AI Product",
              product_status: "prototype",
              experience_mode: "media-gallery",
              subtitle: "",
              summary: "",
            },
          });
          toast.success("草稿已建立");
          if (created) {
            await navigate({ to: "/admin/projects/$id/edit", params: { id: created.id } });
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "建立失敗");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">新增作品</h1>
      <label className="block text-sm">
        Slug
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="block text-sm">
        標題
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        儲存草稿
      </button>
    </form>
  );
}
