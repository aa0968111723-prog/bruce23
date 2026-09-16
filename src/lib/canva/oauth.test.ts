import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  buildCanvaAuthorizeUrl,
  canvaConnectMode,
  canvaCredentialsPresent,
  canvaTokenKeyPresent,
  decryptSecret,
  disconnectedCanvaStatus,
  encryptSecret,
  pkcePair,
} from "./oauth.server.ts";
import { sanitizeCanvaDesign } from "./connect.server.ts";
import { isAllowedCanvaMediaUrl } from "./parse.ts";

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const next = vars[key];
    if (next === undefined) delete process.env[key];
    else process.env[key] = next;
  }
  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

describe("canva connect honesty", () => {
  it("stays in public-embed mode without Connect credentials", () => {
    withEnv({ CANVA_CLIENT_ID: undefined, CANVA_CLIENT_SECRET: undefined }, () => {
      assert.equal(canvaConnectMode(), "public-embed");
      assert.equal(canvaCredentialsPresent(), false);
      const status = disconnectedCanvaStatus();
      assert.equal(status.mode, "public-embed");
      assert.equal(status.connected, false);
      assert.equal(status.status, "not_configured");
      assert.match(status.message, /公開嵌入/);
      assert.doesNotMatch(status.message, /已連線/);
    });
  });

  it("does not claim OAuth connected when only credentials exist", () => {
    withEnv(
      {
        CANVA_CLIENT_ID: "client-id",
        CANVA_CLIENT_SECRET: "client-secret",
        CANVA_TOKEN_KEY: "unit-test-token-key",
      },
      () => {
        assert.equal(canvaConnectMode(), "oauth");
        const status = disconnectedCanvaStatus();
        assert.equal(status.connected, false);
        assert.equal(status.status, "pending");
      },
    );
  });

  it("refuses to encrypt without CANVA_TOKEN_KEY", () => {
    withEnv({ CANVA_TOKEN_KEY: undefined, PORTFOLIO_TOKEN_KEY: undefined }, () => {
      assert.equal(canvaTokenKeyPresent(), false);
      assert.throws(() => encryptSecret("refresh-token-value"), /CANVA_TOKEN_KEY/);
    });
  });

  it("round-trips encrypted integration secrets when the key is set", () => {
    withEnv({ CANVA_TOKEN_KEY: "unit-test-token-key" }, () => {
      const { ciphertext, iv } = encryptSecret("refresh-token-value");
      assert.notEqual(ciphertext, "refresh-token-value");
      assert.equal(decryptSecret(ciphertext, iv), "refresh-token-value");
    });
  });

  it("builds an official PKCE authorize URL and never puts secrets in it", () => {
    withEnv(
      {
        CANVA_CLIENT_ID: "OC-test-client",
        CANVA_CLIENT_SECRET: "cnvca-test-secret",
        CANVA_TOKEN_KEY: "unit-test-token-key",
        CANVA_REDIRECT_URI: undefined,
      },
      () => {
        const { verifier, challenge } = pkcePair();
        const url = buildCanvaAuthorizeUrl({
          origin: "https://portfolio.example",
          state: "state-value",
          challenge,
        });
        assert.match(url, /^https:\/\/www\.canva\.com\/api\/oauth\/authorize/);
        assert.match(url, /code_challenge_method=S256/);
        assert.match(url, /response_type=code/);
        assert.doesNotMatch(url, /cnvca-test-secret/);
        assert.doesNotMatch(url, /unit-test-token-key/);
        assert.equal(url.includes(verifier), false);
        assert.match(url, /redirect_uri=https%3A%2F%2Fportfolio.example%2Fapi%2Fcanva%2Foauth%2Fcallback/);
      },
    );
  });

  it("fails closed when credentials exist but the token key does not", () => {
    withEnv(
      {
        CANVA_CLIENT_ID: "OC-test-client",
        CANVA_CLIENT_SECRET: "secret",
        CANVA_TOKEN_KEY: undefined,
        PORTFOLIO_TOKEN_KEY: undefined,
      },
      () => {
        const status = disconnectedCanvaStatus();
        assert.equal(status.connected, false);
        assert.equal(status.status, "failed");
        assert.match(status.message, /CANVA_TOKEN_KEY/);
      },
    );
  });
});

describe("canva connect DTOs", () => {
  it("keeps only allowlisted Canva URLs on design cards", () => {
    const card = sanitizeCanvaDesign({
      id: "DAFVztcvd9z",
      title: "My summer holiday",
      page_count: 5,
      updated_at: 1692928800,
      thumbnail: { url: "https://document-export.canva.com/Vczz9/thumb.png?sig=1" },
      urls: {
        edit_url: "https://www.canva.com/api/design/eyJhbGciOi/edit",
        view_url: "https://evil.example/design/x",
      },
    });
    assert.equal(card?.id, "DAFVztcvd9z");
    assert.equal(card?.pageCount, 5);
    assert.match(card?.thumbnailUrl ?? "", /document-export\.canva\.com/);
    assert.match(card?.editUrl ?? "", /canva\.com/);
    assert.equal(card?.viewUrl, null);
  });

  it("drops non-canva media hosts", () => {
    assert.equal(isAllowedCanvaMediaUrl("https://evil.example/x.png"), false);
    assert.equal(isAllowedCanvaMediaUrl("https://export-download.canva.com/file.pdf"), true);
  });

  it("does not keep a hardcoded encryption fallback in source", () => {
    const source = readFileSync(new URL("./oauth.server.ts", import.meta.url), "utf8");
    assert.doesNotMatch(source, /preview-only-not-for-production/);
    assert.match(source, /CANVA_TOKEN_KEY/);
    const start = readFileSync(new URL("../../routes/api/canva/oauth/start.ts", import.meta.url), "utf8");
    const callback = readFileSync(new URL("../../routes/api/canva/oauth/callback.ts", import.meta.url), "utf8");
    assert.match(start, /startCanvaOAuth/);
    assert.match(callback, /completeCanvaOAuth/);
    assert.doesNotMatch(start, /connected:\s*true/);
    assert.doesNotMatch(callback, /access_token/);
  });
});
