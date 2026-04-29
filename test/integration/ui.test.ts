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
    const html = await app.inject({ method: "GET", url: "/console" });
    expect(html.statusCode).toBe(200);
    expect(html.headers["content-type"]).toContain("text/html");
    expect(html.body).toContain("MockMind Console");
    expect(html.body).toContain("/console/style.css");
    expect(html.body).toContain("/console/app.js");
    expect(html.body).toContain("sidebar-brand");
    expect(html.body).toContain("<strong>MockMind</strong>");
    expect(html.body).not.toContain("协议模拟控制台");
    expect(html.body).toContain("provider-menu");
    expect(html.body).not.toContain("class=\"topbar\"");
    expect(html.body).not.toContain("health-dot");
    expect(html.body).not.toContain("data-view=\"overview\"");
    expect(html.body).not.toContain("data-view=\"providers\"");

    const js = await app.inject({ method: "GET", url: "/console/app.js" });
    expect(js.statusCode).toBe(200);
    expect(js.body).toContain("/__admin/overview");
    expect(js.body).toContain("必填字段");
    expect(js.body).toContain("响应 Body");
    expect(js.body).toContain("非流式示例");
    expect(js.body).toContain("流式示例");
    expect(js.body).toContain("Base URL");
    expect(js.body).toContain("currentBaseUrl()");
    expect(js.body).toContain("return 'curl ' + baseUrl + normalizedPath");
    expect(js.body).toContain("inline-copy-btn");
    expect(js.body).toContain("markCopied");
    expect(js.body).toContain("dataset.copied");
    expect(js.body).toContain("selectedRequestId");
    expect(js.body).toContain("request-drawer");
    expect(js.body).toContain("请求详情");
    expect(js.body).toContain("完整日志");
    expect(js.body).toContain("完整 cURL");
    expect(js.body).toContain("请求体");
    expect(js.body).toContain("响应体");
    expect(js.body).not.toContain("命中场景");
    expect(js.body).toContain("requestCurl(request)");
    expect(js.body).toContain("responseBody");
    expect(js.body).toContain("request-id");
    expect(js.body).toContain("model-chip");
    expect(js.body).toContain("model-copy-btn");
    expect(js.body).toContain("data-protocol");
    expect(js.body).toContain("协议模型");
    expect(js.body).toContain("当前协议");
    expect(js.body).toContain("当前示例模型");
    expect(js.body).toContain("menuProviderName(provider)");
    expect(js.body).toContain("name.split(' / ').pop()");
    expect(js.body).toContain("gpt-5.5");
    expect(js.body).toContain("claude-opus-4-1-20250805");
    expect(js.body).toContain("claude-sonnet-4-5-20250929");
    expect(js.body).toContain("gemini-3-pro-preview");
    expect(js.body).toContain("qwen3.6-plus");
    expect(js.body).toContain("GLM-5.1");
    expect(js.body).toContain("https://docs.bigmodel.cn/cn/coding-plan/tool/others");
    expect(js.body).toContain("qwen3-rerank");
    expect(js.body).toContain("gte-rerank-v2");
    expect(js.body).toContain("qwen3-vl-rerank");
    expect(js.body).toContain("rerankRequestBody(route, model)");
    expect(js.body).toContain("input.query");
    expect(js.body).toContain("return_documents");
    expect(js.body).toContain("stream_options");
    expect(js.body).toContain("reasoning_content");
    expect(js.body).toContain("thinking_delta");
    expect(js.body).toContain("thought");
    expect(js.body).toContain("openai-models");
    expect(js.body).not.toContain("关联场景");
    expect(js.body).not.toContain("openai-images");
    expect(js.body).not.toContain("openai-audio");
    expect(js.body).not.toContain("openai-moderations");
    expect(js.body).not.toContain("openai-files");
    expect(js.body).not.toContain("openai-batch");

    const css = await app.inject({ method: "GET", url: "/console/style.css" });
    expect(css.statusCode).toBe(200);
    expect(css.body).toContain(".sidebar-brand");
    expect(css.body).toContain(".inline-copy-btn");
    expect(css.body).toContain("已复制");
    expect(css.body).toContain(".provider-menu");
    expect(css.body).toContain(".request-drawer");
    expect(css.body).toContain(".drawer-backdrop");
    expect(css.body).toContain(".provider-meta { table-layout: fixed;");
    expect(css.body).toContain(".provider-meta th { width: 220px;");
    expect(css.body).toContain("overflow-wrap: anywhere");
    expect(css.body).toContain("body { margin: 0; overflow: hidden;");
    expect(css.body).toContain(".layout { display: grid; grid-template-columns: 248px minmax(0, 1fr); height: 100vh;");
    expect(css.body).toContain(".sidebar { height: 100vh; overflow-y: auto;");
    expect(css.body).toContain(".content { min-width: 0; min-height: 0; padding: 0; overflow: auto;");
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
    expect(openai.latestModels).toHaveLength(4);
    expect(anthropic.latestModels).toEqual(["claude-opus-4-1-20250805", "claude-sonnet-4-5-20250929", "claude-haiku-4-5-20251001"]);
    expect(gemini.latestModels).toEqual(["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"]);
    expect(deepseek.latestModels).toEqual(["deepseek-v4-pro", "deepseek-v4-flash"]);
    expect(moonshot.latestModels).toEqual(["kimi-k2.6", "kimi-k2.5", "kimi-k2-thinking", "kimi-k2-thinking-turbo"]);
    expect(aliyun.latestModels).toEqual(["qwen3.6-max-preview", "qwen3.6-plus", "qwen3.6-flash", "qwen3.5-plus"]);
    await app.close();
  });
});
