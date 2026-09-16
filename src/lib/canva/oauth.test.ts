import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canvaConnectMode,
  canvaCredentialsPresent,
  decryptSecret,
  disconnectedCanvaStatus,
  encryptSecret,
} from "./oauth.server.ts";

describe("canva connect honesty", () => {
  it("stays in public-embed mode without Connect credentials", () => {
    const prevId = process.env.CANVA_CLIENT_ID;
    const prevSecret = process.env.CANVA_CLIENT_SECRET;
    delete process.env.CANVA_CLIENT_ID;
    delete process.env.CANVA_CLIENT_SECRET;
    try {
      assert.equal(canvaConnectMode(), "public-embed");
      assert.equal(canvaCredentialsPresent(), false);
      const status = disconnectedCanvaStatus();
      assert.equal(status.mode, "public-embed");
      assert.equal(status.connected, false);
      assert.equal(status.status, "not_configured");
      assert.match(status.message, /公開嵌入/);
      assert.doesNotMatch(status.message, /已連線/);
    } finally {
      if (prevId === undefined) delete process.env.CANVA_CLIENT_ID;
      else process.env.CANVA_CLIENT_ID = prevId;
      if (prevSecret === undefined) delete process.env.CANVA_CLIENT_SECRET;
      else process.env.CANVA_CLIENT_SECRET = prevSecret;
    }
  });

  it("does not claim OAuth connected when only credentials exist", () => {
    const prevId = process.env.CANVA_CLIENT_ID;
    const prevSecret = process.env.CANVA_CLIENT_SECRET;
    process.env.CANVA_CLIENT_ID = "client-id";
    process.env.CANVA_CLIENT_SECRET = "client-secret";
    try {
      assert.equal(canvaConnectMode(), "oauth");
      const status = disconnectedCanvaStatus();
      assert.equal(status.connected, false);
      assert.equal(status.status, "pending");
    } finally {
      if (prevId === undefined) delete process.env.CANVA_CLIENT_ID;
      else process.env.CANVA_CLIENT_ID = prevId;
      if (prevSecret === undefined) delete process.env.CANVA_CLIENT_SECRET;
      else process.env.CANVA_CLIENT_SECRET = prevSecret;
    }
  });

  it("round-trips encrypted integration secrets", () => {
    const { ciphertext, iv } = encryptSecret("refresh-token-value");
    assert.notEqual(ciphertext, "refresh-token-value");
    assert.equal(decryptSecret(ciphertext, iv), "refresh-token-value");
  });
});
