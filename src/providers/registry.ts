import type { FastifyInstance } from "fastify";
import type { Provider } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";
import { registerAliyunBailianRoutes } from "./aliyun-bailian/routes.js";
import { registerAnthropicRoutes } from "./anthropic/routes.js";
import { registerGeminiRoutes } from "./gemini/routes.js";
import { registerOpenAIRoutes } from "./openai/routes.js";

export type ProviderGroup = "chinese" | "international" | "openai-compatible" | "native";

export type ProviderRegistration = {
  provider: Provider;
  displayName: string;
  groups: ProviderGroup[];
  defaultModels: string[];
  routes: string[];
  registerRoutes: (app: FastifyInstance, context: ServerContext) => Promise<void>;
};

export const providerRegistry: ProviderRegistration[] = [
  {
    provider: "openai",
    displayName: "OpenAI Compatible",
    groups: ["international", "openai-compatible"],
    defaultModels: ["gpt-4o-mini"],
    routes: ["GET /v1/models", "POST /v1/chat/completions", "POST /v1/embeddings"],
    registerRoutes: registerOpenAIRoutes
  },
  {
    provider: "deepseek",
    displayName: "DeepSeek",
    groups: ["chinese", "openai-compatible"],
    defaultModels: ["deepseek-chat", "deepseek-reasoner"],
    routes: ["POST /v1/chat/completions via model deepseek-*"],
    registerRoutes: async () => undefined
  },
  {
    provider: "moonshot",
    displayName: "Moonshot / Kimi",
    groups: ["chinese", "openai-compatible"],
    defaultModels: ["moonshot-v1-8k"],
    routes: ["POST /v1/chat/completions via model moonshot-* or kimi-*"],
    registerRoutes: async () => undefined
  },
  {
    provider: "zhipu",
    displayName: "Zhipu GLM",
    groups: ["chinese", "openai-compatible"],
    defaultModels: ["glm-4"],
    routes: ["POST /v1/chat/completions via model glm-*"],
    registerRoutes: async () => undefined
  },
  {
    provider: "volcengine-ark",
    displayName: "Volcengine Ark / Doubao",
    groups: ["chinese", "openai-compatible"],
    defaultModels: ["doubao-pro"],
    routes: ["POST /v1/chat/completions via model doubao-*"],
    registerRoutes: async () => undefined
  },
  {
    provider: "aliyun-bailian",
    displayName: "Alibaba Bailian / DashScope",
    groups: ["chinese", "openai-compatible", "native"],
    defaultModels: ["qwen-plus"],
    routes: ["POST /compatible-mode/v1/chat/completions", "POST /api/v1/services/aigc/text-generation/generation", "POST /dashscope/api/v1/services/aigc/text-generation/generation"],
    registerRoutes: registerAliyunBailianRoutes
  },
  {
    provider: "anthropic",
    displayName: "Anthropic",
    groups: ["international", "native"],
    defaultModels: ["claude-3-5-sonnet-latest"],
    routes: ["POST /v1/messages", "POST /anthropic/v1/messages"],
    registerRoutes: registerAnthropicRoutes
  },
  {
    provider: "gemini",
    displayName: "Google Gemini",
    groups: ["international", "native"],
    defaultModels: ["gemini-1.5-pro"],
    routes: ["POST /v1beta/models/:model:generateContent", "POST /v1beta/models/:model:streamGenerateContent", "POST /gemini/v1beta/models/:model:generateContent", "POST /gemini/v1beta/models/:model:streamGenerateContent"],
    registerRoutes: registerGeminiRoutes
  }
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

function providersInGroup(group: ProviderGroup): Provider[] {
  return providerRegistry.filter((registration) => registration.groups.includes(group)).map((registration) => registration.provider);
}
