import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [
    { id: "deepseek-v4-pro", provider: "deepseek" },
    { id: "kimi-k2.6", provider: "moonshot" },
    { id: "glm-5.1", provider: "zhipu" },
    { id: "GLM-5.1", provider: "zhipu" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    { id: "deepseek", provider: "deepseek", endpoint: "/chat/completions", priority: 0, match: { model: "deepseek-v4-pro" }, response: { type: "text", reasoningContent: "reasoning", content: "deepseek" } },
    { id: "moonshot", provider: "moonshot", endpoint: "/v1/chat/completions", priority: 0, match: { model: "kimi-k2.6" }, response: { type: "text", content: "moonshot" } },
    { id: "zhipu", provider: "zhipu", endpoint: "/api/paas/v4/chat/completions", priority: 0, match: { model: "glm-5.1" }, response: { type: "text", content: "zhipu" } },
    { id: "zhipu-coding", provider: "zhipu", endpoint: "/api/coding/paas/v4/chat/completions", priority: 0, match: { model: "GLM-5.1" }, response: { type: "text", content: "zhipu coding" } }
  ]
};

describe("provider official routes", () => {
  it("serves DeepSeek OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/chat/completions", payload: { model: "deepseek-v4-pro", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.reasoning_content).toBe("reasoning");
    await app.close();
  });

  it("serves shared OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "kimi-k2.6", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("moonshot");
    await app.close();
  });

  it("serves Zhipu native-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/paas/v4/chat/completions", payload: { model: "glm-5.1", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("zhipu");
    await app.close();
  });

  it("serves Zhipu Coding Plan OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/coding/paas/v4/chat/completions", payload: { model: "GLM-5.1", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("zhipu coding");
    await app.close();
  });

  it.each([
    "/deepseek/v1/chat/completions",
    "/moonshot/v1/chat/completions",
    "/zhipu/v1/chat/completions",
    "/minimax/v1/text/chatcompletion_v2",
    "/anthropic/v1/messages",
    "/gemini/v1beta/models/gemini-3-flash-preview:generateContent",
    "/dashscope/api/v1/services/aigc/text-generation/generation"
  ])("does not serve non-official alias %s", async (url) => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url, payload: { model: "gpt-5.5", messages: [{ role: "user", content: "hello" }] } });
    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
