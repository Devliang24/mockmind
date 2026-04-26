import type { ProviderPreset } from "../types.js";

export const anthropicPreset: ProviderPreset = {
  provider: "anthropic",
  displayName: "Anthropic",
  groups: ["international", "native"],
  defaultModels: ["claude-3-5-sonnet-latest"],
  latestModels: ["claude-sonnet-4-5", "claude-haiku-4-5", "claude-opus-4-1", "claude-sonnet-4-5-thinking", "claude-opus-4-1-thinking"],
  modelPatterns: [/^claude-/],
  routes: [
    { method: "POST", path: "/v1/messages", protocol: "anthropic-messages", endpoint: "/v1/messages" },
    { method: "POST", path: "/anthropic/v1/messages", protocol: "anthropic-messages", endpoint: "/anthropic/v1/messages" }
  ]
};
