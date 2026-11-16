import type { ProviderPreset } from "../types.js";

export const anthropicPreset: ProviderPreset = {
  provider: "anthropic",
  displayName: "Anthropic",
  groups: ["international", "native"],
  defaultModels: ["claude-sonnet-4-6"],
  latestModels: [
    "claude-fable-5-2",
    "claude-mythos-5-1",
    "claude-opus-5-5",
    "claude-sonnet-5-5",
    "claude-haiku-5-5",
    "claude-opus-4-7",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001"
  ],
  modelPatterns: [/^claude-/],
  routes: [
    { method: "POST", path: "/v1/messages", protocol: "anthropic-messages", endpoint: "/v1/messages" }
  ]
};
