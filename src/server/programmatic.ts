import type { FastifyInstance } from "fastify";
import { loadConfig } from "../config/loader.js";
import type { MockMindConfig } from "../core/scenario/types.js";
import { createMockMindServer } from "./create-server.js";
import type { ServerContext } from "./context.js";

export type CreateMockMindServerOptions = {
  configFile?: string;
  config?: MockMindConfigOverride;
  host?: string;
  port?: number;
};

export type MockMindConfigOverride = Partial<Omit<MockMindConfig, "server" | "providers" | "auth" | "defaults" | "fallback">> & {
  server?: Partial<MockMindConfig["server"]>;
  providers?: Partial<MockMindConfig["providers"]>;
  auth?: Partial<MockMindConfig["auth"]>;
  defaults?: Partial<MockMindConfig["defaults"]>;
  fallback?: Partial<MockMindConfig["fallback"]>;
};

export type MockMindServerHandle = {
  app: FastifyInstance;
  context: ServerContext;
  url: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  resetRequests: () => Promise<void>;
  getRequests: () => Promise<ReturnType<ServerContext["recorder"]["list"]>>;
};

export async function createMockLLMServer(options: CreateMockMindServerOptions = {}): Promise<MockMindServerHandle> {
  const loadedConfig = loadConfig(options.configFile);
  const config = mergeConfig(loadedConfig, options.config);
  if (options.host) config.server.host = options.host;
  if (options.port !== undefined) config.server.port = options.port;

  const { app, context } = await createMockMindServer(config);
  const host = config.server.host;
  const port = config.server.port;

  return {
    app,
    context,
    url: `http://${host}:${port}`,
    async start() {
      await app.listen({ host, port });
    },
    async stop() {
      await app.close();
    },
    async resetRequests() {
      context.recorder.reset();
    },
    async getRequests() {
      return context.recorder.list();
    }
  };
}

function mergeConfig(base: MockMindConfig, override: MockMindConfigOverride | undefined): MockMindConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    server: { ...base.server, ...override.server },
    providers: { ...base.providers, ...override.providers },
    auth: { ...base.auth, ...override.auth },
    defaults: { ...base.defaults, ...override.defaults },
    fallback: { ...base.fallback, ...override.fallback },
    models: override.models ?? base.models,
    scenarios: override.scenarios ?? base.scenarios
  };
}
