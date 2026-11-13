import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

function makeConfig(): MockMindConfig {
  return {
    server: { host: "127.0.0.1", port: 0 },
    providers: { enabled: "all" },
    auth: { mode: "permissive", apiKeys: ["123456"] },
    models: [
      { id: "gpt-5.5", provider: "openai" },
      { id: "claude-sonnet-4-6", provider: "anthropic" }
    ],
    defaults: { latencyMs: 0, streamChunkDelayMs: 0, disabledModelStatusCode: 503 },
    fallback: { enabled: true, response: { type: "text", content: "fallback" } },
    scenarios: []
  };
}

const payload = { model: "gpt-5.5", messages: [{ role: "user", content: "hello" }] };

describe("rejected request recording", () => {
  it("records disabled-model rejections with an arrival timestamp", async () => {
    const { app, context } = await createMockMindServer(makeConfig());
    context.disabledModels.add("gpt-5.5");

    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload });
    expect(response.statusCode).toBe(503);

    const records = context.recorder.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      provider: "openai",
      endpoint: "/v1/chat/completions",
      model: "gpt-5.5",
      status: 503
    });
    // the field this whole change exists for
    expect(Number.isFinite(records[0].receivedAtMs)).toBe(true);
    expect(records[0].respondedAtMs - records[0].receivedAtMs).toBeGreaterThanOrEqual(0);

    await app.close();
  });

  it("stops recording rejections when recordRejectedRequests is false", async () => {
    const { app, context } = await createMockMindServer(makeConfig());
    context.disabledModels.add("gpt-5.5");
    context.systemSettings.recordRejectedRequests = false;

    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload });
    expect(response.statusCode).toBe(503);
    expect(context.recorder.list()).toHaveLength(0);

    await app.close();
  });

  it("exposes and toggles the flag through /__admin/settings", async () => {
    const { app } = await createMockMindServer(makeConfig());

    const initial = await app.inject({ method: "GET", url: "/__admin/settings" });
    expect(initial.json().recordRejectedRequests).toBe(true);

    const patched = await app.inject({ method: "PATCH", url: "/__admin/settings", payload: { recordRejectedRequests: false } });
    expect(patched.json().recordRejectedRequests).toBe(false);

    const rejected = await app.inject({ method: "PATCH", url: "/__admin/settings", payload: { recordRejectedRequests: "nope" } });
    expect(rejected.statusCode).toBe(400);

    await app.close();
  });

  it("records rejections on non-OpenAI protocols too", async () => {
    const { app, context } = await createMockMindServer(makeConfig());
    context.disabledModels.add("claude-sonnet-4-6");

    const response = await app.inject({
      method: "POST",
      url: "/v1/messages",
      headers: { "anthropic-version": "2023-06-01" },
      payload: { model: "claude-sonnet-4-6", max_tokens: 16, messages: [{ role: "user", content: "hi" }] }
    });
    expect(response.statusCode).toBe(503);

    const records = context.recorder.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ provider: "anthropic", endpoint: "/v1/messages", status: 503 });

    await app.close();
  });
});
