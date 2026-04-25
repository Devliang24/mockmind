import type { FastifyInstance } from "fastify";
import type { Provider } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";

export type ProviderGroup = "chinese" | "international" | "openai-compatible" | "native";

export type ProviderRoute = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  protocol: string;
  endpoint: string;
  description?: string;
};

export type ProviderPreset = {
  provider: Provider;
  displayName: string;
  groups: ProviderGroup[];
  defaultModels: string[];
  modelPatterns?: RegExp[];
  routes: ProviderRoute[];
};

export type ProviderRegistration = ProviderPreset & {
  registerRoutes: (app: FastifyInstance, context: ServerContext) => Promise<void>;
};

export function defineProvider(registration: ProviderRegistration): ProviderRegistration {
  return registration;
}

export function routeSummary(route: ProviderRoute): string {
  return `${route.method} ${route.path}${route.description ? ` ${route.description}` : ""}`;
}
