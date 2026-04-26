import type { ProviderPreset } from "../types.js";

export const deepseekPreset: ProviderPreset = {
  provider: "deepseek",
  displayName: "DeepSeek",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["deepseek-chat", "deepseek-reasoner"],
  latestModels: ["deepseek-v4-pro", "deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"],
  modelPatterns: [/^deepseek-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model deepseek-*" },
    { method: "POST", path: "/deepseek/v1/chat/completions", protocol: "openai-compatible", endpoint: "/deepseek/v1/chat/completions" },
    { method: "POST", path: "/deepseek/v1/embeddings", protocol: "openai-embeddings", endpoint: "/deepseek/v1/embeddings" }
  ]
};
