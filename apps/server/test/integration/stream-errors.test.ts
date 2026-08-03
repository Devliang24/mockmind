import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [
    { id: "gpt-4o-mini", provider: "openai" },
    { id: "gemini-3-flash-preview", provider: "gemini" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

describe("modelStreamErrors", () => {
  it("injects OpenAI SSE error frame after stream chunks", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gpt-4o-mini": { code: "rate_limit", message: "mock rate limit" } } }
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", stream: true, messages: [{ role: "user", content: "hello" }] }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/event-stream");
    expect(response.body).toContain("fallback");
    expect(response.body).toContain('"error"');
    expect(response.body).toContain("mock rate limit");
    expect(response.body).toContain("rate_limit");
    // error must appear after the content chunk
    expect(response.body.indexOf("fallback")).toBeLessThan(response.body.indexOf("mock rate limit"));
    await app.close();
  });

  it("injects Gemini SSE error frame after stream chunks", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gemini-3-flash-preview": { code: "RESOURCE_EXHAUSTED", message: "quota exceeded" } } }
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse",
      payload: { contents: [{ role: "user", parts: [{ text: "hello" }] }] }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/event-stream");
    expect(response.body).toContain("fallback");
    expect(response.body).toContain('"error"');
    expect(response.body).toContain("quota exceeded");
    expect(response.body).toContain("RESOURCE_EXHAUSTED");
    // error must appear after the content chunk
    expect(response.body.indexOf("fallback")).toBeLessThan(response.body.indexOf("quota exceeded"));
    await app.close();
  });

  it("does not affect non-streaming requests", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gpt-4o-mini": { message: "stream error" } } }
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "hello" }] }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("fallback");
    expect(response.body).not.toContain("stream error");
    await app.close();
  });

  it("does not affect different models", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gpt-4o-mini": { message: "stream error" } } }
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "nonexistent-model", stream: true, messages: [{ role: "user", content: "hello" }] }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("fallback");
    expect(response.body).not.toContain("stream error");
    await app.close();
  });

  it("exposes modelStreamErrors in admin settings", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gpt-4o-mini": { code: "429", message: "test" } } }
    });

    const settings = await app.inject({ method: "GET", url: "/__admin/settings" });
    expect(settings.json().modelStreamErrors).toEqual({ "gpt-4o-mini": { code: "429", message: "test" } });
    await app.close();
  });

  it("records matched stream error in recorder", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "PATCH",
      url: "/__admin/settings",
      payload: { modelStreamErrors: { "gpt-4o-mini": { code: "rate_limit", message: "mock rate limit" } } }
    });

    await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", stream: true, messages: [{ role: "user", content: "hello" }] }
    });

    const requests = await app.inject({ method: "GET", url: "/__admin/requests" });
    const record = requests.json()[0];
    expect(record.stream).toBe(true);
    expect(record.status).toBe(200);
    expect(record.responseBody).toMatchObject({ stream: true, format: "text/event-stream" });
    await app.close();
  });
});
