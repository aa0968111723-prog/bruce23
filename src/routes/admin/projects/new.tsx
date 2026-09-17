import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { createAdminProject } from "@/lib/portfolio/server-admin";
import { projectWriteSchema } from "@/lib/portfolio/schema";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  return (
    <form
      className="grid max-w-lg gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          const parsed = projectWriteSchema.parse({
            slug,
            title,
            subtitle: "",
            category: "AI Product",
            year: String(new Date().getFullYear()),
            product_status: "prototype",
            publication_status: "draft",
            featured: false,
            sort_order: 80,
            summary: "",
          });
          const created = await createAdminProject({ data: parsed });
          toast.success("草稿已建立");
          if (created?.id) {
            await navigate({
              to: "/admin/projects/$id/edit",
              params: { id: String(created.id) },
            });
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "建立失敗");
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">新增作品</h1>
      <label className="grid gap-1 text-sm">
        Slug
        <input
          required
          className="min-h-11 rounded-xl border border-line px-3"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        標題
        <input
          required
          className="min-h-11 rounded-xl border border-line px-3"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-mint text-sm font-semibold text-primary-foreground"
      >
        建立草稿
      </button>
    </form>
  );
}
