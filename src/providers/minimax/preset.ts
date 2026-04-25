import type { ProviderPreset } from "../types.js";

export const minimaxPreset: ProviderPreset = {
  provider: "minimax",
  displayName: "MiniMax",
  groups: ["chinese", "openai-compatible", "native"],
  defaultModels: ["abab6.5s-chat"],
  modelPatterns: [/^abab/i, /^minimax-/i],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model abab* or minimax-*" },
    { method: "POST", path: "/minimax/v1/text/chatcompletion_v2", protocol: "minimax-chat", endpoint: "/minimax/v1/text/chatcompletion_v2" },
    { method: "POST", path: "/v1/text/chatcompletion_v2", protocol: "minimax-chat", endpoint: "/v1/text/chatcompletion_v2" }
  ]
};
