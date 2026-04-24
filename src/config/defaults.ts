import type { MockMindConfig, ModelConfig } from "../core/scenario/types.js";
import { providerRegistry } from "../providers/registry.js";

export function defaultModels(): ModelConfig[] {
  return providerRegistry.flatMap((registration) => registration.defaultModels.map((id) => ({ id, provider: registration.provider })));
}

export function withRegistryDefaults(config: MockMindConfig): MockMindConfig {
  const existing = new Set(config.models.map((model) => `${model.provider}:${model.id}`));
  const mergedModels = [...config.models];

  for (const model of defaultModels()) {
    const key = `${model.provider}:${model.id}`;
    if (!existing.has(key)) mergedModels.push(model);
  }

  return {
    ...config,
    models: mergedModels
  };
}
