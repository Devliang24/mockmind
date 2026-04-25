import type { FastifyInstance } from "fastify";
import type { ServerContext } from "../../server/context.js";
import { registerProviderRoutes } from "../register-routes.js";
import { aliyunBailianProvider } from "./index.js";

export async function registerAliyunBailianRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  await registerProviderRoutes(app, context, aliyunBailianProvider);
}
