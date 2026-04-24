import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["test-key"] },
  models: [
    { id: "gpt-4o-mini", provider: "openai" },
    { id: "claude-3-5-sonnet-latest", provider: "anthropic" },
    { id: "gemini-1.5-pro", provider: "gemini" },
    { id: "qwen-plus", provider: "aliyun-bailian" }
  ],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    {
      id: "openai-tool",
      provider: "openai",
      endpoint: "/v1/chat/completions",
      priority: 0,
      match: { messagesContain: "weather", hasTools: true },
      response: { type: "tool_call", toolName: "get_weather", toolArguments: { city: "Shanghai" } }
    },
    {
      id: "openai-stream-usage",
      provider: "openai",
      endpoint: "/v1/chat/completions",
      priority: 0,
      match: { messagesContain: "stream", stream: true },
      response: { type: "stream", chunks: ["hello", " world"], usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 } }
    },
    {
      id: "anthropic-tool",
      provider: "anthropic",
      endpoint: "/v1/messages",
      priority: 0,
      match: { messagesContain: "weather" },
      response: { type: "tool_call", toolName: "get_weather", toolArguments: { city: "Shanghai" } }
    },
    {
      id: "gemini-tool",
      provider: "gemini",
      endpoint: "/v1beta/models/gemini-1.5-pro:generateContent",
      priority: 0,
      match: { messagesContain: "weather" },
      response: { type: "tool_call", toolName: "get_weather", toolArguments: { city: "Shanghai" } }
    },
    {
      id: "dashscope-error",
      provider: "aliyun-bailian",
      endpoint: "/api/v1/services/aigc/text-generation/generation",
      priority: 0,
      match: { messagesContain: "error" },
      response: { type: "error", error: { status: 429, code: "Throttling", message: "mock throttling" } }
    }
  ]
};

describe("protocol capabilities", () => {
  it("returns OpenAI tool calls", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "weather" }], tools: [{ type: "function", function: { name: "get_weather" } }] } });
    expect(response.json().choices[0].finish_reason).toBe("tool_calls");
    expect(response.json().choices[0].message.tool_calls[0].function.name).toBe("get_weather");
    await app.close();
  });

  it("returns OpenAI stream usage", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-4o-mini", stream: true, messages: [{ role: "user", content: "stream" }] } });
    expect(response.body).toContain("hello");
    expect(response.body).toContain('"usage"');
    expect(response.body).toContain("[DONE]");
    await app.close();
  });

  it("returns Anthropic tool_use", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/messages", payload: { model: "claude-3-5-sonnet-latest", messages: [{ role: "user", content: "weather" }] } });
    expect(response.json().stop_reason).toBe("tool_use");
    expect(response.json().content[0].type).toBe("tool_use");
    await app.close();
  });

  it("returns Gemini functionCall", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1beta/models/gemini-1.5-pro:generateContent", payload: { contents: [{ role: "user", parts: [{ text: "weather" }] }] } });
    expect(response.json().candidates[0].content.parts[0].functionCall.name).toBe("get_weather");
    await app.close();
  });

  it("returns DashScope errors", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/api/v1/services/aigc/text-generation/generation", payload: { model: "qwen-plus", input: { messages: [{ role: "user", content: "error" }] } } });
    expect(response.statusCode).toBe(429);
    expect(response.json().code).toBe("Throttling");
    await app.close();
  });
});
