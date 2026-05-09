export type ModelPricing = {
  input: string;
  output: string;
  unit: string;
  source: string;
  note?: string;
};

export const modelPricing: Record<string, ModelPricing> = {
  "gpt-5.5": { input: "¥34.28", output: "¥205.69", unit: "1M tokens", source: "OpenAI pricing", note: "converted from USD" },
  "gpt-5.4": { input: "¥17.14", output: "¥137.12", unit: "1M tokens", source: "OpenAI pricing", note: "converted from USD" },
  "gpt-5.4-mini": { input: "¥1.71", output: "¥13.71", unit: "1M tokens", source: "OpenAI pricing", note: "converted from USD" },
  "claude-opus-4-7": { input: "$15", output: "$75", unit: "1M tokens", source: "Anthropic pricing" },
  "claude-sonnet-4-6": { input: "$3", output: "$15", unit: "1M tokens", source: "Anthropic pricing" },
  "gemini-3-pro-preview": { input: "¥13.71", output: "¥82.27", unit: "1M tokens", source: "Gemini pricing", note: "converted from USD" },
  "deepseek-v4-pro": { input: "¥2.98", output: "¥5.96", unit: "1M tokens", source: "DeepSeek pricing" },
  "kimi-k2.6": { input: "¥6.50", output: "¥27.00", unit: "MTok", source: "Kimi pricing" },
  "glm-5.1": { input: "official", output: "official", unit: "varies", source: "Zhipu pricing" },
  "qwen3.6-plus": { input: "¥2", output: "¥12", unit: "1M tokens", source: "Alibaba Model Studio" },
  "MiniMax-M2.7": { input: "¥2.06", output: "¥8.23", unit: "M tokens", source: "MiniMax pricing", note: "converted from USD" }
};

export function priceLabel(model: string): string {
  const price = modelPricing[model];
  if (!price) return "Pricing: not listed in current snapshot";
  const note = price.note ? ` · ${price.note}` : "";
  return `Input ${price.input} / output ${price.output} per ${price.unit} · ${price.source}${note}`;
}
