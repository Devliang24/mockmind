import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [{ id: "gpt-4o-mini", provider: "openai" }],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [{ id: "hello", provider: "openai", endpoint: "/v1/chat/completions", priority: 0, match: { messagesContain: "hello" }, response: { type: "text", content: "hi" } }]
};

describe("web ui", () => {
  it("serves UI shell and assets", async () => {
    const { app } = await createMockMindServer(config);
    const html = await app.inject({ method: "GET", url: "/console" });
    expect(html.statusCode).toBe(200);
    expect(html.headers["content-type"]).toContain("text/html");
    expect(html.body).toContain("MockMind Console");
    expect(html.body).toContain("<div id=\"root\"></div>");
    expect(html.body).toContain("/console/assets/");
    expect(html.body).not.toContain("uiHtml");
    expect(html.body).not.toContain("sidebar-brand");

    const jsPath = html.body.match(/src="([^"]+\.js)"/)?.[1] ?? "";
    const cssPath = html.body.match(/href="([^"]+\.css)"/)?.[1] ?? "";
    expect(jsPath).toContain("/console/assets/");
    expect(cssPath).toContain("/console/assets/");

    const js = await app.inject({ method: "GET", url: jsPath });
    expect(js.statusCode).toBe(200);
    expect(js.headers["content-type"]).toContain("application/javascript");
    expect(js.body).toContain("/__admin/overview");
    expect(js.body).toContain("Base URL");
    expect(js.body).toContain("Required Fields");
    expect(js.body).toContain("Response Body");
    expect(js.body).toContain("Non-stream cURL");
    expect(js.body).toContain("Stream cURL");
    expect(js.body).toContain("selectedRequestId");
    expect(js.body).toContain("request-drawer");
    expect(js.body).toContain("Request Details");
    expect(js.body).toContain("Full cURL");
    expect(js.body).toContain("x-goog-api-key");
    expect(js.body).toContain("responseBody");
    expect(js.body).toContain("model-chip");
    expect(js.body).toContain("Pricing: not listed in current snapshot");
    expect(js.body).toContain("Input ");
    expect(js.body).toContain("gpt-5.5");
    expect(js.body).toContain("claude-opus-4-7");
    expect(js.body).toContain("claude-sonnet-4-6");
    expect(js.body).toContain("gemini-3-pro-preview");
    expect(js.body).toContain("qwen3.6-plus");
    expect(js.body).toContain("https://docs.bigmodel.cn/cn/coding-plan/tool/others");
    expect(js.body).toContain("query");
    expect(js.body).toContain("return_documents");

    const css = await app.inject({ method: "GET", url: cssPath });
    expect(css.statusCode).toBe(200);
    expect(css.headers["content-type"]).toContain("text/css");
    expect(css.body).toContain(".brand");
    expect(css.body).toContain(".copy-button");
    expect(css.body).toContain(".model-chip");
    expect(css.body).toContain(".provider-menu");
    expect(css.body).toContain(".request-drawer");
    expect(css.body).toContain(".drawer-backdrop");
    expect(css.body).toContain(".endpoint-row");
    expect(css.body).toContain("overflow-wrap:anywhere");
    await app.close();
  });

  it("serves console from root without supporting legacy UI paths", async () => {
    const { app } = await createMockMindServer(config);
    const root = await app.inject({ method: "GET", url: "/" });
    const oldUi = await app.inject({ method: "GET", url: "/__ui" });
    const oldJs = await app.inject({ method: "GET", url: "/__ui/app.js" });
    const oldCss = await app.inject({ method: "GET", url: "/__ui/style.css" });
    expect(root.statusCode).toBe(302);
    expect(root.headers.location).toBe("/console");
    expect(oldUi.statusCode).toBe(404);
    expect(oldJs.statusCode).toBe(404);
    expect(oldCss.statusCode).toBe(404);
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
    expect(routes[0].auth).toMatchObject({ label: expect.any(String), headers: expect.any(Array) });
    expect(routes.some((route: { provider: string; protocol: string }) => route.provider === "openai" && route.protocol === "openai-compatible")).toBe(true);
    expect(routes.some((route: { provider: string; path: string }) => route.provider === "zhipu" && route.path === "/api/coding/paas/v4/chat/completions")).toBe(true);
    expect(routes.find((route: { path: string }) => route.path === "/v1/models")?.description).toBe("Models");
    await app.close();
  });

  it("serves provider metadata with latest models", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "GET", url: "/__admin/providers" });
    expect(response.statusCode).toBe(200);
    const openai = response.json().providers.find((provider: { provider: string }) => provider.provider === "openai");
    const anthropic = response.json().providers.find((provider: { provider: string }) => provider.provider === "anthropic");
    const gemini = response.json().providers.find((provider: { provider: string }) => provider.provider === "gemini");
    const deepseek = response.json().providers.find((provider: { provider: string }) => provider.provider === "deepseek");
    const moonshot = response.json().providers.find((provider: { provider: string }) => provider.provider === "moonshot");
    const aliyun = response.json().providers.find((provider: { provider: string }) => provider.provider === "aliyun-bailian");
    expect(openai.latestModels).toEqual(["gpt-5.5", "gpt-5.4", "gpt-5.4-mini", "gpt-5.4-nano"]);
    expect(openai.auth.label).toBe("Authorization: Bearer 123456");
    expect(openai.latestModels).toHaveLength(4);
    expect(anthropic.latestModels).toEqual(["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"]);
    expect(anthropic.auth.label).toBe("x-api-key: 123456");
    expect(gemini.latestModels).toEqual(["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"]);
    expect(gemini.auth.label).toBe("x-goog-api-key: 123456 或 ?key=123456");
    expect(deepseek.latestModels).toEqual(["deepseek-v4-pro", "deepseek-v4-flash"]);
    expect(moonshot.latestModels).toEqual(["kimi-k2.6", "kimi-k2.5", "kimi-k2-thinking", "kimi-k2-thinking-turbo"]);
    expect(aliyun.latestModels).toEqual(["qwen3.6-max-preview", "qwen3.6-plus", "qwen3.6-flash", "qwen3.5-plus"]);
    await app.close();
  });
});
