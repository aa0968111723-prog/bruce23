import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createAdminProjectFn } from "@/lib/portfolio/cms-fns";

export const Route = createFileRoute("/admin/projects/new")({
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-semibold">新增作品</h1>
      <ProjectForm
        onSave={async (value) => {
          const created = await createAdminProjectFn({ data: value });
          await navigate({ to: "/admin/projects/$id/edit", params: { id: created.id } });
        }}
      />
    </div>
  );
}
