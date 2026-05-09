import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import YAML from "yaml";
import { withRegistryDefaults } from "./defaults.js";
import { configSchema } from "./schema.js";
import type { MockMindConfig } from "../core/scenario/types.js";

export function loadConfig(configFile = "mockmind.yaml"): MockMindConfig {
  const filePath = resolve(configFile);
  if (!existsSync(filePath)) {
    return withRegistryDefaults(configSchema.parse({}) as MockMindConfig);
  }

  const raw = readFileSync(filePath, "utf8");
  const data = extname(filePath) === ".json" ? JSON.parse(raw) : YAML.parse(raw);
  return withRegistryDefaults(configSchema.parse(data) as MockMindConfig);
}

export function validateConfig(configFile = "mockmind.yaml"): MockMindConfig {
  return loadConfig(configFile);
}
