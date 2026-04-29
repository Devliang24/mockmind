import type { ProviderPreset } from "../types.js";

export const zhipuPreset: ProviderPreset = {
  provider: "zhipu",
  displayName: "Zhipu GLM",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["glm-5.1"],
  latestModels: ["glm-5.1", "glm-5", "glm-5-turbo", "glm-4.7"],
  modelPatterns: [/^glm-/i],
  routes: [
    { method: "POST", path: "/api/paas/v4/chat/completions", protocol: "openai-compatible", endpoint: "/api/paas/v4/chat/completions" },
    { method: "POST", path: "/api/coding/paas/v4/chat/completions", protocol: "openai-compatible", endpoint: "/api/coding/paas/v4/chat/completions", description: "Coding Plan OpenAI-compatible chat completions" },
    { method: "POST", path: "/api/paas/v4/embeddings", protocol: "openai-embeddings", endpoint: "/api/paas/v4/embeddings" },
    { method: "POST", path: "/api/paas/v4/rerank", protocol: "rerank", endpoint: "/api/paas/v4/rerank" }
  ]
};
