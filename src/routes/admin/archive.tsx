import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { listAdminArchiveFn } from "@/lib/cms/admin-fn";
import { ArchiveForm } from "@/components/admin/ArchiveForm";
import type { AdminArchiveItem } from "@/lib/cms/store";

export const Route = createFileRoute("/admin/archive")({
  component: AdminArchive,
});

function AdminArchive() {
  const [items, setItems] = useState<AdminArchiveItem[]>([]);
  const reload = useCallback(() => {
    void listAdminArchiveFn().then(setItems);
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
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li key={String(item.id)}>
            <ArchiveForm item={item} onSaved={reload} />
          </li>
        ))}
      </ul>
    </div>
  );
}
