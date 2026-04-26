import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { providerGroups, providerRegistry, providerRouteSummaries } from "../providers/registry.js";
import type { ServerContext } from "../server/context.js";

export async function registerAdminRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.get("/__admin/overview", async () => {
    const requests = context.recorder.list();
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
  app.get("/__admin/models", async () => ({
    data: context.config.models.map((model) => ({
      ...model,
      displayName: providerRegistry.find((registration) => registration.provider === model.provider)?.displayName ?? model.provider
    }))
  }));
  app.get("/__admin/scenarios", async () => context.scenarios.list());
  app.get("/__admin/requests", async () => context.recorder.list());
  app.get("/__admin/providers", async () => ({
    mode: "all",
    providers: providerRegistry.map((registration) => ({
      provider: registration.provider,
      displayName: registration.displayName,
      groups: registration.groups,
      defaultModels: registration.defaultModels,
      latestModels: registration.latestModels ?? registration.defaultModels,
      configuredModels: context.config.models.filter((model) => model.provider === registration.provider).map((model) => model.id),
      routes: providerRouteSummaries(registration)
    })),
    groups: providerGroups()
  }));
  app.get("/__admin/routes", async () => providerRegistry.flatMap((registration) => registration.routes.map((route) => ({
    provider: registration.provider,
    displayName: registration.displayName,
    groups: registration.groups,
    method: route.method,
    path: route.path,
    protocol: route.protocol,
    endpoint: route.endpoint,
    description: route.description ?? protocolLabel(route.protocol, route.path)
  }))));
  app.post("/__admin/reset", async () => {
    context.recorder.reset();
    return { ok: true };
  });
  app.post("/__admin/reload", async () => ({ ok: false, message: "Reload is not implemented in this MVP." }));
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
