import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

function config(sqlitePath: string): MockMindConfig {
  return {
    server: { host: "127.0.0.1", port: 0 },
    providers: { enabled: "all" },
    auth: { mode: "permissive", apiKeys: ["123456"] },
    models: [{ id: "gpt-5.5", provider: "openai" }],
    defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
    persistence: { enabled: true, driver: "sqlite", sqlite: { path: sqlitePath } },
    fallback: { enabled: true, response: { type: "text", content: "fallback" } },
    scenarios: [{ id: "hello", provider: "openai", endpoint: "/v1/chat/completions", priority: 0, match: { messagesContain: "hello" }, response: { type: "text", content: "persisted" } }]
  };
}

describe("sqlite persistence", () => {
  it("persists request records across server restarts", async () => {
    const directory = mkdtempSync(join(tmpdir(), "mockmind-sqlite-"));
    const sqlitePath = join(directory, "mockmind.sqlite");
    try {
      const first = await createMockMindServer(config(sqlitePath));
      await first.app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-5.5", messages: [{ role: "user", content: "hello" }] } });
      await first.app.close();

      const second = await createMockMindServer(config(sqlitePath));
      const requests = await second.app.inject({ method: "GET", url: "/__admin/requests" });
      expect(requests.json()).toHaveLength(1);
      expect(requests.json()[0].request.rawBody.model).toBe("gpt-5.5");
      expect(requests.json()[0].responseBody.choices[0].message.content).toBe("persisted");
      await second.app.inject({ method: "POST", url: "/__admin/reset" });
      expect((await second.app.inject({ method: "GET", url: "/__admin/requests" })).json()).toHaveLength(0);
      await second.app.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
