import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["test-key"] },
  models: [{ id: "gpt-4o-mini", provider: "openai" }],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [{
    id: "hello",
    provider: "openai",
    endpoint: "/v1/chat/completions",
    priority: 0,
    match: { messagesContain: "hello" },
    response: { type: "text", content: "Hello from test." }
  }]
};

describe("OpenAI-compatible routes", () => {
  it("returns a chat completion", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "hello" }] }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().choices[0].message.content).toBe("Hello from test.");
    await app.close();
  });

  it("records requests", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "hello" }] }
    });
    const response = await app.inject({ method: "GET", url: "/__admin/requests" });

    expect(response.json()).toHaveLength(1);
    await app.close();
  });
});
