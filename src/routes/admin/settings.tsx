import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchPublicSite } from "@/lib/cms/public-fns";
import { saveSiteSettingsFn } from "@/lib/cms/admin-fns";
import type { PublicSite } from "@/lib/cms/public-types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [site, setSite] = useState<PublicSite | null>(null);
  useEffect(() => {
    void fetchPublicSite().then(setSite);
  }, []);
  if (!site) return <p className="text-sm text-muted">載入中…</p>;
  return <SettingsForm site={site} />;
}

function SettingsForm({ site }: { site: PublicSite }) {
  const [profile, setProfile] = useState(site.profile);
  const [homepage, setHomepage] = useState(site.homepage);
  const [seo, setSeo] = useState(site.seo);

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await saveSiteSettingsFn({ data: { profile, homepage, seo, i18n: {} } });
          toast.success("設定已儲存");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "儲存失敗");
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">網站設定</h1>
      {(
        [
          ["nameZh", "中文名稱"],
          ["nameEn", "英文名稱"],
          ["person", "姓名"],
          ["role", "職稱"],
          ["headline", "主標"],
          ["subhead", "副標"],
          ["narrative", "敘事"],
          ["email", "Email"],
          ["github", "GitHub"],
          ["location", "地點"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          {label}
          <input
            value={profile[key]}
            onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
          />
        </label>
      ))}
      <label className="block text-sm">
        首頁探索標題
        <input
          value={homepage.explorationTitle}
          onChange={(e) => setHomepage((h) => ({ ...h, explorationTitle: e.target.value }))}
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="block text-sm">
        首頁探索說明
        <textarea
          value={homepage.explorationBody}
          onChange={(e) => setHomepage((h) => ({ ...h, explorationBody: e.target.value }))}
          className="mt-1 min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        SEO 標題
        <input
          value={seo.title}
          onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
          className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="block text-sm">
        SEO 描述
        <textarea
          value={seo.description}
          onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
          className="mt-1 min-h-24 w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground">
        儲存
      </button>
    </form>
  );
}
