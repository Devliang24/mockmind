import type { ProviderPreset } from "../types.js";

export const geminiPreset: ProviderPreset = {
  provider: "gemini",
  displayName: "Google Gemini",
  groups: ["international", "native"],
  defaultModels: ["gemini-1.5-pro"],
  modelPatterns: [/^gemini-/],
  routes: [
    { method: "POST", path: "/v1beta/models/:modelAndMethod", protocol: "gemini-generate-content", endpoint: "/v1beta/models/:modelAndMethod", description: "supports :generateContent and :streamGenerateContent" },
    { method: "POST", path: "/gemini/v1beta/models/:modelAndMethod", protocol: "gemini-generate-content", endpoint: "/gemini/v1beta/models/:modelAndMethod", description: "supports :generateContent and :streamGenerateContent" }
  ]
};
