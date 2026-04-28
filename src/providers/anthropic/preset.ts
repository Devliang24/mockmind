import type { ProviderPreset } from "../types.js";

export const anthropicPreset: ProviderPreset = {
  provider: "anthropic",
  displayName: "Anthropic",
  groups: ["international", "native"],
  defaultModels: ["claude-sonnet-4-5-20250929"],
  latestModels: ["claude-opus-4-1-20250805", "claude-sonnet-4-5-20250929", "claude-haiku-4-5-20251001"],
  modelPatterns: [/^claude-/],
  routes: [
    { method: "POST", path: "/v1/messages", protocol: "anthropic-messages", endpoint: "/v1/messages" }
  ]
};
