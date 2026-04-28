import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["test-key"] },
  models: [
    { id: "claude-sonnet-4-6", provider: "anthropic" },
    { id: "gemini-3-flash-preview", provider: "gemini" },
    { id: "qwen3.6-plus", provider: "aliyun-bailian" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

describe("native protocol routes", () => {
  it("returns an Anthropic message", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/messages", headers: { "anthropic-version": "2023-06-01" }, payload: { model: "claude-sonnet-4-6", max_tokens: 128, messages: [{ role: "user", content: "hello" }] } });
    expect(response.statusCode).toBe(200);
    expect(response.json().type).toBe("message");
    expect(response.json().usage.input_tokens).toBeGreaterThan(0);
    const requests = await app.inject({ method: "GET", url: "/__admin/requests" });
    expect(requests.json()[0].responseBody.type).toBe("message");
    await app.close();
  });

  it("returns a Gemini candidate", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1beta/models/gemini-3-flash-preview:generateContent", payload: { contents: [{ role: "user", parts: [{ text: "hello" }] }] } });
    expect(response.statusCode).toBe(200);
    expect(response.json().candidates[0].content.parts[0].text).toBe("fallback");
    expect(response.json().usageMetadata.promptTokenCount).toBeGreaterThan(0);
    await app.close();
  });

  it("returns Gemini streamGenerateContent as SSE", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse", payload: { contents: [{ role: "user", parts: [{ text: "hello" }] }] } });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/event-stream");
    expect(response.body).toContain("data:");
    expect(response.body).toContain("usageMetadata");
    await app.close();
  });

  it("returns a DashScope generation", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/v1/services/aigc/text-generation/generation", payload: { model: "qwen3.6-plus", input: { messages: [{ role: "user", content: "你好" }] } } });
    expect(response.statusCode).toBe(200);
    expect(response.json().output.choices[0].message.content).toBe("fallback");
    expect(response.json().usage.input_tokens).toBeGreaterThan(0);
    expect(response.json().status_code).toBe(200);
    await app.close();
  });
});
