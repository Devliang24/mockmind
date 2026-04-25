import type { FastifyInstance } from "fastify";
import { providerGroups, providerRegistry, providerRouteSummaries } from "../providers/registry.js";
import type { ServerContext } from "../server/context.js";

export async function registerAdminRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
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
      configuredModels: context.config.models.filter((model) => model.provider === registration.provider).map((model) => model.id),
      routes: providerRouteSummaries(registration)
    })),
    groups: providerGroups()
  }));
  app.get("/__admin/routes", async () => providerRegistry.flatMap((registration) => providerRouteSummaries(registration).map((route) => ({ provider: registration.provider, route }))));
  app.post("/__admin/reset", async () => {
    context.recorder.reset();
    return { ok: true };
  });
  app.post("/__admin/reload", async () => ({ ok: false, message: "Reload is not implemented in this MVP." }));
}
