import type { FastifyInstance } from "fastify";
import { uiCss, uiHtml, uiJs } from "./assets.js";

export async function registerUiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => reply.redirect("/__ui"));
  app.get("/__ui", async (_request, reply) => reply.type("text/html; charset=utf-8").send(uiHtml));
  app.get("/__ui/style.css", async (_request, reply) => reply.type("text/css; charset=utf-8").send(uiCss));
  app.get("/__ui/app.js", async (_request, reply) => reply.type("application/javascript; charset=utf-8").send(uiJs));
}
