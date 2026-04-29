import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

describe("protocol validation", () => {
  it("validates OpenAI chat fields", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-4o-mini" } });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.type).toBe("invalid_request_error");
    await app.close();
  });

  it("validates Anthropic version header", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/messages", payload: { model: "claude-sonnet-4-5-20250929", max_tokens: 32, messages: [] } });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.type).toBe("missing_required_header");
    await app.close();
  });
});
