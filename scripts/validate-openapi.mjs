import { readFileSync } from "node:fs";
import { parse } from "yaml";

const specPath = new URL("../docs/api/openapi.yaml", import.meta.url);
const spec = parse(readFileSync(specPath, "utf8"));

if (!spec || typeof spec !== "object") {
  throw new Error("OpenAPI document must parse to an object");
}

if (!String(spec.openapi ?? "").startsWith("3.")) {
  throw new Error("OpenAPI document must declare an OpenAPI 3.x version");
}

if (!spec.info?.title || !spec.info?.version) {
  throw new Error("OpenAPI document must include info.title and info.version");
}

if (!spec.paths || typeof spec.paths !== "object" || Object.keys(spec.paths).length === 0) {
  throw new Error("OpenAPI document must define at least one path");
}

console.log(`Validated ${Object.keys(spec.paths).length} OpenAPI paths`);
