import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAdminSiteFn, saveSiteSettingsFn } from "@/lib/portfolio/cms-fns";
import type { PublicSiteSettings } from "@/lib/portfolio/types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [site, setSite] = useState<PublicSiteSettings | null>(null);
  useEffect(() => {
    void getAdminSiteFn().then(setSite);
  }, []);
  if (!site) return <p className="text-sm text-muted">載入中…</p>;
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await saveSiteSettingsFn({
            data: {
              ...site,
              homepageContent: site.homepageContent,
              localeZh: site.localeZh ?? {},
              localeEn: site.localeEn ?? {},
            },
          });
          toast.success("設定已儲存");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "儲存失敗");
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">網站設定</h1>
      {(
        [
          ["nameZh", "中文名"],
          ["nameEn", "英文名"],
          ["person", "姓名"],
          ["role", "角色"],
          ["headline", "主標"],
          ["subhead", "副標"],
          ["narrative", "敘事"],
          ["email", "Email"],
          ["github", "GitHub"],
          ["githubHandle", "GitHub handle"],
          ["location", "地點"],
          ["seoTitle", "SEO 標題"],
          ["seoDescription", "SEO 描述"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="grid gap-1 text-sm">
          <span className="font-medium">{label}</span>
          <input
            className="input"
            value={String(site[key] ?? "")}
            onChange={(event) => setSite({ ...site, [key]: event.target.value })}
          />
        </label>
      ))}
      <button type="submit" className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold">
        儲存
      </button>
    </form>
  );
}
