import type { ProviderPreset } from "../types.js";

export const moonshotPreset: ProviderPreset = {
  provider: "moonshot",
  displayName: "Moonshot / Kimi",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["moonshot-v1-8k"],
  modelPatterns: [/^moonshot-/, /^kimi-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model moonshot-* or kimi-*" },
    { method: "POST", path: "/moonshot/v1/chat/completions", protocol: "openai-compatible", endpoint: "/moonshot/v1/chat/completions" },
    { method: "POST", path: "/moonshot/v1/embeddings", protocol: "openai-embeddings", endpoint: "/moonshot/v1/embeddings" }
  ]
};
