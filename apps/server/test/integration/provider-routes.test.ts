import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [
    { id: "gpt-5.4-mini", provider: "azure" },
    { id: "deepseek-v4-pro", provider: "deepseek" },
    { id: "kimi-k2.6", provider: "moonshot" },
    { id: "glm-5.1", provider: "zhipu" },
    { id: "GLM-5.1", provider: "zhipu" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    { id: "azure", provider: "azure", endpoint: "/openai/v1/chat/completions", priority: 0, match: { model: "gpt-5.4-mini" }, response: { type: "text", content: "azure" } },
    { id: "deepseek", provider: "deepseek", endpoint: "/chat/completions", priority: 0, match: { model: "deepseek-v4-pro" }, response: { type: "text", reasoningContent: "reasoning", content: "deepseek" } },
    { id: "moonshot", provider: "moonshot", endpoint: "/v1/chat/completions", priority: 0, match: { model: "kimi-k2.6" }, response: { type: "text", content: "moonshot" } },
    { id: "zhipu", provider: "zhipu", endpoint: "/api/paas/v4/chat/completions", priority: 0, match: { model: "glm-5.1" }, response: { type: "text", content: "zhipu" } },
    { id: "zhipu-coding", provider: "zhipu", endpoint: "/api/coding/paas/v4/chat/completions", priority: 0, match: { model: "GLM-5.1" }, response: { type: "text", content: "zhipu coding" } }
  ]
};

describe("provider official routes", () => {
  it("serves Azure OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/openai/v1/chat/completions", payload: { model: "gpt-5.4-mini", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("azure (model: gpt-5.4-mini)");
    await app.close();
  });

  it("keeps OpenAI GPT models on the OpenAI route unless the Azure route is used", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-5.4-mini", messages: [{ role: "user", content: "hello" }] } });
    const requests = await app.inject({ method: "GET", url: "/__admin/requests" });
    expect(response.json().choices[0].message.content).toBe("fallback (model: gpt-5.4-mini)");
    expect(requests.json()[0]).toMatchObject({ provider: "openai", endpoint: "/v1/chat/completions", model: "gpt-5.4-mini" });
    await app.close();
  });

  it("serves Azure Responses route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/openai/v1/responses", payload: { model: "gpt-5.4", input: "hello" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().model).toBe("gpt-5.4");
    await app.close();
  });

  it("serves DeepSeek OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/chat/completions", payload: { model: "deepseek-v4-pro", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.reasoning_content).toBe("reasoning");
    await app.close();
  });

  it("serves shared OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "kimi-k2.6", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("moonshot (model: kimi-k2.6)");
    await app.close();
  });

  it("serves Zhipu native-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/paas/v4/chat/completions", payload: { model: "glm-5.1", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("zhipu (model: glm-5.1)");
    await app.close();
  });

  it("serves Zhipu Coding Plan OpenAI-compatible route", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/coding/paas/v4/chat/completions", payload: { model: "GLM-5.1", messages: [{ role: "user", content: "hello" }] } });
    expect(response.json().choices[0].message.content).toBe("zhipu coding (model: GLM-5.1)");
    await app.close();
  });

  it("records the concrete model in stream response summaries", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({ method: "POST", url: "/api/paas/v4/chat/completions", payload: { model: "glm-5.1", stream: true, messages: [{ role: "user", content: "hello" }] } });
    const response = await app.inject({ method: "GET", url: "/__admin/requests" });

    expect(response.json()[0].responseBody).toMatchObject({
      stream: true,
      format: "text/event-stream",
      content: "zhipu (model: glm-5.1)"
    });
    expect(response.json()[0].responseBody).not.toHaveProperty("model");
    await app.close();
  });

  it.each([
    "/deepseek/v1/chat/completions",
    "/moonshot/v1/chat/completions",
    "/zhipu/v1/chat/completions",
    "/minimax/v1/text/chatcompletion_v2",
    "/anthropic/v1/messages",
    "/azure/openai/v1/chat/completions",
    "/gemini/v1beta/models/gemini-3-flash-preview:generateContent",
    "/dashscope/api/v1/services/aigc/text-generation/generation"
  ])("does not serve non-official alias %s", async (url) => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url, payload: { model: "gpt-5.5", messages: [{ role: "user", content: "hello" }] } });
    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
