import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [{ id: "MiniMax-M2.7", provider: "minimax" }],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    { id: "minimax", provider: "minimax", endpoint: "/v1/text/chatcompletion_v2", priority: 0, match: { model: "MiniMax-M2.7" }, response: { type: "text", content: "minimax" } },
    { id: "minimax-error", provider: "minimax", endpoint: "/v1/text/chatcompletion_v2", priority: 10, match: { lastUserMessageContains: "error" }, response: { type: "error", error: { status: 429, code: "1008", message: "mock minimax limit" } } }
  ]
};

describe("MiniMax routes", () => {
  it("returns MiniMax native chat completion", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/text/chatcompletion_v2", payload: { model: "MiniMax-M2.7", messages: [{ role: "user", content: "hello" }] } });
    expect(response.statusCode).toBe(200);
    expect(response.json().choices[0].message.content).toBe("minimax");
    expect(response.json().base_resp.status_code).toBe(0);
    await app.close();
  });

  it("returns MiniMax provider-style error", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/text/chatcompletion_v2", payload: { model: "MiniMax-M2.7", messages: [{ role: "user", content: "error" }] } });
    expect(response.statusCode).toBe(429);
    expect(response.json().base_resp.status_code).toBe(1008);
    await app.close();
  });
});
