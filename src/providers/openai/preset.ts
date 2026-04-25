import type { ProviderPreset } from "../types.js";

export const openaiPreset: ProviderPreset = {
  provider: "openai",
  displayName: "OpenAI Compatible",
  groups: ["international", "openai-compatible"],
  defaultModels: ["gpt-4o-mini"],
  modelPatterns: [/^gpt-/, /^o\d/, /^text-embedding-/],
  routes: [
    { method: "GET", path: "/v1/models", protocol: "openai-compatible", endpoint: "/v1/models" },
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions" },
    { method: "POST", path: "/v1/embeddings", protocol: "openai-embeddings", endpoint: "/v1/embeddings" }
  ]
};
