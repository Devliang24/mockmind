import type { ProviderPreset } from "../types.js";

export const azurePreset: ProviderPreset = {
  provider: "azure",
  displayName: "Azure OpenAI / Microsoft Foundry",
  groups: ["international", "openai-compatible", "azure", "enterprise"],
  defaultModels: ["gpt-5.4-mini"],
  latestModels: ["gpt-5.4", "gpt-5.4-mini", "gpt-5.3-codex"],
  modelVersions: {
    "gpt-5.4": "2026-03-05",
    "gpt-5.4-mini": "2026-03-17",
    "gpt-5.3-codex": "2026-02-24"
  },
  routes: [
    { method: "POST", path: "/openai/deployments/:deployment/chat/completions", protocol: "openai-compatible", endpoint: "/openai/deployments/:deployment/chat/completions", description: "Azure deployment Chat Completions" },
    { method: "POST", path: "/openai/v1/responses", protocol: "openai-responses", endpoint: "/openai/v1/responses", description: "Azure OpenAI Responses" }
  ]
};
