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
    assert.equal(zh?.githubVisibility, "private");
    assert.equal(en?.githubVisibility, "private");
    assert.equal(FRAMELAB_IDENTITY.canonicalLiveUrl, zh?.liveUrl);
    assert.equal(FRAMELAB_IDENTITY.health.name, "FrameLab");
    assert.equal(FRAMELAB_IDENTITY.health.version, "0.4.0");
    assert.match(FRAMELAB_IDENTITY_VERSION, /framelab-identity/);
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
    const cabinGit = frame.sourceReferences.find((item) =>
      item.href?.includes("cabin-shale-raven-swift"),
    );
    const lunarGit = frame.sourceReferences.find((item) =>
      item.href?.includes("lunar-crystal-falcon-granite"),
    );
    assert.match(cabinGit?.note ?? "", /私有/);
    assert.match(lunarGit?.note ?? "", /私有/);
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
    assert.match(AIOS_LIVE_PROBE_VERSION, /aios-live-probe/);
    assert.ok(project.sourceReferences.every((item) => !/可能 502|可能暫停/.test(item.note)));
    assert.ok(project.limitations.every((item) => !/可能 502|可能暫停/.test(item)));
    assert.ok(project.sourceReferences.some((item) => /HTTP 200/.test(item.note) && item.href === probe.liveUrl));
    assert.ok(project.sourceReferences.some((item) => /HTTP 200/.test(item.note) && item.href === probe.customDomain));
    assert.ok(project.limitations.some((item) => item.includes("未驗證團隊創作核心流程")));
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
    assert.match(CUTOS_LIVE_PROBE_VERSION, /cutos-live-200/);
    assert.equal(project.links.live, "https://cutos.zeabur.app");
    assert.ok(project.sourceReferences.every((item) => !/SUSPENDED／502/.test(item.note)));
    assert.ok(project.limitations.every((item) => !/SUSPENDED／502/.test(item)));
    assert.ok(project.sourceReferences.some((item) => item.note.includes("不是 502")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records PLANFORM public home as 我的專案 without claiming canvas coreFlow", () => {
    const project = projects.find((item) => item.slug === PLANFORM_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(PLANFORM_LIVE_PROBE_VERSION, /planform-public-home/);
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

  it("records duigao live title without claiming a pin-comment coreFlow", () => {
    const project = projects.find((item) => item.slug === DUIGAO_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(DUIGAO_LIVE_PROBE_VERSION, /duigao-live-title/);
    assert.equal(project.links.live, "https://duigao-k7q2.zeabur.app");
    assert.ok(project.sourceReferences.some((item) => item.note.includes("對稿｜圖片與影片協作空間")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });

  it("records Folio first screen as 文件櫃 without claiming a publish coreFlow", () => {
    const project = projects.find((item) => item.slug === FOLIO_LIVE_PROBE_SLUG);
    assert.ok(project);
    assert.match(FOLIO_LIVE_PROBE_VERSION, /folio-file-cabinet/);
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
    assert.ok(project.sourceReferences.some((item) => item.note.includes("今天想做什麼")));
    assert.ok(project.limitations.some((item) => item.includes("coreFlow 未過")));
  });
});
