import { describe, expect, it } from "vitest";
import type {
  AdminModelsResponse,
  AdminOverviewResponse,
  AdminProvidersResponse,
  AdminRequestsResponse,
  AdminRoutesResponse,
  AdminScenario
} from "@mockmind/shared";
import type { MockMindConfig } from "../../src/core/scenario/types.js";
import { createMockMindServer } from "../../src/server/create-server.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["123456"] },
  models: [{ id: "gpt-4o-mini", provider: "openai" }],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: [
    {
      id: "hello",
      provider: "openai",
      endpoint: "/v1/chat/completions",
      priority: 0,
      match: { messagesContain: "hello" },
      response: { type: "text", content: "Hello from contract test." }
    }
  ]
};

describe("Admin API contracts", () => {
  it("documents provider identity, auth, models, groups, and route summaries", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "GET", url: "/__admin/providers" });
    const body = response.json<AdminProvidersResponse>();

    expect(response.statusCode).toBe(200);
    expect(body.mode).toBe("all");
    expect(body.groups).toMatchObject({
      chinese: expect.any(Array),
      international: expect.any(Array),
      "openai-compatible": expect.any(Array),
      native: expect.any(Array),
      azure: expect.any(Array),
      enterprise: expect.any(Array)
    });

    const openai = body.providers.find((provider) => provider.provider === "openai");
    const azure = body.providers.find((provider) => provider.provider === "azure");
    expect(openai).toMatchObject({
      provider: "openai",
      displayName: expect.any(String),
      groups: expect.arrayContaining(["international", "openai-compatible"]),
      auth: {
        scheme: "authorization-bearer",
        label: expect.any(String),
        headers: expect.arrayContaining(["Authorization"]),
        query: []
      },
      defaultModels: expect.any(Array),
      latestModels: expect.any(Array),
      configuredModels: expect.arrayContaining(["gpt-4o-mini"]),
      routes: expect.any(Array)
    });
    expect(openai?.routes.some((route) => route.includes("/v1/chat/completions"))).toBe(true);
    expect(azure).toMatchObject({
      provider: "azure",
      displayName: "Azure OpenAI / Microsoft Foundry",
      groups: expect.arrayContaining(["international", "openai-compatible", "azure", "enterprise"]),
      auth: {
        scheme: "api-key",
        label: expect.any(String),
        headers: ["api-key"],
        query: []
      },
      defaultModels: ["gpt-5.4-mini"],
      latestModels: ["gpt-5.4", "gpt-5.4-mini", "gpt-5.3-codex"],
      modelVersions: {
        "gpt-5.4": "2026-03-05",
        "gpt-5.4-mini": "2026-03-17",
        "gpt-5.3-codex": "2026-02-24"
      },
      routes: expect.any(Array)
    });
    expect(azure?.routes.some((route) => route.includes("/openai/deployments/:deployment/chat/completions"))).toBe(true);

    await app.close();
  });

  it("documents route method, path, protocol, endpoint, auth, description, and provider", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "GET", url: "/__admin/routes" });
    const routes = response.json<AdminRoutesResponse>();

    expect(response.statusCode).toBe(200);
    const chatRoute = routes.find((route) => route.provider === "openai" && route.path === "/v1/chat/completions");
    expect(chatRoute).toMatchObject({
      provider: "openai",
      displayName: expect.any(String),
      groups: expect.arrayContaining(["international"]),
      auth: {
        scheme: "authorization-bearer",
        label: expect.any(String),
        headers: expect.arrayContaining(["Authorization"]),
        query: []
      },
      method: "POST",
      path: "/v1/chat/completions",
      protocol: "openai-compatible",
      endpoint: expect.any(String),
      description: expect.any(String)
    });

    const geminiRoute = routes.find((route) => route.provider === "gemini" && route.protocol === "gemini-generate-content");
    expect(geminiRoute?.auth).toMatchObject({
      scheme: "x-goog-api-key-or-query-key",
      headers: expect.arrayContaining(["x-goog-api-key"]),
      query: expect.arrayContaining(["key"])
    });

    const azureRoute = routes.find((route) => route.provider === "azure" && route.path === "/openai/deployments/:deployment/chat/completions");
    expect(azureRoute).toMatchObject({
      provider: "azure",
      auth: {
        scheme: "api-key",
        headers: ["api-key"],
        query: []
      },
      method: "POST",
      path: "/openai/deployments/:deployment/chat/completions",
      protocol: "openai-compatible",
      endpoint: "/openai/deployments/:deployment/chat/completions",
      description: "Azure deployment Chat Completions"
    });

    await app.close();
  });

  it("documents models, scenarios, and overview contracts", async () => {
    const { app } = await createMockMindServer(config);
    const overviewResponse = await app.inject({ method: "GET", url: "/__admin/overview" });
    const modelsResponse = await app.inject({ method: "GET", url: "/__admin/models" });
    const scenariosResponse = await app.inject({ method: "GET", url: "/__admin/scenarios" });

    const overview = overviewResponse.json<AdminOverviewResponse>();
    const models = modelsResponse.json<AdminModelsResponse>();
    const scenarios = scenariosResponse.json<AdminScenario[]>();

    expect(overview).toMatchObject({
      ok: true,
      name: "mockmind",
      version: expect.any(String),
      server: { host: "127.0.0.1", port: 0 },
      auth: { mode: "permissive" },
      providers: { enabled: "all" },
      providersCount: expect.any(Number),
      modelsCount: 1,
      scenariosCount: 1,
      requestsCount: 0,
      recentRequests: []
    });

    expect(models.data).toEqual([
      { id: "gpt-4o-mini", provider: "openai", displayName: expect.any(String) }
    ]);

    expect(scenarios).toEqual([
      expect.objectContaining({
        id: "hello",
        provider: "openai",
        endpoint: "/v1/chat/completions",
        priority: 0,
        match: expect.objectContaining({ messagesContain: "hello" }),
        response: expect.objectContaining({ type: "text" })
      })
    ]);

    await app.close();
  });

  it("documents request records after a mock request", async () => {
    const { app } = await createMockMindServer(config);
    await app.inject({
      method: "POST",
      url: "/v1/chat/completions",
      payload: { model: "gpt-4o-mini", messages: [{ role: "user", content: "hello" }] }
    });

    const response = await app.inject({ method: "GET", url: "/__admin/requests" });
    const requests = response.json<AdminRequestsResponse>();
    const record = requests.find((request) => request.provider === "openai" && request.endpoint === "/v1/chat/completions");

    expect(response.statusCode).toBe(200);
    expect(record).toMatchObject({
      id: expect.stringMatching(/^req_\d+$/),
      provider: "openai",
      endpoint: "/v1/chat/completions",
      model: "gpt-4o-mini",
      matchedScenarioId: "hello",
      status: 200,
      durationMs: expect.any(Number),
      stream: false,
      request: {
        provider: "openai",
        endpoint: "/v1/chat/completions",
        method: "POST",
        model: "gpt-4o-mini",
        rawBody: {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "hello" }]
        },
        headers: expect.any(Object),
        query: {}
      },
      responseBody: expect.any(Object)
    });

    await app.close();
  });
});
