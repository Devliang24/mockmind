import type { FastifyInstance } from "fastify";
import type { ServerContext } from "../server/context.js";
import { getProtocolHandler } from "../protocols/registry.js";
import type { ProviderRegistration, ProviderRoute } from "./types.js";

export async function registerProviderRoutes(app: FastifyInstance, context: ServerContext, provider: ProviderRegistration): Promise<void> {
  for (const route of provider.routes) {
    if (route.description?.startsWith("via model")) continue;
    const handler = getProtocolHandler(route.protocol);
    if (!handler) continue;
    app.route({
      method: route.method,
      url: route.path,
      handler: async (request, reply) => handler({ context, provider: provider.provider, endpoint: endpointFor(route, request.params), routePath: route.path }, request, reply)
    });
  }
}

function endpointFor(route: ProviderRoute, params: unknown): string {
  if (!params || typeof params !== "object") return route.endpoint;
  let endpoint = route.endpoint;
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (typeof value === "string") endpoint = endpoint.replace(`:${key}`, value);
  }
  return endpoint;
}
