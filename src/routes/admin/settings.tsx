import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadAdminSettings, saveAdminSettings } from "@/lib/portfolio/server-admin";
import { asObject } from "@/lib/portfolio/public";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [headline, setHeadline] = useState("");
  const [narrative, setNarrative] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    loadAdminSettings().then((row) => {
      const profile = asObject(row?.profile_json);
      const seo = asObject(row?.seo_json);
      setHeadline(String(profile.headline ?? ""));
      setNarrative(String(profile.narrative ?? ""));
      setSeoTitle(String(seo.title ?? ""));
      setSeoDescription(String(seo.description ?? ""));
    });
  }, []);

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          await saveAdminSettings({
            data: {
              profile: {
                nameZh: "柏能 · 光域工作室",
                nameEn: "Luminous Studio",
                person: "陳柏能 / Bruce Chen",
                role: "AI Designer · Multimodal Design Creator · AI Product Builder",
                headline,
                subhead: "Designing bright, usable experiences with AI and multimodal creativity.",
                narrative,
                email: "aa0968111723@gmail.com",
                github: "https://github.com/aa0968111723-prog",
                githubHandle: "aa0968111723-prog",
                location: "Taipei",
              },
              homepage: {},
              seo: { title: seoTitle, description: seoDescription },
              i18n: { defaultLocale: "zh" },
            },
          });
          toast.success("設定已儲存");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "儲存失敗");
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">設定</h1>
      <label className="grid gap-1 text-sm">
        首頁標題
        <input className="min-h-11 rounded-xl border border-line px-3" value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        敘事
        <textarea className="min-h-24 rounded-xl border border-line px-3 py-2" value={narrative} onChange={(e) => setNarrative(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        SEO title
        <input className="min-h-11 rounded-xl border border-line px-3" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        SEO description
        <textarea className="min-h-20 rounded-xl border border-line px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      </label>
      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-mint text-sm font-semibold text-primary-foreground">
        儲存
      </button>
    </form>
  );
}
