import { Navigate, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/projects/$id")({
  component: ProjectIdLayout,
});

function ProjectIdLayout() {
  const { id } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalized = pathname.replace(/\/$/, "");
  if (normalized === `/admin/projects/${id}`) {
    return <Navigate to="/admin/projects/$id/edit" params={{ id }} />;
  }
  return <Outlet />;
}
