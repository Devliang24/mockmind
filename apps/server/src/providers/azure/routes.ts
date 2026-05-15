import type { FastifyInstance } from "fastify";
import type { ServerContext } from "../../server/context.js";
import { registerProviderRoutes } from "../register-routes.js";
import { azureProvider } from "./index.js";

export async function registerAzureRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  await registerProviderRoutes(app, context, azureProvider);
}
