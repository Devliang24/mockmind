import type { ProviderPreset } from "../types.js";

export const zhipuPreset: ProviderPreset = {
  provider: "zhipu",
  displayName: "Zhipu GLM",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["glm-5.1"],
  latestModels: ["glm-5.1", "glm-5", "glm-4.7", "glm-4.6"],
  modelPatterns: [/^glm-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model glm-*" },
    { method: "POST", path: "/zhipu/v1/chat/completions", protocol: "openai-compatible", endpoint: "/zhipu/v1/chat/completions" },
    { method: "POST", path: "/api/paas/v4/chat/completions", protocol: "openai-compatible", endpoint: "/api/paas/v4/chat/completions" },
    { method: "POST", path: "/api/paas/v4/embeddings", protocol: "openai-embeddings", endpoint: "/api/paas/v4/embeddings" },
    { method: "POST", path: "/zhipu/v1/embeddings", protocol: "openai-embeddings", endpoint: "/zhipu/v1/embeddings" },
    { method: "POST", path: "/api/paas/v4/rerank", protocol: "rerank", endpoint: "/api/paas/v4/rerank" },
    { method: "POST", path: "/zhipu/v1/rerank", protocol: "rerank", endpoint: "/zhipu/v1/rerank" }
  ]
};
