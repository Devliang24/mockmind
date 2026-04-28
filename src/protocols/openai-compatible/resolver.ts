import type { Provider } from "../../core/scenario/types.js";
import { providerRegistry, resolveProviderByModel } from "../../providers/registry.js";

export function resolveOpenAICompatibleProvider(model: string | undefined, endpoint?: string): Provider {
  const provider = resolveProviderByModel(model);
  if (!provider) return "openai";
  if (!endpoint) return provider;
  const registration = providerRegistry.find((item) => item.provider === provider);
  const supportsEndpoint = registration?.routes.some((route) => route.protocol === "openai-compatible" && route.endpoint === endpoint);
  return supportsEndpoint ? provider : "openai";
}
