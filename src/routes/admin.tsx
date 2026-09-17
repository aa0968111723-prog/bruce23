import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getViewerFlags } from "@/lib/portfolio/server-public";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const flags = await getViewerFlags();
    if (!flags.signedIn) {
      throw redirect({
        to: "/login",
        search: { next: location.pathname || "/admin" },
      });
    }
  },
  component: AdminLayout,
});
