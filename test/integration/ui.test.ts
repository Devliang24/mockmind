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
  scenarios: [{ id: "hello", provider: "openai", endpoint: "/v1/chat/completions", priority: 0, match: { messagesContain: "hello" }, response: { type: "text", content: "hi" } }]
};

describe("web ui", () => {
  it("serves UI shell and assets", async () => {
    const { app } = await createMockMindServer(config);
    const html = await app.inject({ method: "GET", url: "/__ui" });
    expect(html.statusCode).toBe(200);
    expect(html.headers["content-type"]).toContain("text/html");
    expect(html.body).toContain("MockMind Console");
    expect(html.body).toContain("供应商");

    const js = await app.inject({ method: "GET", url: "/__ui/app.js" });
    expect(js.statusCode).toBe(200);
    expect(js.body).toContain("/__admin/overview");
    expect(js.body).toContain("必填字段");
    expect(js.body).toContain("响应 Body");
    expect(js.body).not.toContain("关联场景");
    expect(js.body).not.toContain("openai-images");
    expect(js.body).not.toContain("openai-audio");
    expect(js.body).not.toContain("openai-moderations");
    expect(js.body).not.toContain("openai-files");
    expect(js.body).not.toContain("openai-batch");

    const css = await app.inject({ method: "GET", url: "/__ui/style.css" });
    expect(css.statusCode).toBe(200);
    expect(css.body).toContain(".provider-menu");
    await app.close();
  });

  it("serves overview data", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({ method: "POST", url: "/v1/chat/completions", payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "hello" }] } });
    const response = await app.inject({ method: "GET", url: "/__admin/overview" });
    expect(response.statusCode).toBe(200);
    expect(response.json().providersCount).toBeGreaterThan(0);
    expect(response.json().requestsCount).toBe(1);
    await app.close();
  });

  it("serves structured route metadata", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "GET", url: "/__admin/routes" });
    expect(response.statusCode).toBe(200);
    const routes = response.json();
    expect(routes[0]).toMatchObject({ provider: expect.any(String), displayName: expect.any(String), method: expect.any(String), path: expect.any(String), protocol: expect.any(String), endpoint: expect.any(String) });
    expect(routes.some((route: { provider: string; protocol: string }) => route.provider === "openai" && route.protocol === "openai-compatible")).toBe(true);
    await app.close();
  });
});
