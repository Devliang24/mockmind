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

async function send(app: Awaited<ReturnType<typeof createMockMindServer>>["app"], model: string) {
  await app.inject({
    method: "POST",
    url: "/v1/chat/completions",
    payload: { model, messages: [{ role: "user", content: "hi" }] }
  });
}

describe("GET /__admin/requests filters", () => {
  it("filters by model and limit, rejects bad limits", async () => {
    const { app } = await createMockMindServer(makeConfig());
    await send(app, "gpt-5.5");
    await send(app, "claude-sonnet-4-6");
    await send(app, "gpt-5.5");

    const all = await app.inject({ method: "GET", url: "/__admin/requests" });
    expect(all.json()).toHaveLength(3);

    const onlyGpt = await app.inject({ method: "GET", url: "/__admin/requests?model=gpt-5.5" });
    expect(onlyGpt.json()).toHaveLength(2);

    const limited = await app.inject({ method: "GET", url: "/__admin/requests?limit=1" });
    const lastOne = limited.json();
    expect(lastOne).toHaveLength(1);
    expect(lastOne[0].model).toBe("gpt-5.5");

    const since = await app.inject({ method: "GET", url: `/__admin/requests?sinceMs=${Date.now() + 60_000}` });
    expect(since.json()).toHaveLength(0);

    const bad = await app.inject({ method: "GET", url: "/__admin/requests?limit=0" });
    expect(bad.statusCode).toBe(400);
  });
});
