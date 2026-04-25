import type { FastifyInstance } from "fastify";
import type { Provider } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";
import { aliyunBailianProvider } from "./aliyun-bailian/index.js";
import { anthropicProvider } from "./anthropic/index.js";
import { deepseekProvider } from "./deepseek/index.js";
import { geminiProvider } from "./gemini/index.js";
import { moonshotProvider } from "./moonshot/index.js";
import { openaiProvider } from "./openai/index.js";
import { minimaxProvider } from "./minimax/index.js";
import type { ProviderGroup, ProviderRegistration, ProviderRoute } from "./types.js";
import { routeSummary } from "./types.js";
import { zhipuProvider } from "./zhipu/index.js";

export type { ProviderGroup, ProviderRegistration, ProviderRoute } from "./types.js";

export const providerRegistry: ProviderRegistration[] = [
  openaiProvider,
  deepseekProvider,
  moonshotProvider,
  zhipuProvider,
  aliyunBailianProvider,
  minimaxProvider,
  anthropicProvider,
  geminiProvider
];

export async function registerAllProviderRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  const seen = new Set<ProviderRegistration["registerRoutes"]>();
  for (const registration of providerRegistry) {
    if (seen.has(registration.registerRoutes)) continue;
    seen.add(registration.registerRoutes);
    await registration.registerRoutes(app, context);
  }
}

export function providerGroups(): Record<ProviderGroup, Provider[]> {
  return {
    chinese: providersInGroup("chinese"),
    international: providersInGroup("international"),
    "openai-compatible": providersInGroup("openai-compatible"),
    native: providersInGroup("native")
  };
}

export function resolveProviderByModel(model: string | undefined): Provider | undefined {
  if (!model) return undefined;
  return providerRegistry.find((registration) => registration.modelPatterns?.some((pattern) => pattern.test(model)))?.provider;
}

export function providerRouteSummaries(provider: ProviderRegistration): string[] {
  return provider.routes.map(routeSummary);
}

function providersInGroup(group: ProviderGroup): Provider[] {
  return providerRegistry.filter((registration) => registration.groups.includes(group)).map((registration) => registration.provider);
}
