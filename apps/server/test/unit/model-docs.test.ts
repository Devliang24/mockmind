import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { providerRegistry } from "../../src/providers/registry.js";

const root = join(import.meta.dirname, "../../../..");

function doc(name: string): string {
  return readFileSync(join(root, name), "utf8");
}

// The model tables in README / docs are hand-written next to the provider presets.
// Adding a preset model without updating the docs silently ships undocumented models.
describe("documented model tables", () => {
  const models = providerRegistry.flatMap((preset) => [...preset.defaultModels, ...(preset.latestModels ?? [])]);

  it.each(["README.md", "docs/providers.md"])("lists every preset model in %s", (file) => {
    const text = doc(file);
    const missing = [...new Set(models)].filter((model) => !text.includes(`\`${model}\``));
    expect(missing).toEqual([]);
  });
});
