import type { FastifyInstance } from "fastify";
import { uiCss, uiHtml, uiJs } from "./assets.js";

export async function registerUiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => reply.redirect("/console"));
  app.get("/console", async (_request, reply) => reply.type("text/html; charset=utf-8").send(uiHtml));
  app.get("/console/style.css", async (_request, reply) => reply.type("text/css; charset=utf-8").send(uiCss));
  app.get("/console/app.js", async (_request, reply) => reply.type("application/javascript; charset=utf-8").send(uiJs));
}
