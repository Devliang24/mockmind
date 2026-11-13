import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

function makeConfig(): MockMindConfig {
  return {
    server: { host: "127.0.0.1", port: 0 },
    providers: { enabled: "all" },
    auth: { mode: "permissive", apiKeys: ["123456"] },
    models: [
      { id: "gpt-5.5", provider: "openai" },
      { id: "claude-sonnet-4-6", provider: "anthropic" }
    ],
    defaults: { latencyMs: 0, streamChunkDelayMs: 0, disabledModelStatusCode: 503 },
    fallback: { enabled: true, response: { type: "text", content: "fallback" } },
    scenarios: []
  };
}

describe("GET /v1/models", () => {
  it("returns the configured model list instead of 500", async () => {
    const { app } = await createMockMindServer(makeConfig());
    const response = await app.inject({ method: "GET", url: "/v1/models", headers: { authorization: "Bearer 123456" } });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.object).toBe("list");
    expect(body.data.map((item: { id: string }) => item.id)).toEqual(["gpt-5.5", "claude-sonnet-4-6"]);
    expect(body.data[0]).toMatchObject({ object: "model", owned_by: "mockmind" });
  });
});
