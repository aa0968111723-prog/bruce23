import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/projects/$id")({
  component: () => <Outlet />,
});
