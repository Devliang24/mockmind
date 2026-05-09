import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import type { FastifyInstance } from "fastify";

export async function registerUiRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => reply.redirect("/console"));
  app.get("/console", async (_request, reply) => {
    const html = readConsoleAsset("index.html");
    if (!html) return reply.code(404).send({ error: "Console assets are not built. Run npm run build first." });
    return reply.type(contentType("index.html")).send(html);
  });
  app.get("/console/*", async (request, reply) => {
    const params = request.params as { "*": string };
    const asset = readConsoleAsset(params["*"]);
    if (!asset) return reply.code(404).send({ error: "Console asset not found." });
    return reply.type(contentType(params["*"])).send(asset);
  });
}

function readConsoleAsset(fileName: string): string | undefined {
  for (const root of consoleAssetRoots()) {
    const filePath = safeAssetPath(root, fileName);
    if (!filePath) continue;
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

function safeAssetPath(root: string, fileName: string): string | undefined {
  const rootPath = resolve(root);
  const filePath = resolve(rootPath, fileName);
  const traversal = relative(rootPath, filePath).startsWith("..");
  return traversal ? undefined : filePath;
}

function contentType(fileName: string): string {
  if (fileName.endsWith(".html")) return "text/html; charset=utf-8";
  if (fileName.endsWith(".css")) return "text/css; charset=utf-8";
  if (fileName.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (fileName.endsWith(".json")) return "application/json; charset=utf-8";
  if (extname(fileName) === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}
