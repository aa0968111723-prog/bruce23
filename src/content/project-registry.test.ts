import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projects } from "./projects.ts";
import {
  AIOS_LIVE_PROBE_SLUG,
  AIOS_LIVE_PROBE_VERSION,
  CUTOS_LIVE_PROBE_SLUG,
  CUTOS_LIVE_PROBE_VERSION,
  PLANFORM_LIVE_PROBE_SLUG,
  PLANFORM_LIVE_PROBE_VERSION,
  DUIGAO_LIVE_PROBE_SLUG,
  DUIGAO_LIVE_PROBE_VERSION,
  FOLIO_LIVE_PROBE_SLUG,
  FOLIO_LIVE_PROBE_VERSION,
  HERMES_CONSOLE_LIVE_PROBE_SLUG,
  HERMES_CONSOLE_LIVE_PROBE_VERSION,
  SKATEHUB_LIVE_PROBE_SLUG,
  SKATEHUB_LIVE_PROBE_VERSION,
  TAMKANG_LIVE_PROBE_SLUG,
  TAMKANG_LIVE_PROBE_VERSION,
  LUMEN_LIVE_PROBE_SLUG,
  LUMEN_LIVE_PROBE_VERSION,
  ZEN_STUDIO_LIVE_PROBE_SLUG,
  ZEN_STUDIO_LIVE_PROBE_VERSION,
  TAMSUI_DRAMA_LIVE_PROBE_SLUG,
  TAMSUI_DRAMA_LIVE_PROBE_VERSION,
  POSTER_VISION_NO_HOST_SLUG,
  POSTER_VISION_NO_HOST_VERSION,
  HERMES_AGENT_SIGNIN_SLUG,
  HERMES_AGENT_SIGNIN_VERSION,
  XIAOCAI_LIVE_PROBE_SLUG,
  XIAOCAI_LIVE_PROBE_VERSION,
  TKU_ZEN_AI_LIVE_PROBE_SLUG,
  TKU_ZEN_AI_LIVE_PROBE_VERSION,
  TKU_ZEN_AGENT_LIVE_PROBE_SLUG,
  TKU_ZEN_AGENT_LIVE_PROBE_VERSION,
  skipGithubHydrate,
  TY_CONTRACT_VERSION,
  FRAMELAB_IDENTITY,
  FRAMELAB_IDENTITY_VERSION,
  LIVE_PROBES_20260919,
  OFFICIAL_PROJECT_KEYS,
  REJECTED_OWNER_DOMAIN_GUESSES,
  STALE_502_NOTE_SLUGS,
  ZEABUR_SERVICES,
  framelabDeployByKey,
  isOfficialProjectKey,
  officialProjectCount,
} from "./project-registry.ts";

