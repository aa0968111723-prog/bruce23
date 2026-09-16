import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { listAdminArchiveFn } from "@/lib/cms/admin-fn";
import { ArchiveForm } from "@/components/admin/ArchiveForm";
import type { AdminArchiveItem } from "@/lib/cms/store";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [items, setItems] = useState<AdminArchiveItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    void listAdminArchiveFn()
      .then(setItems)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "讀取失敗");
        setItems([]);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div>
      <h1 className="font-display text-3xl">Archive</h1>
      <p className="mt-2 text-sm text-muted">
        編輯已發布／草稿 Archive 列。沒有公開 Canva /design/{"{id}"} 時不要宣稱可嵌入。
      </p>
      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
      <ul className="mt-6 grid gap-4">
        {items === null ? <li className="text-sm text-muted">Archive 列載入中。</li> : null}
        {items?.length === 0 && !error ? <li className="text-sm text-muted">目前沒有 Archive 列。</li> : null}
        {(items ?? []).map((item) => (
          <li key={String(item.id)}>
            <ArchiveForm item={item} onSaved={reload} />
          </li>
        ))}
      </ul>
    </div>
  );
}
