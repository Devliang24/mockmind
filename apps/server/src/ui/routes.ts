import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import type { FastifyInstance } from "fastify";
import { uiCss, uiHtml, uiJs } from "./assets.js";

export async function registerUiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => reply.redirect("/console"));
  app.get("/console", async (_request, reply) => {
    const html = readConsoleAsset("index.html");
    return reply.type("text/html; charset=utf-8").send(html ?? uiHtml);
  });
  app.get("/console/style.css", async (_request, reply) => {
    const css = readConsoleAsset("style.css");
    return reply.type("text/css; charset=utf-8").send(css ?? uiCss);
  });
  app.get("/console/app.js", async (_request, reply) => {
    const js = readConsoleAsset("app.js");
    return reply.type("application/javascript; charset=utf-8").send(js ?? uiJs);
  });
}

function readConsoleAsset(fileName: "index.html" | "style.css" | "app.js"): string | undefined {
  for (const root of consoleAssetRoots()) {
    const filePath = join(root, fileName);
    if (existsSync(filePath)) return readFileSync(filePath, "utf8");
  }
  return undefined;
}

function consoleAssetRoots(): string[] {
  return [
    process.env.MOCKMIND_CONSOLE_DIST,
    join(process.cwd(), "dist/console"),
    join(process.cwd(), "apps/server/dist/console"),
    cliConsoleRoot()
  ].filter((root): root is string => Boolean(root));
}

function cliConsoleRoot(): string | undefined {
  const entry = process.argv[1];
  if (!entry) return undefined;
  try {
    return join(dirname(dirname(realpathSync(entry))), "console");
  } catch {
    return undefined;
  }
}
