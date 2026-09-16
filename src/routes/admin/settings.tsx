import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSettingsFn, saveSettingsFn } from "@/lib/cms/admin-fn";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [form, setForm] = useState({
    name_zh: "",
    name_en: "",
    person: "",
    role: "",
    headline: "",
    subhead: "",
    narrative: "",
    email: "",
    github: "",
    github_handle: "",
    location: "",
    seo_title: "",
    seo_description: "",
    highlightSlugs: "",
    localeZhHeadline: "",
    localeEnHeadline: "",
    localeZhNarrative: "",
    localeEnNarrative: "",
    localeZhSeoTitle: "",
    localeEnSeoTitle: "",
    localeZhSeoDescription: "",
    localeEnSeoDescription: "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    void getSettingsFn().then((row) => {
      if (!row) return;
      setForm({
        name_zh: String(row.name_zh ?? ""),
        name_en: String(row.name_en ?? ""),
        person: String(row.person ?? ""),
        role: String(row.role ?? ""),
        headline: String(row.headline ?? ""),
        subhead: String(row.subhead ?? ""),
        narrative: String(row.narrative ?? ""),
        email: String(row.email ?? ""),
        github: String(row.github ?? ""),
        github_handle: String(row.github_handle ?? ""),
        location: String(row.location ?? ""),
        seo_title: String(row.seo_title ?? ""),
        seo_description: String(row.seo_description ?? ""),
        highlightSlugs: (row.homepage_json?.highlightSlugs ?? []).join("\n"),
        localeZhHeadline: String(row.locale_json?.zh?.headline ?? ""),
        localeEnHeadline: String(row.locale_json?.en?.headline ?? ""),
        localeZhNarrative: String(row.locale_json?.zh?.narrative ?? ""),
        localeEnNarrative: String(row.locale_json?.en?.narrative ?? ""),
        localeZhSeoTitle: String(row.locale_json?.zh?.seoTitle ?? ""),
        localeEnSeoTitle: String(row.locale_json?.en?.seoTitle ?? ""),
        localeZhSeoDescription: String(row.locale_json?.zh?.seoDescription ?? ""),
        localeEnSeoDescription: String(row.locale_json?.en?.seoDescription ?? ""),
      });
      setDirty(false);
    });
  }, []);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const profileKeys = [
    "name_zh",
    "name_en",
    "person",
    "role",
    "headline",
    "subhead",
    "narrative",
    "email",
    "github",
    "github_handle",
    "location",
    "seo_title",
    "seo_description",
  ] as const;

  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const highlightSlugs = form.highlightSlugs
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean);
        void saveSettingsFn({
          data: {
            name_zh: form.name_zh,
            name_en: form.name_en,
            person: form.person,
            role: form.role,
            headline: form.headline,
            subhead: form.subhead,
            narrative: form.narrative,
            email: form.email,
            github: form.github,
            github_handle: form.github_handle,
            location: form.location,
            seo_title: form.seo_title,
            seo_description: form.seo_description,
            homepage_json: { highlightSlugs },
            locale_json: {
              zh: {
                headline: form.localeZhHeadline,
                narrative: form.localeZhNarrative,
                seoTitle: form.localeZhSeoTitle,
                seoDescription: form.localeZhSeoDescription,
              },
              en: {
                headline: form.localeEnHeadline,
                narrative: form.localeEnNarrative,
                seoTitle: form.localeEnSeoTitle,
                seoDescription: form.localeEnSeoDescription,
              },
            },
          },
        })
          .then(() => {
            toast.success("設定已存");
            setDirty(false);
          })
          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "儲存失敗"));
      }}
    >
      <h1 className="font-display text-3xl">網站設定</h1>
      {dirty ? <p className="text-sm text-muted">有未儲存的修改。</p> : null}
      {profileKeys.map((key) => (
        <label key={key} className="grid gap-1 text-sm">
          {key}
          {key === "narrative" || key === "seo_description" || key === "subhead" ? (
            <textarea
              className="min-h-28 rounded-xl border border-line px-3 py-2"
              value={form[key]}
              onChange={(event) => {
                setDirty(true);
                setForm((current) => ({ ...current, [key]: event.target.value }));
              }}
            />
          ) : (
            <input
              className="min-h-11 rounded-xl border border-line px-3"
              value={form[key]}
              onChange={(event) => {
                setDirty(true);
                setForm((current) => ({ ...current, [key]: event.target.value }));
              }}
            />
          )}
        </label>
      ))}
      <label className="grid gap-1 text-sm">
        首頁節點 slug（一行一個，只會顯示已發布作品）
        <textarea
          className="min-h-28 rounded-xl border border-line px-3 py-2"
          value={form.highlightSlugs}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, highlightSlugs: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        中文 headline
        <input
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.localeZhHeadline}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeZhHeadline: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        英文 headline
        <input
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.localeEnHeadline}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeEnHeadline: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        中文 narrative
        <textarea
          className="min-h-24 rounded-xl border border-line px-3 py-2"
          value={form.localeZhNarrative}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeZhNarrative: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        英文 narrative
        <textarea
          className="min-h-24 rounded-xl border border-line px-3 py-2"
          value={form.localeEnNarrative}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeEnNarrative: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        中文 SEO 標題
        <input
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.localeZhSeoTitle}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeZhSeoTitle: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        英文 SEO 標題
        <input
          className="min-h-11 rounded-xl border border-line px-3"
          value={form.localeEnSeoTitle}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeEnSeoTitle: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        中文 SEO 描述
        <textarea
          className="min-h-24 rounded-xl border border-line px-3 py-2"
          value={form.localeZhSeoDescription}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeZhSeoDescription: event.target.value }));
          }}
        />
      </label>
      <label className="grid gap-1 text-sm">
        英文 SEO 描述
        <textarea
          className="min-h-24 rounded-xl border border-line px-3 py-2"
          value={form.localeEnSeoDescription}
          onChange={(event) => {
            setDirty(true);
            setForm((current) => ({ ...current, localeEnSeoDescription: event.target.value }));
          }}
        />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-mint text-sm font-semibold text-primary-foreground">
        儲存
      </button>
    </form>
  );
}
