import type { FastifyInstance } from "fastify";
import type { ServerContext } from "../../server/context.js";
import { registerProviderRoutes } from "../register-routes.js";
import { geminiProvider } from "./index.js";

export async function registerGeminiRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  await registerProviderRoutes(app, context, geminiProvider);
}
