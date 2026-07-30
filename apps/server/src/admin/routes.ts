import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  AdminModelsResponse,
  AdminOverviewResponse,
  AdminProvidersResponse,
  AdminRecordedRequest,
  AdminRequestsResponse,
  AdminResetResponse,
  AdminRoute,
  AdminRoutesResponse,
  AdminScenario,
  AdminSettingsResponse
} from "@mockmind/shared";
import type { FastifyInstance } from "fastify";
import { authInfoForProvider } from "../core/auth/auth-mock.js";
import { providerGroups, providerRegistry, providerRouteSummaries } from "../providers/registry.js";
import type { ServerContext } from "../server/context.js";

export async function registerAdminRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.get("/__admin/overview", async (): Promise<AdminOverviewResponse> => {
    const requests = context.recorder.list() as AdminRecordedRequest[];
    return {
      ok: true,
      name: "mockmind",
      version: packageVersion(),
      server: context.config.server,
      auth: { mode: context.config.auth.mode },
      providers: context.config.providers,
      providersCount: providerRegistry.length,
      modelsCount: context.config.models.length,
      scenariosCount: context.scenarios.list().length,
      requestsCount: requests.length,
      recentRequests: requests.slice(-10)
    };
  });
  app.get("/__admin/config", async () => context.config);
  app.get("/__admin/settings", async (): Promise<AdminSettingsResponse> => adminSettings(context));
  app.patch("/__admin/settings", async (request): Promise<AdminSettingsResponse> => {
    const body = request.body as { disabledModelStatusCode?: unknown; latencyMs?: unknown; providerLatencyMs?: unknown; modelLatencyMs?: unknown };
    if (body.disabledModelStatusCode !== undefined) {
      if (typeof body.disabledModelStatusCode !== "number" || Number.isNaN(body.disabledModelStatusCode)) throw { statusCode: 400, message: "disabledModelStatusCode must be a number." };
      context.systemSettings.disabledModelStatusCode = body.disabledModelStatusCode;
    }
    if (body.latencyMs !== undefined) {
      if (typeof body.latencyMs !== "number" || Number.isNaN(body.latencyMs)) throw { statusCode: 400, message: "latencyMs must be a number." };
      context.systemSettings.latencyMs = body.latencyMs;
    }
    if (body.providerLatencyMs !== undefined) {
      if (!isNumberRecord(body.providerLatencyMs)) throw { statusCode: 400, message: "providerLatencyMs must be a number map." };
      context.systemSettings.providerLatencyMs = body.providerLatencyMs;
    }
    if (body.modelLatencyMs !== undefined) {
      if (!isNumberRecord(body.modelLatencyMs)) throw { statusCode: 400, message: "modelLatencyMs must be a number map." };
      context.systemSettings.modelLatencyMs = body.modelLatencyMs;
    }
    return adminSettings(context);
  });
  app.get("/__admin/models", async (): Promise<AdminModelsResponse> => ({
    data: context.config.models.map((model) => ({
      ...model,
      displayName: providerRegistry.find((registration) => registration.provider === model.provider)?.displayName ?? model.provider,
      disabled: context.disabledModels.has(model.id)
    }))
  }));
  app.patch("/__admin/models/:id", async (request): Promise<{ ok: boolean; id: string; disabled: boolean }> => {
    const { id } = request.params as { id: string };
    const body = request.body as { disabled?: boolean };
    if (typeof body.disabled !== "boolean") {
      throw { statusCode: 400, message: "Missing required boolean field: disabled." };
    }
    if (body.disabled) {
      context.disabledModels.add(id);
    } else {
      context.disabledModels.delete(id);
    }
    return { ok: true, id, disabled: body.disabled };
  });
  app.get("/__admin/scenarios", async (): Promise<AdminScenario[]> => context.scenarios.list().map((scenario) => ({
    ...scenario,
    match: scenario.match,
    response: scenario.response as Record<string, unknown>
  })));
  app.get("/__admin/requests", async (): Promise<AdminRequestsResponse> => context.recorder.list() as AdminRecordedRequest[]);
  app.get("/__admin/providers", async (): Promise<AdminProvidersResponse> => ({
    mode: "all",
    providers: providerRegistry.map((registration) => ({
      provider: registration.provider,
      displayName: registration.displayName,
      groups: registration.groups,
      auth: authInfoForProvider(registration.provider, defaultApiKey(context)),
      defaultModels: registration.defaultModels,
      latestModels: registration.latestModels ?? registration.defaultModels,
      configuredModels: context.config.models.filter((model) => model.provider === registration.provider).map((model) => model.id),
      modelVersions: registration.modelVersions,
      routes: providerRouteSummaries(registration)
    })),
    groups: providerGroups()
  }));
  app.get("/__admin/routes", async (): Promise<AdminRoutesResponse> => providerRegistry.flatMap((registration) => registration.routes.map((route): AdminRoute => ({
    provider: registration.provider,
    displayName: registration.displayName,
    groups: registration.groups,
    auth: authInfoForProvider(registration.provider, defaultApiKey(context)),
    method: route.method,
    path: route.path,
    protocol: route.protocol,
    endpoint: route.endpoint,
    description: route.description ?? protocolLabel(route.protocol, route.path)
  }))));
  app.post("/__admin/reset", async (): Promise<AdminResetResponse> => {
    context.recorder.reset();
    return { ok: true };
  });
  app.post("/__admin/reload", async () => ({ ok: false, message: "Reload is not implemented in this MVP." }));
}

function adminSettings(context: ServerContext): AdminSettingsResponse {
  return {
    disabledModelStatusCode: context.systemSettings.disabledModelStatusCode,
    latencyMs: context.systemSettings.latencyMs,
    providerLatencyMs: context.systemSettings.providerLatencyMs,
    modelLatencyMs: context.systemSettings.modelLatencyMs
  };
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === "number" && !Number.isNaN(item));
}

function defaultApiKey(context: ServerContext): string {
  return context.config.auth.apiKeys[0] ?? "123456";
}

function packageVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { version?: string };
    return packageJson.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function protocolLabel(protocol: string, path: string): string {
  if (protocol === "openai-compatible") {
    if (path.includes("/models")) return "Models";
    return path.includes("chat/completions") ? "Chat Completions" : "OpenAI Compatible";
  }
  if (protocol === "openai-embeddings") return "Embeddings";
  if (protocol === "openai-responses") return "Responses";
  if (protocol === "anthropic-messages") return "Messages";
  if (protocol === "gemini-generate-content") return path.includes("streamGenerateContent") ? "streamGenerateContent" : "generateContent";
  if (protocol === "dashscope-generation") return "Native Text Generation";
  if (protocol === "minimax-chat") return "ChatCompletion v2";
  if (protocol === "rerank") return "Rerank";
  return protocol;
}
