import type { ProviderPreset } from "../types.js";

export const aliyunBailianPreset: ProviderPreset = {
  provider: "aliyun-bailian",
  displayName: "Alibaba Bailian / DashScope",
  groups: ["chinese", "openai-compatible", "native"],
  defaultModels: ["qwen-plus"],
  modelPatterns: [/^qwen-/],
  routes: [
    { method: "POST", path: "/v1/chat/completions", protocol: "openai-compatible", endpoint: "/v1/chat/completions", description: "via model qwen-*" },
    { method: "POST", path: "/compatible-mode/v1/chat/completions", protocol: "openai-compatible", endpoint: "/compatible-mode/v1/chat/completions" },
    { method: "POST", path: "/api/v1/services/aigc/text-generation/generation", protocol: "dashscope-generation", endpoint: "/api/v1/services/aigc/text-generation/generation" },
    { method: "POST", path: "/dashscope/api/v1/services/aigc/text-generation/generation", protocol: "dashscope-generation", endpoint: "/dashscope/api/v1/services/aigc/text-generation/generation" }
  ]
};
