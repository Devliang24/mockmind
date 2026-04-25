import type { Provider } from "../../core/scenario/types.js";
import { resolveProviderByModel } from "../../providers/registry.js";

export function resolveOpenAICompatibleProvider(model: string | undefined): Provider {
  return resolveProviderByModel(model) ?? "openai";
}
