import type { ProviderPreset } from "../types.js";

export const geminiPreset: ProviderPreset = {
  provider: "gemini",
  displayName: "Google Gemini",
  groups: ["international", "native"],
  defaultModels: ["gemini-3-flash-preview"],
  latestModels: ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
  modelPatterns: [/^gemini-/],
  routes: [
    { method: "POST", path: "/v1beta/models/:modelAndMethod", protocol: "gemini-generate-content", endpoint: "/v1beta/models/:modelAndMethod", description: "supports :generateContent and :streamGenerateContent" }
  ]
};
