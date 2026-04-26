import type { ProviderPreset } from "../types.js";

export const moonshotPreset: ProviderPreset = {
  provider: "moonshot",
  displayName: "Moonshot / Kimi",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["moonshot-v1-8k"],
  latestModels: ["kimi-k2.6", "kimi-k2.5", "kimi-k2-0905-preview", "kimi-k2-thinking-turbo"],
  modelPatterns: [/^moonshot-/, /^kimi-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model moonshot-* or kimi-*" },
    { method: "POST", path: "/moonshot/v1/chat/completions", protocol: "openai-compatible", endpoint: "/moonshot/v1/chat/completions" },
    { method: "POST", path: "/moonshot/v1/embeddings", protocol: "openai-embeddings", endpoint: "/moonshot/v1/embeddings" }
  ]
};