describe("official project registry", () => {
  it("lists exactly 17 external works and excludes the portfolio hub", () => {
    assert.equal(officialProjectCount(), 17);
    assert.equal(new Set(OFFICIAL_PROJECT_KEYS).size, 17);
    assert.equal(isOfficialProjectKey("bruce23"), false);
    assert.equal(isOfficialProjectKey("cabin-shale-raven-swift"), true);
    assert.equal(isOfficialProjectKey("lunar-crystal-falcon-granite"), true);
  });

  it("treats lunar and cabin as FrameLab locale deploys of one product", () => {
    const zh = framelabDeployByKey("cabin-shale-raven-swift");
    const en = framelabDeployByKey("lunar-crystal-falcon-granite");
    assert.equal(FRAMELAB_IDENTITY.product, "FrameLab");
    assert.equal(FRAMELAB_IDENTITY.canonicalGithubVisibility, "public");
    assert.equal(zh?.title, "FrameLab");
    assert.equal(en?.title, "FrameLab");
    assert.equal(zh?.runtimeStatus, "RUNNING");
    assert.equal(en?.runtimeStatus, "RUNNING");
    assert.equal(zh?.githubVisibility, "public");
    assert.equal(en?.githubVisibility, "public");
    assert.equal(FRAMELAB_IDENTITY.canonicalLiveUrl, zh?.liveUrl);
    assert.equal(FRAMELAB_IDENTITY.health.name, "FrameLab");
    assert.equal(FRAMELAB_IDENTITY.health.version, "0.4.0");
    assert.match(FRAMELAB_IDENTITY_VERSION, /framelab-github-public/);
  });

  it("points the FrameLab portfolio card at the ZH live host and keeps the EN host as evidence", () => {
    const frame = projects.find((item) => item.slug === "framelab");
    assert.ok(frame);
    assert.equal(frame.links.live, FRAMELAB_IDENTITY.canonicalLiveUrl);
    assert.equal(frame.links.github, FRAMELAB_IDENTITY.canonicalGithub);
    assert.ok(frame.sourceReferences.some((item) => item.href === FRAMELAB_IDENTITY.canonicalLiveUrl));
    assert.ok(
      frame.sourceReferences.some(
        (item) => item.href === "https://lunar-falcon-8p2r.zeabur.app",
      ),
    );
    assert.ok(frame.decisions.some((item) => item.includes("不是兩個作品")));
    assert.ok(frame.sourceReferences.every((item) => !/可能 502/.test(item.note)));
    assert.ok(frame.process.some((item) => item.includes("登入工作室")));
    assert.ok(frame.process.some((item) => item.includes("給它關鍵影格。只修壞掉的那幾格")));
    assert.ok(frame.process.every((item) => !item.includes("匯入影片或圖序")));
    assert.ok(frame.sourceReferences.some((item) => item.note.includes("登入工作室") && item.href === FRAMELAB_IDENTITY.canonicalLiveUrl));
    assert.ok(frame.limitations.some((item) => item.includes("coreFlow 未過")));
    const cabinGit = frame.sourceReferences.find((item) =>
      item.href?.includes("cabin-shale-raven-swift"),
    );
    const lunarGit = frame.sourceReferences.find((item) =>
      item.href?.includes("lunar-crystal-falcon-granite"),
    );
    assert.match(cabinGit?.note ?? "", /private:false/);
    assert.match(lunarGit?.note ?? "", /private:false/);
    assert.doesNotMatch(cabinGit?.note ?? "", /目前為私有/);
    assert.doesNotMatch(lunarGit?.note ?? "", /目前為私有/);
  });

  it("records live 200 probes for 小財 and the Zen desk instead of stale 502 notes", () => {
    assert.deepEqual([...STALE_502_NOTE_SLUGS], ["xiaocai", "tku-zen-agent"]);
    assert.equal(LIVE_PROBES_20260919.xiaocai.httpStatus, 200);
    assert.equal(LIVE_PROBES_20260919.xiaocai.title, "小財記帳");
    assert.equal(LIVE_PROBES_20260919["tku-zen-agent"].httpStatus, 200);
    assert.equal(LIVE_PROBES_20260919["tku-zen-agent"].authBoundary, "authorization-code");
    for (const slug of STALE_502_NOTE_SLUGS) {
      const project = projects.find((item) => item.slug === slug);
      assert.ok(project);
      assert.ok(project.sourceReferences.every((item) => !/可能 502/.test(item.note)));
      assert.ok(project.limitations.every((item) => !/曾出現 502/.test(item)));
    }
  });

  it("records live 200 probes for AI Director OS instead of stale 502/paused notes", () => {
    const probe = LIVE_PROBES_20260919["ai-director-os"];
    const project = projects.find((item) => item.slug === AIOS_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.equal(probe.httpStatus, 200);
    assert.equal(probe.coreFlowPass, false);
    assert.equal(project.links.live, probe.liveUrl);
    assert.equal(project.links.demo, probe.customDomain);
    assert.match(AIOS_LIVE_PROBE_VERSION, /aios-live-home/);
    assert.ok(project.sourceReferences.every((item) => !/可能 502|可能暫停/.test(item.note)));
    assert.ok(project.limitations.every((item) => !/可能 502|可能暫停/.test(item)));
    assert.ok(project.sourceReferences.some((item) => /HTTP 200/.test(item.note) && item.href === probe.liveUrl));
    assert.ok(project.sourceReferences.some((item) => /HTTP 200/.test(item.note) && item.href === probe.customDomain));
    assert.ok(project.process.some((item) => item.includes("進入工作台")));
    assert.ok(project.process.some((item) => item.includes("把想法，變成團隊真正能完成的計畫")));
    assert.ok(project.process.every((item) => !item.includes("建立專案與世界觀快速層")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("進入工作台") && item.href === probe.liveUrl));
    assert.ok(project.limitations.some((item) => item.includes("未驗證團隊創作核心流程")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records the ty public flow probe without claiming coreFlow", () => {
    const project = projects.find((item) => item.slug === "focus-challenge");
    assert.ok(project);
    assert.match(TY_CONTRACT_VERSION, /ty-public-flow-honesty/);
    assert.doesNotMatch(project.summary, /即時看活動狀態/);
    assert.doesNotMatch(project.problem, /不是再填一張表/);
    assert.match(project.summary, /登記|填關主/);
    assert.ok(project.process.some((item) => item.includes("登記畫面")));
    assert.ok(project.limitations.some((item) => item.includes("67 筆")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("keeps Zeabur provisioned domains, not the two swapped URLs from the owner dump", () => {
    const drama = projects.find((item) => item.slug === "tamsui-drama");
    const folio = projects.find((item) => item.slug === "folio");
    const skate = projects.find((item) => item.slug === "skatehub");
    const hermes = projects.find((item) => item.slug === "hermes-agent");
    assert.equal(drama?.links.live, `https://${ZEABUR_SERVICES["tku-tamsui-drama-world"].domains[0]}`);
    assert.equal(folio?.links.live, `https://${ZEABUR_SERVICES.canva2.domains[0]}`);
    assert.equal(skate?.links.live, `https://${ZEABUR_SERVICES.dd.domains[0]}`);
    assert.equal(hermes?.links.live, `https://${ZEABUR_SERVICES["hermes-agent"].domains[0]}/`);
    assert.notEqual(drama?.links.live, "https://lunar-falcon-8p2r.zeabur.app");
    assert.notEqual(folio?.links.live, "https://dd-k3f9.zeabur.app");
    assert.equal(ZEABUR_SERVICES["hermes-agent-legacy-455"].domains[0], "455.zeabur.app");
    assert.equal(REJECTED_OWNER_DOMAIN_GUESSES.length, 2);
    assert.equal(REJECTED_OWNER_DOMAIN_GUESSES[0]?.actualDomain, ZEABUR_SERVICES["tku-tamsui-drama-world"].domains[0]);
    assert.equal(REJECTED_OWNER_DOMAIN_GUESSES[1]?.actualDomain, ZEABUR_SERVICES.canva2.domains[0]);
  });

  it("records CUTOS as live HTTP 200, not suspended 502", () => {
    const project = projects.find((item) => item.slug === CUTOS_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(CUTOS_LIVE_PROBE_VERSION, /cutos-import-intro/);
    assert.equal(project.links.live, "https://cutos.zeabur.app");
    assert.ok(project.sourceReferences.every((item) => !/SUSPENDED／502/.test(item.note)));
    assert.ok(project.limitations.every((item) => !/SUSPENDED／502/.test(item)));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("不是 502")));
    assert.ok(project.process.some((item) => item.includes("匯入影片")));
    assert.ok(project.process.some((item) => item.includes("載入示範影片")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("匯入影片")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records PLANFORM public home as 我的專案 without claiming canvas coreFlow", () => {
    const project = projects.find((item) => item.slug === PLANFORM_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(PLANFORM_LIVE_PROBE_VERSION, /planform-project-home/);
    assert.equal(project.links.live, "https://planform-iso-k7d2.zeabur.app");
    assert.ok(project.process[0]?.includes("我的專案"));
    assert.ok(project.process[0]?.includes("新建專案"));
    assert.ok(project.process.some((item) => item.includes("無後端 API")));
    assert.ok(project.decisions.some((item) => item.includes("我的專案")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("1.0.0")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("1b8513b")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("我的專案")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("docs/agent-handoff/AGENT_PROTOCOL.md")));
    assert.ok(project.limitations.some((item) => item.includes("不做容留人數計算")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(project.limitations.every((item) => !/已符合所有法規/.test(item)));
  });

  it("records duigao live home without claiming a pin-comment coreFlow", () => {
    const project = projects.find((item) => item.slug === DUIGAO_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(DUIGAO_LIVE_PROBE_VERSION, /duigao-live-home/);
    assert.equal(project.links.live, "https://duigao-k7q2.zeabur.app");
    assert.ok(project.process[0]?.includes("duigao-k7q2.zeabur.app"));
    assert.ok(project.process.some((item) => item.includes("今天要對什麼")));
    assert.ok(project.process.some((item) => item.includes("建立活動房")));
    assert.ok(project.process.every((item) => !item.includes("上傳文宣版本")));
    assert.ok(project.decisions.some((item) => item.includes("今天要對什麼")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("今天要對什麼")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Folio first screen as 文件櫃 without claiming a publish coreFlow", () => {
    const project = projects.find((item) => item.slug === FOLIO_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(FOLIO_LIVE_PROBE_VERSION, /folio-cabinet-intro/);
    assert.equal(project.links.live, "https://canva2-k7qm.zeabur.app");
    assert.ok(project.process[0]?.includes("文件櫃"));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("文件櫃")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Hermes Console live home without claiming Agent execution", () => {
    const project = projects.find((item) => item.slug === HERMES_CONSOLE_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(HERMES_CONSOLE_LIVE_PROBE_VERSION, /hermes-console-live-home/);
    assert.equal(project.links.live, "https://344.zeabur.app");
    assert.ok(project.process[0]?.includes("344.zeabur.app"));
    assert.ok(project.process.some((item) => item.includes("今天想做什麼")));
    assert.ok(project.process.some((item) => item.includes("研究／創作／分析")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("今天想做什麼")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("研究／創作／分析")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(project.limitations.every((item) => !item.includes("輸入關鍵詞")));
  });

  it("records SkateHub live slogan without claiming a mileage coreFlow", () => {
    const project = projects.find((item) => item.slug === SKATEHUB_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(SKATEHUB_LIVE_PROBE_VERSION, /skatehub-canvas-intro/);
    assert.equal(project.links.live, "https://dd-k3f9.zeabur.app");
    assert.ok(project.sourceReferences.some((item) => item.note.includes("走向健康，走向陽光")));
    assert.ok(project.limitations.some((item) => item.includes("穿上輪鞋出發")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Tamkang World campus pass without inventing WASD or a campus atlas", () => {
    const project = projects.find((item) => item.slug === TAMKANG_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(TAMKANG_LIVE_PROBE_VERSION, /tamkang-github-public/);
    assert.equal(project.links.live, "https://forge-bloom-k7xq.zeabur.app");
    assert.ok(project.process.some((item) => item.includes("校園通行證")));
    assert.ok(project.process.some((item) => item.includes("先以訪客巡禮")));
    assert.ok(project.process.every((item) => !item.includes("開始巡禮")));
    assert.ok(project.process.every((item) => !item.includes("校園圖鑑")));
    assert.ok(project.process.every((item) => !item.includes("WASD")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("校園通行證")));
    assert.ok(
      project.sourceReferences.some(
        (item) => item.href?.includes("forge-bloom-quiet-falcon") && item.note.includes("private:false"),
      ),
    );
    assert.ok(project.limitations.some((item) => item.includes("private:false")));
    assert.ok(project.limitations.every((item) => !item.includes("目前為私有")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Lumen first screen without Hermes conversation chrome", () => {
    const project = projects.find((item) => item.slug === LUMEN_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(LUMEN_LIVE_PROBE_VERSION, /lumen-not-hermes/);
    assert.equal(project.links.live, "https://ai-chat-8rq3.zeabur.app");
    assert.ok(project.sourceReferences.some((item) => item.note.includes("想做什麼")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("不是 Hermes")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Zen Studio live home without claiming an IG publish coreFlow", () => {
    const project = projects.find((item) => item.slug === ZEN_STUDIO_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(ZEN_STUDIO_LIVE_PROBE_VERSION, /zen-studio-live-home/);
    assert.equal(project.links.live, "https://delta-horizon-k7f2.zeabur.app");
    assert.ok(project.process.some((item) => item.includes("今天可以創作什麼")));
    assert.ok(project.limitations.some((item) => item.includes("沒有審核人")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Tamsui drama load splash without inventing episode one", () => {
    const project = projects.find((item) => item.slug === TAMSUI_DRAMA_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(TAMSUI_DRAMA_LIVE_PROBE_VERSION, /tamsui-drama-shot-alt/);
    assert.equal(project.links.live, "https://tku-tamsui-drama-world-k4x9.zeabur.app");
    assert.ok(project.process.some((item) => item.includes("載入淡江·淡水世界")));
    assert.ok(project.process.every((item) => !item.includes("第一集")));
    assert.ok(project.media.every((item) => !item.alt.includes("第一集")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("載入淡江·淡水世界")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("沒有「第一集」")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Poster Vision as having no public host, not a fake Live Demo", () => {
    const project = projects.find((item) => item.slug === POSTER_VISION_NO_HOST_SLUG);
    assert.ok(project);
    assert.match(POSTER_VISION_NO_HOST_VERSION, /poster-vision-no-public-host/);
    assert.equal(project.links.live, undefined);
    assert.ok(project.limitations.some((item) => item.includes("查無公開 Zeabur 網域")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("查無公開 Zeabur 網域")));
  });

  it("records Hermes Agent first screen as Sign in without claiming dashboard coreFlow", () => {
    const project = projects.find((item) => item.slug === HERMES_AGENT_SIGNIN_SLUG);
    assert.ok(project);
    assert.match(HERMES_AGENT_SIGNIN_VERSION, /hermes-agent-signin/);
    assert.equal(project.links.live, "https://hermes-agent-k7q2.zeabur.app/");
    assert.ok(project.process[0]?.includes("/login"));
    assert.ok(project.process.some((item) => item.includes("Sign in — Hermes Agent")));
    assert.ok(project.process.every((item) => !item.includes("輸入關鍵詞")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("Sign in — Hermes Agent")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("/login")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Xiaocai JS first screen without claiming a ledger write coreFlow", () => {
    const project = projects.find((item) => item.slug === XIAOCAI_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(XIAOCAI_LIVE_PROBE_VERSION, /xiaocai-live-slogan/);
    assert.equal(project.links.live, "https://untitled-5.zeabur.app");
    assert.ok(project.process.some((item) => item.includes("快速記一筆")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("快速記一筆")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records TKU Zen AI first screen as the public English welcome without claiming a chat coreFlow", () => {
    const project = projects.find((item) => item.slug === TKU_ZEN_AI_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(TKU_ZEN_AI_LIVE_PROBE_VERSION, /tku-zen-ai-agent-not-private/);
    assert.equal(project.links.live, undefined);
    assert.ok(project.process[0]?.includes("src/app/page.tsx"));
    assert.ok(project.process.some((item) => item.includes("Welcome to TKU Zen AI")));
    assert.ok(project.process.some((item) => item.includes("I feel stressed about my exams")));
    assert.ok(project.process.every((item) => !item.includes("輸入一句心情")));
    assert.ok(project.decisions.some((item) => item.includes("英文歡迎句")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("Welcome to TKU Zen AI")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(project.limitations.some((item) => item.includes("沒有公開 Zeabur 網域")));
    assert.ok(project.limitations.some((item) => item.includes("公開站需授權碼")));
    assert.ok(project.limitations.every((item) => !/代理，私有/.test(item)));
  });

  it("records the Zen desk access-code gate and does not treat GitHub as a clean public dump", () => {
    const project = projects.find((item) => item.slug === TKU_ZEN_AGENT_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(TKU_ZEN_AGENT_LIVE_PROBE_VERSION, /tku-zen-agent-gate-github/);
    assert.equal(skipGithubHydrate("tku-zen-agent"), true);
    assert.equal(skipGithubHydrate("tku-zen-ai"), false);
    assert.equal(project.links.live, "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask");
    assert.ok(project.process.some((item) => item.includes("請輸入授權碼")));
    assert.ok(project.process.some((item) => item.includes("淡江大學領袖禪學社")));
    assert.ok(project.process.some((item) => item.includes("用一句話開始") && item.includes("作品集未輸入授權碼")));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("請先輸入授權碼")));
    assert.ok(project.sourceReferences.some((item) => item.href?.includes("github.com") && item.note.includes("不可以轉成 public")));
    assert.ok(project.limitations.some((item) => item.includes("knowledge/雲端文件")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
    assert.ok(project.process.every((item) => !/社長|電話|學號/.test(item)));
  });
});
