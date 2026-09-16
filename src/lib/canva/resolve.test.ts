import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { resolveCanvaShareUrl } from "./resolve.ts";
import { isCanvaShortLink, parseCanvaDesign } from "./parse.ts";

const SHORT = "https://www.canva.com/d/ysK5sYZisVEjZFe";
const DESIGN = "https://www.canva.com/design/DAGresolvedFromRedirect/view";

function redirectResponse(location: string, status = 302) {
  return new Response(null, { status, headers: { Location: location } });
}

describe("canva short-link resolve", () => {
  it("follows a Canva short URL redirect to /design/{DAG…} without reading HTML", async () => {
    const seen: string[] = [];
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async (input, init) => {
        const url = String(input);
        seen.push(`${init?.method ?? "GET"} ${url}`);
        if (url === SHORT) return redirectResponse(DESIGN);
        throw new Error(`unexpected fetch ${url}`);
      },
    });
    assert.equal(result.status, "pending");
    assert.equal(result.parsed, true);
    assert.equal(result.status === "pending" && result.liveProbe, true);
    assert.equal(result.status === "pending" && result.designId, "DAGresolvedFromRedirect");
    assert.equal(result.status === "pending" && result.embedUrl.includes("embed"), true);
    assert.ok(seen.some((item) => item.startsWith("HEAD ")));
    assert.equal(result.status === "pending" && result.status, "pending");
    assert.notEqual(result.status, "verified");
  });

  it("marks a login-wall redirect as unavailable and does not store a design id", async () => {
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async () =>
        redirectResponse("https://www.canva.com/login?redirect=%2Fd%2FysK5sYZisVEjZFe"),
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.designId, null);
    assert.equal(result.embedUrl, null);
    assert.match(result.error, /登入|權限/);
  });

  it("resolves a relative Location on canva.com without reading HTML", async () => {
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async (input) => {
        const url = String(input);
        if (url === SHORT) return redirectResponse("/design/DAGrelativeHop/view");
        throw new Error(`unexpected fetch ${url}`);
      },
    });
    assert.equal(result.status, "pending");
    assert.equal(result.status === "pending" && result.designId, "DAGrelativeHop");
    assert.notEqual(result.status, "verified");
  });

  it("rejects an open redirect off canva.com", async () => {
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async () => redirectResponse("https://evil.com/phish"),
    });
    assert.equal(result.status, "failed");
    assert.equal(result.designId, null);
    assert.match(result.error, /非 canva\.com/);
  });

  it("does not take a DAG id from Canva HTML when the URL stays /d/", async () => {
    const html = `<!doctype html><a href="https://www.canva.com/design/DAGfromHtmlBody/view">x</a>`;
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async () =>
        new Response(html, {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
    });
    assert.equal(result.status, "unavailable");
    assert.equal(result.designId, null);
    assert.equal(parseCanvaDesign(SHORT), null);
  });

  it("treats 403 as unavailable permission, not verified", async () => {
    const result = await resolveCanvaShareUrl(SHORT, {
      fetchImpl: async () => new Response("blocked", { status: 403 }),
    });
    assert.equal(result.status, "unavailable");
    assert.notEqual(result.status, "verified");
    assert.equal(result.embedUrl, null);
  });

  it("keeps a /design URL as pending without a live probe", async () => {
    const result = await resolveCanvaShareUrl(DESIGN);
    assert.equal(result.status, "pending");
    assert.equal(result.status === "pending" && result.liveProbe, false);
    assert.equal(result.status === "pending" && result.designId, "DAGresolvedFromRedirect");
  });

  it("recognizes short links without treating them as design embeds", () => {
    assert.equal(isCanvaShortLink(SHORT), true);
    assert.equal(parseCanvaDesign(SHORT), null);
  });

  it("does not fetch Canva HTML from client experience or admin form modules", () => {
    const files = [
      new URL("../../components/experience/CanvaStage.tsx", import.meta.url),
      new URL("../../components/admin/ProjectForm.tsx", import.meta.url),
      new URL("../../routes/admin/integrations.tsx", import.meta.url),
      new URL("../../routes/archive.tsx", import.meta.url),
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.doesNotMatch(source, /fetch\([^)]*canva\.com/);
      assert.doesNotMatch(source, /canva\.com\/d\/[^"']+["']\s*\)/);
    }
  });
});
