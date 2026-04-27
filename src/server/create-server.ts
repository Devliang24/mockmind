import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAdminRoutes } from "../admin/routes.js";
import type { MockMindConfig } from "../core/scenario/types.js";
import { registerAllProviderRoutes } from "../providers/registry.js";
import { registerUiRoutes } from "../ui/routes.js";
import { createServerContext } from "./context.js";

export async function createMockMindServer(config: MockMindConfig) {
  const app = Fastify({ logger: false });
  const context = createServerContext(config);
  app.addHook("onClose", async () => {
    context.recorder.close();
  });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true, name: "mockmind" }));

  await registerAllProviderRoutes(app, context);
  await registerAdminRoutes(app, context);
  await registerUiRoutes(app);

  return { app, context };
}
