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
  });

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
      });
    });
  }, []);

  return (
    <form
      className="grid max-w-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void saveSettingsFn({
          data: {
            ...form,
            homepage_json: {},
            locale_json: {},
          },
        })
          .then(() => toast.success("設定已存"))
          .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "儲存失敗"));
      }}
    >
      <h1 className="font-display text-3xl">網站設定</h1>
      {Object.entries(form).map(([key, value]) => (
        <label key={key} className="grid gap-1 text-sm">
          {key}
          <input
            className="min-h-11 rounded-xl border border-line px-3"
            value={value}
            onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
          />
        </label>
      ))}
      <button type="submit" className="min-h-11 rounded-full bg-mint text-sm font-semibold text-primary-foreground">
        儲存
      </button>
    </form>
  );
}
