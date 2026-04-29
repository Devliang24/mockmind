import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "strict", apiKeys: ["test-key"] },
  models: [],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

describe("provider official auth", () => {
  it("accepts OpenAI-compatible Bearer auth and rejects x-api-key", async () => {
    const { app } = await createMockMindServer(config);
    const payload = { model: "gpt-5.5", messages: [{ role: "user", content: "hello" }] };
    const accepted = await app.inject({ method: "POST", url: "/v1/chat/completions", headers: { authorization: "Bearer test-key" }, payload });
    const rejected = await app.inject({ method: "POST", url: "/v1/chat/completions", headers: { "x-api-key": "test-key" }, payload });
    expect(accepted.statusCode).toBe(200);
    expect(rejected.statusCode).toBe(401);
    expect(rejected.json().error.type).toBe("authentication_error");
    await app.close();
  });

  it("accepts Anthropic x-api-key auth and rejects Bearer", async () => {
    const { app } = await createMockMindServer(config);
    const payload = { model: "claude-sonnet-4-5-20250929", max_tokens: 128, messages: [{ role: "user", content: "hello" }] };
    const accepted = await app.inject({ method: "POST", url: "/v1/messages", headers: { "x-api-key": "test-key", "anthropic-version": "2023-06-01" }, payload });
    const rejected = await app.inject({ method: "POST", url: "/v1/messages", headers: { authorization: "Bearer test-key", "anthropic-version": "2023-06-01" }, payload });
    expect(accepted.statusCode).toBe(200);
    expect(rejected.statusCode).toBe(401);
    expect(rejected.json().error.type).toBe("authentication_error");
    await app.close();
  });

  it("accepts Gemini x-goog-api-key and query key auth and rejects Bearer", async () => {
    const { app } = await createMockMindServer(config);
    const payload = { contents: [{ role: "user", parts: [{ text: "hello" }] }] };
    const acceptedHeader = await app.inject({ method: "POST", url: "/v1beta/models/gemini-3-flash-preview:generateContent", headers: { "x-goog-api-key": "test-key" }, payload });
    const acceptedQuery = await app.inject({ method: "POST", url: "/v1beta/models/gemini-3-flash-preview:generateContent?key=test-key", payload });
    const rejected = await app.inject({ method: "POST", url: "/v1beta/models/gemini-3-flash-preview:generateContent", headers: { authorization: "Bearer test-key" }, payload });
    expect(acceptedHeader.statusCode).toBe(200);
    expect(acceptedQuery.statusCode).toBe(200);
    expect(rejected.statusCode).toBe(401);
    expect(rejected.json().error.status).toBe("UNAUTHENTICATED");
    await app.close();
  });

  it("accepts DashScope and MiniMax Bearer auth", async () => {
    const { app } = await createMockMindServer(config);
    const bearerHeaders = { authorization: "Bearer test-key" };
    const dashscope = await app.inject({
      method: "POST",
      url: "/api/v1/services/aigc/text-generation/generation",
      headers: bearerHeaders,
      payload: { model: "qwen3.6-plus", input: { messages: [{ role: "user", content: "hello" }] } }
    });
    const minimax = await app.inject({
      method: "POST",
      url: "/v1/text/chatcompletion_v2",
      headers: bearerHeaders,
      payload: { model: "MiniMax-M2.7", messages: [{ role: "user", content: "hello" }] }
    });
    expect(dashscope.statusCode).toBe(200);
    expect(minimax.statusCode).toBe(200);
    await app.close();
  });

  it("accepts Zhipu Coding Plan Bearer auth", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({
      method: "POST",
      url: "/api/coding/paas/v4/chat/completions",
      headers: { authorization: "Bearer test-key" },
      payload: { model: "GLM-5.1", messages: [{ role: "user", content: "hello" }] }
    });
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
