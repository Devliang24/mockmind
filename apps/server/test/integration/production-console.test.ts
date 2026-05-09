import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { MockMindConfig } from "../../src/core/scenario/types.js";
import { createMockMindServer } from "../../src/server/create-server.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [{ id: "gpt-4o-mini", provider: "openai" }],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

const originalConsoleDist = process.env.MOCKMIND_CONSOLE_DIST;
const tempDirs: string[] = [];

afterEach(() => {
  process.env.MOCKMIND_CONSOLE_DIST = originalConsoleDist;
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("production console assets", () => {
  it("serves built web assets from the console dist directory", async () => {
    const dist = mkdtempSync(join(tmpdir(), "mockmind-console-"));
    tempDirs.push(dist);
    writeFileSync(join(dist, "index.html"), "<!doctype html><title>Built MockMind Console</title>");
    writeFileSync(join(dist, "style.css"), "body { color: rgb(1, 2, 3); }");
    writeFileSync(join(dist, "app.js"), "globalThis.__mockmindBuiltConsole = true;");
    process.env.MOCKMIND_CONSOLE_DIST = dist;

    const { app } = await createMockMindServer(config);
    const html = await app.inject({ method: "GET", url: "/console" });
    const css = await app.inject({ method: "GET", url: "/console/style.css" });
    const js = await app.inject({ method: "GET", url: "/console/app.js" });
    const oldUi = await app.inject({ method: "GET", url: "/__ui" });

    expect(html.statusCode).toBe(200);
    expect(html.body).toContain("Built MockMind Console");
    expect(css.statusCode).toBe(200);
    expect(css.body).toContain("rgb(1, 2, 3)");
    expect(js.statusCode).toBe(200);
    expect(js.body).toContain("__mockmindBuiltConsole");
    expect(oldUi.statusCode).toBe(404);

    await app.close();
  });
});
