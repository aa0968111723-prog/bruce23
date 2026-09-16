import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadAdminSettings, saveAdminSettings } from "@/lib/portfolio/server-admin";
import { asObject } from "@/lib/portfolio/public";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [nameZh, setNameZh] = useState("柏能 · 光域工作室");
  const [nameEn, setNameEn] = useState("Luminous Studio");
  const [person, setPerson] = useState("陳柏能 / Bruce Chen");
  const [role, setRole] = useState("AI Designer · Multimodal Design Creator · AI Product Builder");
  const [headline, setHeadline] = useState("");
  const [headlineEn, setHeadlineEn] = useState("");
  const [subhead, setSubhead] = useState(
    "Designing bright, usable experiences with AI and multimodal creativity.",
  );
  const [narrative, setNarrative] = useState("");
  const [narrativeEn, setNarrativeEn] = useState("");
  const [email, setEmail] = useState("aa0968111723@gmail.com");
  const [github, setGithub] = useState("https://github.com/aa0968111723-prog");
  const [githubHandle, setGithubHandle] = useState("aa0968111723-prog");
  const [location, setLocation] = useState("Taipei");
  const [featuredIntro, setFeaturedIntro] = useState("");
  const [featuredIntroEn, setFeaturedIntroEn] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [locale, setLocale] = useState<"zh" | "en">("zh");

  useEffect(() => {
    loadAdminSettings().then((row) => {
      const profile = asObject(row?.profile_json);
      const homepage = asObject(row?.homepage_json);
      const seo = asObject(row?.seo_json);
      const i18n = asObject(row?.i18n_json);
      setNameZh(String(profile.nameZh ?? nameZh));
      setNameEn(String(profile.nameEn ?? nameEn));
      setPerson(String(profile.person ?? person));
      setRole(String(profile.role ?? role));
      setHeadline(String(profile.headline ?? ""));
      setHeadlineEn(String(profile.headlineEn ?? ""));
      setSubhead(String(profile.subhead ?? subhead));
      setNarrative(String(profile.narrative ?? ""));
      setNarrativeEn(String(profile.narrativeEn ?? ""));
      setEmail(String(profile.email ?? email));
      setGithub(String(profile.github ?? github));
      setGithubHandle(String(profile.githubHandle ?? githubHandle));
      setLocation(String(profile.location ?? location));
      setFeaturedIntro(String(homepage.featuredIntro ?? ""));
      setFeaturedIntroEn(String(homepage.featuredIntroEn ?? ""));
      setSeoTitle(String(seo.title ?? ""));
      setSeoDescription(String(seo.description ?? ""));
      setLocale(i18n.defaultLocale === "en" ? "en" : "zh");
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
                nameZh,
                nameEn,
                person,
                role,
                headline,
                headlineEn,
                subhead,
                narrative,
                narrativeEn,
                email,
                github,
                githubHandle,
                location,
              },
              homepage: { featuredIntro, featuredIntroEn },
              seo: { title: seoTitle, description: seoDescription },
              i18n: { defaultLocale: locale },
            },
          });
          toast.success("設定已儲存");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "儲存失敗");
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">設定</h1>
      <label className="grid gap-1 text-sm">工作室中文名<input className="min-h-11 rounded-xl border border-line px-3" value={nameZh} onChange={(e) => setNameZh(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Studio name<input className="min-h-11 rounded-xl border border-line px-3" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">姓名<input className="min-h-11 rounded-xl border border-line px-3" value={person} onChange={(e) => setPerson(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">角色<input className="min-h-11 rounded-xl border border-line px-3" value={role} onChange={(e) => setRole(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">首頁標題<input className="min-h-11 rounded-xl border border-line px-3" value={headline} onChange={(e) => setHeadline(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Headline (EN)<input className="min-h-11 rounded-xl border border-line px-3" value={headlineEn} onChange={(e) => setHeadlineEn(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">副標<input className="min-h-11 rounded-xl border border-line px-3" value={subhead} onChange={(e) => setSubhead(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">敘事<textarea className="min-h-24 rounded-xl border border-line px-3 py-2" value={narrative} onChange={(e) => setNarrative(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Narrative (EN)<textarea className="min-h-20 rounded-xl border border-line px-3 py-2" value={narrativeEn} onChange={(e) => setNarrativeEn(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Email<input className="min-h-11 rounded-xl border border-line px-3" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">GitHub<input className="min-h-11 rounded-xl border border-line px-3" value={github} onChange={(e) => setGithub(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">GitHub handle<input className="min-h-11 rounded-xl border border-line px-3" value={githubHandle} onChange={(e) => setGithubHandle(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">地點<input className="min-h-11 rounded-xl border border-line px-3" value={location} onChange={(e) => setLocation(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">首頁精選說明<textarea className="min-h-20 rounded-xl border border-line px-3 py-2" value={featuredIntro} onChange={(e) => setFeaturedIntro(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Featured intro (EN)<textarea className="min-h-20 rounded-xl border border-line px-3 py-2" value={featuredIntroEn} onChange={(e) => setFeaturedIntroEn(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">SEO title<input className="min-h-11 rounded-xl border border-line px-3" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">SEO description<textarea className="min-h-20 rounded-xl border border-line px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">
        預設語言
        <select className="min-h-11 rounded-xl border border-line px-3" value={locale} onChange={(e) => setLocale(e.target.value as "zh" | "en")}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-mint text-sm font-semibold text-primary-foreground">
        儲存
      </button>
    </form>
  );
}
