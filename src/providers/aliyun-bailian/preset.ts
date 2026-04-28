import type { ProviderPreset } from "../types.js";

export const aliyunBailianPreset: ProviderPreset = {
  provider: "aliyun-bailian",
  displayName: "Alibaba Bailian / DashScope",
  groups: ["chinese", "openai-compatible", "native"],
  defaultModels: ["qwen3.6-plus"],
  latestModels: ["qwen3.6-max-preview", "qwen3.6-plus", "qwen3.6-flash", "qwen3.5-plus"],
  modelPatterns: [/^qwen/, /^gte-rerank/, /^text-embedding-/],
  routes: [
    { method: "POST", path: "/compatible-mode/v1/chat/completions", protocol: "openai-compatible", endpoint: "/compatible-mode/v1/chat/completions" },
    { method: "POST", path: "/compatible-mode/v1/responses", protocol: "openai-responses", endpoint: "/compatible-mode/v1/responses" },
    { method: "POST", path: "/api/v1/services/aigc/text-generation/generation", protocol: "dashscope-generation", endpoint: "/api/v1/services/aigc/text-generation/generation" },
    { method: "POST", path: "/compatible-mode/v1/embeddings", protocol: "openai-embeddings", endpoint: "/compatible-mode/v1/embeddings" },
    { method: "POST", path: "/compatible-api/v1/reranks", protocol: "rerank", endpoint: "/compatible-api/v1/reranks" },
    { method: "POST", path: "/api/v1/services/rerank/text-rerank/text-rerank", protocol: "rerank", endpoint: "/api/v1/services/rerank/text-rerank/text-rerank" }
  ]
};
