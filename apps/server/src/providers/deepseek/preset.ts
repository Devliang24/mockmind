import type { ProviderPreset } from "../types.js";

export const deepseekPreset: ProviderPreset = {
  provider: "deepseek",
  displayName: "DeepSeek",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["deepseek-v4-flash"],
  latestModels: ["deepseek-v4-pro", "deepseek-v4-flash"],
  modelPatterns: [/^deepseek-/],
  routes: [
    { method: "POST", path: "/chat/completions", protocol: "openai-compatible", endpoint: "/chat/completions" },
    // DeepSeek-style base URLs carry no /v1 prefix, so the SDK-issued path is /responses.
    { method: "POST", path: "/responses", protocol: "openai-responses", endpoint: "/responses" }
  ]
};
