import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projects } from "./projects.ts";
import {
  FRAMELAB_IDENTITY,
  FRAMELAB_IDENTITY_VERSION,
  LIVE_PROBES_20260919,
  OFFICIAL_PROJECT_KEYS,
  STALE_502_NOTE_SLUGS,
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
});
