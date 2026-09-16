import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAdminProjectRows } from "@/lib/portfolio/server-admin";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAdminProjectRows>>>([]);
  useEffect(() => {
    listAdminProjectRows().then(setRows).catch(() => setRows([]));
  }, []);
  const published = rows.filter((row) => row.publication_status === "published").length;
  const drafts = rows.filter((row) => row.publication_status === "draft").length;
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">後台總覽</h1>
      <p className="mt-2 text-sm text-muted">草稿與發布是分開的。公開網站只讀 published。</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-surface p-5 shadow-card">作品 {rows.length}</div>
        <div className="rounded-2xl bg-surface p-5 shadow-card">已發布 {published}</div>
        <div className="rounded-2xl bg-surface p-5 shadow-card">草稿 {drafts}</div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/admin/projects/new" className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
          新增作品
        </Link>
        <Link to="/admin/integrations" className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm shadow-card">
          整合狀態
        </Link>
      </div>
    </div>
  );
}
