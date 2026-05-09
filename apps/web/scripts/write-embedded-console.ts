import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { uiCss, uiHtml, uiJs } from "../../server/src/ui/assets.js";

const webRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const publicDir = join(webRoot, "public");
const distDir = join(webRoot, "dist");

mkdirSync(publicDir, { recursive: true });
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

writeFileSync(join(webRoot, "index.html"), uiHtml);
writeFileSync(join(publicDir, "style.css"), uiCss);
writeFileSync(join(publicDir, "app.js"), uiJs);
writeFileSync(join(distDir, "index.html"), uiHtml);
writeFileSync(join(distDir, "style.css"), uiCss);
writeFileSync(join(distDir, "app.js"), uiJs);

console.log(`Wrote console assets to ${distDir}`);
