export function rerankModelsForProvider(providerId: string): string[] {
  if (providerId === "aliyun-bailian") return ["qwen3-rerank", "gte-rerank-v2", "qwen3-vl-rerank"];
  if (providerId === "zhipu") return ["rerank-mock"];
  return [];
}

export function embeddingModelForProvider(providerId: string): string {
  if (providerId === "aliyun-bailian") return "text-embedding-v3";
  if (providerId === "zhipu") return "embedding-3";
  return "text-embedding-3-small";
}
