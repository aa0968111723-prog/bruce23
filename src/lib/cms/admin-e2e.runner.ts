import assert from "node:assert/strict";
import { requestHandler } from "@tanstack/react-start/server";
import { auth, authConfigured, SESSION_TOKEN_COOKIE } from "../auth/server";
import { authMiddleware } from "../auth/middleware";
import { requireUserId, UnauthorizedError } from "../auth/verify.server";
import { ensureDbReady, getPglite, getSql } from "../db";
import { AdminConfigError, ForbiddenError, NotFoundError } from "./errors";
import { runAdminSql } from "./admin-runtime.server";
import {
  handleCreateProject,
  handleGetAdminSession,
  handleListIntegrations,
  handlePreviewDraft,
  handleSaveDraft,
  handleSaveSettings,
  handleSetPublication,
  handleTestCanvaEmbed,
} from "./admin-handlers.server";
import {
  applyGithubSync,
  getAdminProject,
  getPublishedProject,
  getSiteSettings,
  listPublishedProjects,
} from "./store";
import { projectInputSchema } from "./schema";
import { CANVA_FIXTURE_SHARE_URL, evaluateCanvaEmbedTest } from "../canva/embed";
import { publicSitemapPaths } from "./sitemap";
import { publishedCreativeWorkJsonLd } from "./jsonld";
import { resolveHomepageCopy } from "./public-site";

const ADMIN_EMAIL = "aa0968111723@gmail.com";

type AuthMiddleware = {
  options: {
    server: (ctx: {
      context: { bearerToken?: string };
      next: (userCtx?: { context?: { userId: string } }) => Promise<unknown>;
    }) => Promise<unknown>;
  };
};

function adminRequest(token?: string): Request {
  const headers = new Headers({
    origin: "http://127.0.0.1:8080",
    host: "127.0.0.1:8080",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
  });
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("cookie", `${SESSION_TOKEN_COOKIE}=${token}`);
  }
  return new Request("http://127.0.0.1:8080/_server-fn/admin", {
    method: "POST",
    headers,
  });
}

async function withStartRequest<T>(request: Request, run: () => Promise<T>): Promise<T> {
  let value: T | undefined;
  let error: unknown;
  const handle = requestHandler(async () => {
    try {
      value = await run();
    } catch (err) {
      error = err;
    }
    return new Response("ok");
  });
  await handle(request, {});
  if (error) throw error;
  return value as T;
}

async function withAuthedAdmin<T>(
  token: string | undefined,
  run: (ctx: { userId: string; bearerToken?: string }) => Promise<T>,
): Promise<T> {
  return withStartRequest(adminRequest(token), async () => {
    const mw = authMiddleware as unknown as AuthMiddleware;
    let captured: T | undefined;
    let thrown: unknown;
    await mw.options.server({
      context: { bearerToken: token },
      next: async (userCtx = {}) => {
        const userId = userCtx.context?.userId;
        if (!userId) throw new Error("authMiddleware.server did not attach userId");
        try {
          captured = await run({ userId, bearerToken: token });
        } catch (err) {
          thrown = err;
        }
        return { context: { userId } };
      },
    });
    if (thrown) throw thrown;
    return captured as T;
  });
}

async function mintSession(input: { email: string; name: string; userId?: string }) {
  await ensureDbReady();
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(input.email);
  let user = existing?.user;
  if (!user) {
    user = await ctx.internalAdapter.createUser({
      ...(input.userId ? { id: input.userId } : {}),
      name: input.name,
      email: input.email,
      emailVerified: true,
    });
  }
  if (!user?.id) throw new Error("Better Auth createUser did not return a user");
  const session = await ctx.internalAdapter.createSession(user.id);
  if (!session?.token) throw new Error("Better Auth createSession did not return a token");
  return { user, token: session.token as string };
}

function sample() {
  return projectInputSchema.parse({
    slug: "e2e-session-work",
    title: "Session E2E",
    subtitle: "後台流程",
    category: "AI Product",
    year: "2026",
    product_status: "prototype",
    publication_status: "draft",
    featured: false,
    sort_order: 90,
    summary: "草稿敘事，不可以被 README 蓋掉。",
    problem: "問題敘事",
    role: "作者",
    seo_title: "SEO 標題",
    seo_description: "SEO 描述",
    locale_json: {
      zh: { title: "中文標題", summary: "中文摘要" },
      en: { title: "English title", summary: "English summary" },
    },
    media: [{ src: "/media/covers/folio.svg", alt: "封面 alt", kind: "image" }],
    source_evidence: [
      {
        label: "GitHub README",
        href: "https://github.com/aa0968111723-prog/FrameLab",
        note: "公開 README",
        kind: "github",
      },
    ],
    github_url: "https://github.com/aa0968111723-prog/FrameLab",
    github_sync_enabled: true,
  });
}

