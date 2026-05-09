import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const webDist = join(serverRoot, "../web/dist");
const consoleDist = join(serverRoot, "dist/console");

if (!existsSync(webDist)) {
  console.warn("Skipping console asset copy because apps/web/dist does not exist");
  process.exit(0);
}

rmSync(consoleDist, { recursive: true, force: true });
cpSync(webDist, consoleDist, { recursive: true });
console.log(`Copied console assets to ${consoleDist}`);
