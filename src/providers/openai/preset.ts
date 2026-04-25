import type { ProviderPreset } from "../types.js";

export const openaiPreset: ProviderPreset = {
  provider: "openai",
  displayName: "OpenAI Compatible",
  groups: ["international", "openai-compatible"],
  defaultModels: ["gpt-4o-mini"],
  modelPatterns: [/^gpt-/, /^o\d/, /^text-embedding-/],
  routes: [
    { method: "GET", path: "/v1/models", protocol: "openai-compatible", endpoint: "/v1/models" },
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions" },
    { method: "POST", path: "/v1/embeddings", protocol: "openai-embeddings", endpoint: "/v1/embeddings" },
    { method: "POST", path: "/v1/responses", protocol: "openai-responses", endpoint: "/v1/responses" },
    { method: "POST", path: "/v1/images/generations", protocol: "openai-images", endpoint: "/v1/images/generations" },
    { method: "POST", path: "/v1/audio/speech", protocol: "openai-audio", endpoint: "/v1/audio/speech" },
    { method: "POST", path: "/v1/audio/transcriptions", protocol: "openai-audio", endpoint: "/v1/audio/transcriptions" },
    { method: "POST", path: "/v1/audio/translations", protocol: "openai-audio", endpoint: "/v1/audio/translations" },
    { method: "POST", path: "/v1/moderations", protocol: "openai-moderations", endpoint: "/v1/moderations" },
    { method: "GET", path: "/v1/files", protocol: "openai-files", endpoint: "/v1/files" },
    { method: "POST", path: "/v1/files", protocol: "openai-files", endpoint: "/v1/files" },
    { method: "GET", path: "/v1/files/:fileId", protocol: "openai-files", endpoint: "/v1/files/:fileId" },
    { method: "DELETE", path: "/v1/files/:fileId", protocol: "openai-files", endpoint: "/v1/files/:fileId" },
    { method: "POST", path: "/v1/batches", protocol: "openai-batch", endpoint: "/v1/batches" },
    { method: "GET", path: "/v1/batches/:batchId", protocol: "openai-batch", endpoint: "/v1/batches/:batchId" },
    { method: "POST", path: "/v1/batches/:batchId/cancel", protocol: "openai-batch", endpoint: "/v1/batches/:batchId/cancel" }
  ]
};
