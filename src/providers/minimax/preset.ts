import type { ProviderPreset } from "../types.js";

export const minimaxPreset: ProviderPreset = {
  provider: "minimax",
  displayName: "MiniMax",
  groups: ["chinese", "openai-compatible", "native"],
  defaultModels: ["MiniMax-M2.7"],
  latestModels: ["MiniMax-M2.7", "MiniMax-M2.7-highspeed", "MiniMax-M2.5", "MiniMax-M2.5-highspeed"],
  modelPatterns: [/^abab/i, /^minimax-/i],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "selected by model MiniMax-* or abab*", register: false },
    { method: "POST", path: "/v1/text/chatcompletion_v2", protocol: "minimax-chat", endpoint: "/v1/text/chatcompletion_v2" }
  ]
};
