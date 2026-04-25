import type { ProviderPreset } from "../types.js";

export const zhipuPreset: ProviderPreset = {
  provider: "zhipu",
  displayName: "Zhipu GLM",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["glm-4"],
  modelPatterns: [/^glm-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model glm-*" },
    { method: "POST", path: "/zhipu/v1/chat/completions", protocol: "openai-compatible", endpoint: "/zhipu/v1/chat/completions" },
    { method: "POST", path: "/api/paas/v4/chat/completions", protocol: "openai-compatible", endpoint: "/api/paas/v4/chat/completions" }
  ]
};
