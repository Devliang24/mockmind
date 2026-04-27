import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["test-key"] },
  models: [
    { id: "deepseek-v4-pro", provider: "deepseek" },
    { id: "kimi-k2.6", provider: "moonshot" },
    { id: "glm-5.1", provider: "zhipu" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    { id: "deepseek", provider: "deepseek", endpoint: "/deepseek/v1/chat/completions", priority: 0, match: { model: "deepseek-v4-pro" }, response: { type: "text", reasoningContent: "reasoning", content: "deepseek" } },
    { id: "moonshot", provider: "moonshot", endpoint: "/moonshot/v1/chat/completions", priority: 0, match: { model: "kimi-k2.6" }, response: { type: "text", content: "moonshot" } },
    { id: "zhipu", provider: "zhipu", endpoint: "/api/paas/v4/chat/completions", priority: 0, match: { model: "glm-5.1" }, response: { type: "text", content: "zhipu" } }
  ]
};

describe("provider namespaced routes", () => {
  it("serves DeepSeek route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/deepseek/v1/chat/completions", payload: { model: "deepseek-v4-pro", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.reasoning_content).toBe("reasoning");
    await app.close();
  });

  it("serves Moonshot route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/moonshot/v1/chat/completions", payload: { model: "kimi-k2.6", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("moonshot");
    await app.close();
  });

  it("serves Zhipu native-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/paas/v4/chat/completions", payload: { model: "glm-5.1", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("zhipu");
    await app.close();
  });
});
