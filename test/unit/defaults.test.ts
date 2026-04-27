import { describe, expect, it } from "vitest";
import { defaultModels, withRegistryDefaults } from "../../src/config/defaults.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

describe("config defaults", () => {
  it("builds default models from provider registry", () => {
    expect(defaultModels().map((model) => model.id)).toContain("gpt-5.5");
    expect(defaultModels().map((model) => model.id)).toContain("gemini-3-flash-preview");
  });

  it("merges missing registry models", () => {
    const config: MockMindConfig = {
      server: { host: "127.0.0.1", port: 4000 },
      providers: { enabled: "all" },
      auth: { mode: "permissive", apiKeys: [] },
      models: [],
      defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
      fallback: { enabled: true, response: { type: "text", content: "fallback" } },
      scenarios: []
    };

    expect(withRegistryDefaults(config).models.length).toBeGreaterThan(0);
  });
});