async function step(name: string, run: () => Promise<void>) {
  await run();
  console.log(`ok - ${name}`);
}

export async function runAdminE2E() {
  await step("mints a real Better Auth user/session for the allowlisted admin email", async () => {
    assert.equal(authConfigured, true);
    const minted = await mintSession({ email: ADMIN_EMAIL, name: "Bruce" });
    const pg = await getPglite();
    const users = await pg.query<{ email: string; id: string }>(
      `select id, email from "user" where email = $1`,
      [ADMIN_EMAIL],
    );
    const sessions = await pg.query<{ token: string }>(
      `select token from "session" where "userId" = $1`,
      [minted.user.id],
    );
    assert.equal(users.rows[0]?.email, ADMIN_EMAIL);
    assert.notEqual(users.rows[0]?.id, "dev-user");
    assert.ok(sessions.rows.some((row) => row.token === minted.token));

    const session = await withStartRequest(adminRequest(minted.token), async () => {
      return auth.api.getSession({
        headers: adminRequest(minted.token).headers,
      });
    });
    assert.equal(session?.user.email, ADMIN_EMAIL);
    assert.equal(session?.user.id, minted.user.id);
  });

  await step("rejects unauthenticated callers with 401", async () => {
    await assert.rejects(
      () =>
        withStartRequest(adminRequest(), async () => {
          await requireUserId();
        }),
      UnauthorizedError,
    );
  });

  await step("rejects a signed-in non-admin email", async () => {
    const visitor = await mintSession({ email: "visitor@example.com", name: "Visitor" });
    await assert.rejects(
      () =>
        withAuthedAdmin(visitor.token, async (ctx) => {
          await runAdminSql(ctx);
        }),
      ForbiddenError,
    );
  });

  await step("fails closed when the allowlist is empty", async () => {
    const minted = await mintSession({ email: ADMIN_EMAIL, name: "Bruce" });
    const previous = process.env.PORTFOLIO_ADMIN_EMAILS;
    process.env.PORTFOLIO_ADMIN_EMAILS = "";
    try {
      await assert.rejects(
        () =>
          withAuthedAdmin(minted.token, async (ctx) => {
            await runAdminSql(ctx);
          }),
        AdminConfigError,
      );
    } finally {
      if (previous === undefined) delete process.env.PORTFOLIO_ADMIN_EMAILS;
      else process.env.PORTFOLIO_ADMIN_EMAILS = previous;
    }
  });

  await step("rejects the shared dev-user even when the email is on the allowlist", async () => {
    const ctx = await auth.$context;
    const previousAdmin = await ctx.internalAdapter.findUserByEmail(ADMIN_EMAIL);
    if (previousAdmin?.user?.id) {
      await ctx.internalAdapter.deleteUser(previousAdmin.user.id);
    }
    const minted = await mintSession({
      email: ADMIN_EMAIL,
      name: "Dev",
      userId: "dev-user",
    });
    assert.equal(minted.user.id, "dev-user");
    await assert.rejects(
      () =>
        withAuthedAdmin(minted.token, async (actor) => {
          await runAdminSql(actor);
        }),
      ForbiddenError,
    );
    await ctx.internalAdapter.deleteUser("dev-user");
  });

  await step("runs draft → preview → publish → public → unpublish → persist through authMiddleware", async () => {
    const minted = await mintSession({ email: ADMIN_EMAIL, name: "Bruce" });
    assert.notEqual(minted.user.id, "dev-user");

    const sessionGate = await withAuthedAdmin(minted.token, async (ctx) => {
      const userId = await requireUserId(ctx.bearerToken);
      assert.equal(userId, minted.user.id);
      return handleGetAdminSession(ctx);
    });
    assert.equal(sessionGate.ok, true);
    if (sessionGate.ok) {
      assert.equal(sessionGate.email, ADMIN_EMAIL);
      assert.equal(sessionGate.userId, minted.user.id);
    }

    const created = await withAuthedAdmin(minted.token, async (ctx) => handleCreateProject(ctx, sample()));
    assert.equal(created.publication_status, "draft");
    assert.equal(created.seo_title, "SEO 標題");
    assert.equal(created.seo_description, "SEO 描述");
    assert.equal(created.locale_json.zh?.title, "中文標題");
    assert.equal(created.media[0]?.src, "/media/covers/folio.svg");
    assert.equal(created.source_evidence[0]?.kind, "github");

    const saved = await withAuthedAdmin(minted.token, async (ctx) =>
      handleSaveDraft(ctx, { id: created.id, summary: "updated draft" }),
    );
    assert.equal(saved.summary, "updated draft");
    assert.equal(saved.publication_status, "draft");

    const sql = await getSql();
    await assert.rejects(() => getPublishedProject(sql, created.slug), NotFoundError);
    const publishedBefore = await listPublishedProjects(sql);
    assert.equal(
      publishedBefore.some((item) => item.slug === created.slug),
      false,
    );
    assert.equal(
      publicSitemapPaths(publishedBefore.map((item) => item.slug)).includes(`/work/${created.slug}`),
      false,
    );

    const preview = await withAuthedAdmin(minted.token, async (ctx) => handlePreviewDraft(ctx, created.slug));
    assert.equal(preview.publicationStatus, "draft");
    assert.equal(preview.project.slug, created.slug);
    assert.equal(preview.project.summary, "updated draft");
    assert.equal(publishedCreativeWorkJsonLd(preview.project).url, `/work/${created.slug}`);

    await withAuthedAdmin(minted.token, async (ctx) => handleSetPublication(ctx, created.id, "published"));

    const live = await getPublishedProject(sql, created.slug);
    assert.equal(live.title, "Session E2E");
    assert.equal(live.seoTitle, "SEO 標題");
    assert.equal(live.seoDescription, "SEO 描述");
    assert.equal(live.locale.en?.title, "English title");
    assert.equal(live.media[0]?.alt, "封面 alt");
    assert.equal(live.sourceEvidence[0]?.note, "公開 README");
    const jsonLd = publishedCreativeWorkJsonLd(live);
    assert.equal(jsonLd["@type"], "CreativeWork");
    assert.equal(jsonLd.url, `/work/${created.slug}`);
    assert.equal(jsonLd.name, "Session E2E");
    assert.equal(jsonLd.image, "/media/covers/folio.svg");
    assert.equal(
      publicSitemapPaths((await listPublishedProjects(sql)).map((item) => item.slug)).includes(
        `/work/${created.slug}`,
      ),
      true,
    );

    await withAuthedAdmin(minted.token, async (ctx) => handleSetPublication(ctx, created.id, "draft"));
    await assert.rejects(() => getPublishedProject(sql, created.slug), NotFoundError);

    const reloaded = await getAdminProject(sql, created.id);
    assert.equal(reloaded.slug, created.slug);
    assert.equal(reloaded.summary, "updated draft");
    assert.equal(reloaded.publication_status, "draft");

    await withAuthedAdmin(minted.token, async (ctx) => handleSetPublication(ctx, created.id, "published"));
    await withAuthedAdmin(minted.token, async (ctx) => handleSetPublication(ctx, created.id, "archived"));
    await assert.rejects(() => getPublishedProject(sql, created.slug), NotFoundError);

    await withAuthedAdmin(minted.token, async (ctx) => handleSetPublication(ctx, created.id, "draft"));
    const restored = await getAdminProject(sql, created.id);
    assert.equal(restored.publication_status, "draft");

    await withAuthedAdmin(minted.token, async (ctx) => {
      const { sql: adminSql, actor } = await runAdminSql(ctx);
      return applyGithubSync(
        adminSql,
        created.id,
        {
          ok: true,
          status: "verified",
          owner: "aa0968111723-prog",
          repo: "FrameLab",
          branch: "main",
          metadata: {
            name: "FrameLab",
            description: "repo description",
            homepage: null,
            defaultBranch: "main",
            updatedAt: "2026-09-01T00:00:00Z",
            private: false,
            archived: false,
            htmlUrl: "https://github.com/aa0968111723-prog/FrameLab",
            language: "TypeScript",
          },
          readme: "# FrameLab from GitHub",
          languages: { TypeScript: 10 },
          topics: ["animation"],
          latestCommit: { sha: "abc1234dead", message: "docs" },
          fileTree: [{ path: "README.md", type: "file", size: 12 }],
        },
        actor.userId,
      );
    });
    const afterGithub = await getAdminProject(sql, created.id);
    assert.equal(afterGithub.title, "Session E2E");
    assert.equal(afterGithub.summary, "updated draft");
    assert.equal(afterGithub.problem, "問題敘事");
    assert.equal(afterGithub.github_readme, "# FrameLab from GitHub");
    assert.equal(afterGithub.github_sync_status, "verified");

    const canva = await withAuthedAdmin(minted.token, async (ctx) => {
      const syntax = evaluateCanvaEmbedTest(CANVA_FIXTURE_SHARE_URL);
      assert.equal(syntax.status, "pending");
      return handleTestCanvaEmbed(ctx, { id: created.id, url: CANVA_FIXTURE_SHARE_URL });
    });
    assert.equal(canva.status, "pending");
    assert.equal("liveProbe" in canva ? canva.liveProbe : true, false);
    const afterCanva = await getAdminProject(sql, created.id);
    assert.equal(afterCanva.canva_status, "pending");
    assert.notEqual(afterCanva.canva_status, "verified");
    assert.match(afterCanva.canva_error ?? "", /不會標成已驗證/);

    const integrations = await withAuthedAdmin(minted.token, async (ctx) => handleListIntegrations(ctx));
    const integrationRow = integrations.items.find((item) => item.id === created.id);
    assert.equal(integrationRow?.canva.status, "pending");
    assert.notEqual(integrationRow?.canva.status, "verified");
    assert.equal(integrationRow?.public, false);
    assert.equal(integrations.notion.connected, false);
    assert.equal(integrations.notion.status, "not_configured");

    await withAuthedAdmin(minted.token, async (ctx) => {
      const current = await getSiteSettings(await getSql());
      assert.ok(current);
      return handleSaveSettings(ctx, {
        name_zh: current.name_zh,
        name_en: current.name_en,
        person: current.person,
        role: current.role,
        headline: current.headline,
        subhead: current.subhead,
        narrative: current.narrative,
        email: current.email,
        github: current.github,
        github_handle: current.github_handle,
        location: current.location,
        seo_title: "E2E SEO",
        seo_description: "E2E description",
        homepage_json: { highlightSlugs: ["framelab", created.slug] },
        locale_json: {
          zh: { headline: "中文 headline", narrative: "中文 narrative" },
          en: { headline: "EN headline", narrative: "EN narrative" },
        },
      });
    });
    const settings = await getSiteSettings(await getSql());
    assert.equal(settings?.seo_title, "E2E SEO");
    assert.deepEqual(settings?.homepage_json.highlightSlugs, ["framelab", created.slug]);
    assert.equal(settings?.locale_json.zh?.headline, "中文 headline");
    assert.equal(settings?.locale_json.en?.headline, "EN headline");
    const homepage = resolveHomepageCopy(
      {
        nameZh: settings!.name_zh,
        nameEn: settings!.name_en,
        person: settings!.person,
        role: settings!.role,
        headline: settings!.headline,
        subhead: settings!.subhead,
        narrative: settings!.narrative,
        email: settings!.email,
        github: settings!.github,
        githubHandle: settings!.github_handle,
        location: settings!.location,
        seoTitle: settings!.seo_title,
        seoDescription: settings!.seo_description,
        homepageHighlightSlugs: settings!.homepage_json.highlightSlugs ?? [],
        locale: settings!.locale_json,
      },
      {
        nameEn: "fallback",
        person: "fallback",
        headline: "fallback headline",
        subhead: "fallback subhead",
        narrative: "fallback narrative",
      },
    );
    assert.equal(homepage.headline, "中文 headline");
    assert.equal(homepage.narrative, "中文 narrative");
    assert.equal(homepage.subhead, "EN headline");
    assert.equal(homepage.seoTitle, "E2E SEO");
  });

  await step("live /login stays Google-only when the preview server is up", async () => {
    const login = await fetch("http://127.0.0.1:8080/login", { signal: AbortSignal.timeout(2500) });
    assert.equal(login.ok, true);
    const html = await login.text();
    assert.match(html, /後台登入|Google|使用/);
    assert.doesNotMatch(html, /type=["']password["']/);
    const admin = await fetch("http://127.0.0.1:8080/admin", {
      redirect: "manual",
      signal: AbortSignal.timeout(2500),
    });
    assert.ok(admin.status === 200 || admin.status === 302 || admin.status === 307);
  });
}
