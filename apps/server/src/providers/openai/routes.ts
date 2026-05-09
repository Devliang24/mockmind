import type { FastifyInstance } from "fastify";
import type { ServerContext } from "../../server/context.js";
import { registerProviderRoutes } from "../register-routes.js";
import { openaiProvider } from "./index.js";

export async function registerOpenAIRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  await registerProviderRoutes(app, context, openaiProvider);
}
