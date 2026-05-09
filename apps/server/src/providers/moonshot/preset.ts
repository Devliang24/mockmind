import type { ProviderPreset } from "../types.js";

export const moonshotPreset: ProviderPreset = {
  provider: "moonshot",
  displayName: "Moonshot / Kimi",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["kimi-k2.6"],
  latestModels: ["kimi-k2.6", "kimi-k2.5", "kimi-k2-thinking", "kimi-k2-thinking-turbo"],
  modelPatterns: [/^moonshot-/, /^kimi-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "selected by model moonshot-* or kimi-*", register: false }
  ]
};
