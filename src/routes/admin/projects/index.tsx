import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectRows } from "@/lib/portfolio/server-admin";

export const Route = createFileRoute("/admin/projects/")({
  component: AdminProjects,
});

function AdminHomeList() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminProjectRows>>>([]);
  useEffect(() => {
    listAdminProjectRows().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">作品</h1>
        <Link
          to="/admin/projects/new"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
        >
          新增
        </Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              to="/admin/projects/$id/edit"
              params={{ id: row.id }}
              className="flex min-h-11 items-center justify-between rounded-2xl bg-surface px-4 py-4 shadow-card"
            >
              <span>
                <span className="block font-medium">{row.title}</span>
                <span className="text-xs text-muted">
                  {row.slug} · {row.publication_status} · {row.product_status}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminProjects() {
  return <AdminHomeList />;
}
