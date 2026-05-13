export type ModelPricing = {
  input: string;
  output?: string;
  unit: string;
  source: string;
  url: string;
  note?: string;
};

const zhipuGlm51Pricing: ModelPricing = {
  input: "¥6 / ¥8",
  output: "¥24 / ¥28",
  unit: "1M tokens",
  source: "智谱开放平台价格",
  url: "https://open.bigmodel.cn/pricing",
  note: "按输入长度 <32K / ≥32K 阶梯"
};

export const modelPricing: Record<string, ModelPricing> = {
  "gpt-5.5": { input: "¥34.28", output: "¥205.69", unit: "1M tokens", source: "OpenAI API Pricing", url: "https://openai.com/api/pricing/", note: "按 USD/CNY 6.8562 换算" },
  "gpt-5.4": { input: "¥17.14", output: "¥102.84", unit: "1M tokens", source: "OpenAI API Pricing", url: "https://openai.com/api/pricing/", note: "按 USD/CNY 6.8562 换算" },
  "gpt-5.4-mini": { input: "¥5.14", output: "¥30.85", unit: "1M tokens", source: "OpenAI API Pricing", url: "https://openai.com/api/pricing/", note: "按 USD/CNY 6.8562 换算" },
  "claude-opus-4-7": { input: "¥34.28", output: "¥171.41", unit: "MTok", source: "Claude API Pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", note: "按 USD/CNY 6.8562 换算" },
  "claude-sonnet-4-6": { input: "¥20.57", output: "¥102.84", unit: "MTok", source: "Claude API Pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", note: "按 USD/CNY 6.8562 换算" },
  "claude-haiku-4-5-20251001": { input: "¥6.86", output: "¥34.28", unit: "MTok", source: "Claude API Pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing", note: "按 USD/CNY 6.8562 换算" },
  "gemini-3-flash-preview": { input: "¥3.43", output: "¥20.57", unit: "1M tokens", source: "Gemini API Pricing", url: "https://ai.google.dev/gemini-api/docs/pricing", note: "text/image/video input · 按 USD/CNY 6.8562 换算" },
  "gemini-2.5-flash": { input: "¥2.06", output: "¥17.14", unit: "1M tokens", source: "Gemini API Pricing", url: "https://ai.google.dev/gemini-api/docs/pricing", note: "text/image/video input · 按 USD/CNY 6.8562 换算" },
  "gemini-2.5-flash-lite": { input: "¥0.69", output: "¥2.74", unit: "1M tokens", source: "Gemini API Pricing", url: "https://ai.google.dev/gemini-api/docs/pricing", note: "text/image/video input · 按 USD/CNY 6.8562 换算" },
  "deepseek-v4-pro": { input: "¥2.98", output: "¥5.96", unit: "1M tokens", source: "DeepSeek Models & Pricing", url: "https://api-docs.deepseek.com/quick_start/pricing", note: "75% off until 2026-05-31 · 按 USD/CNY 6.8562 换算" },
  "deepseek-v4-flash": { input: "¥0.96", output: "¥1.92", unit: "1M tokens", source: "DeepSeek Models & Pricing", url: "https://api-docs.deepseek.com/quick_start/pricing", note: "cache miss input · 按 USD/CNY 6.8562 换算" },
  "kimi-k2.6": { input: "¥6.50", output: "¥27.00", unit: "MTok", source: "Kimi API 开放平台价格", url: "https://platform.kimi.com/" },
  "kimi-k2.5": { input: "¥4.00", output: "¥21.00", unit: "MTok", source: "Kimi API 开放平台价格", url: "https://platform.kimi.com/" },
  "qwen3.6-max-preview": { input: "¥9", output: "¥54", unit: "1M tokens", source: "阿里云百炼模型计费", url: "https://help.aliyun.com/zh/model-studio/models", note: "中国内地最低价" },
  "qwen3.6-plus": { input: "¥2", output: "¥12", unit: "1M tokens", source: "阿里云百炼模型计费", url: "https://help.aliyun.com/zh/model-studio/models", note: "中国内地最低价" },
  "qwen3.6-flash": { input: "¥1.2", output: "¥7.2", unit: "1M tokens", source: "阿里云百炼模型计费", url: "https://help.aliyun.com/zh/model-studio/models", note: "中国内地最低价" },
  "qwen3.5-plus": { input: "¥0.8", output: "¥4.8", unit: "1M tokens", source: "阿里云百炼模型计费", url: "https://help.aliyun.com/zh/model-studio/models", note: "中国内地最低价" },
  "qwen3-rerank": { input: "¥0.5", unit: "1M tokens", source: "阿里云百炼模型计费", url: "https://help.aliyun.com/zh/model-studio/model-pricing", note: "输出不计费 · 中国内地" },
  "glm-5.1": zhipuGlm51Pricing,
  "GLM-5.1": zhipuGlm51Pricing,
  "MiniMax-M2.7": { input: "¥2.06", output: "¥8.23", unit: "M tokens", source: "MiniMax Pay as You Go", url: "https://platform.minimax.io/docs/guides/pricing-paygo", note: "按 USD/CNY 6.8562 换算" },
  "MiniMax-M2.7-highspeed": { input: "¥4.11", output: "¥16.45", unit: "M tokens", source: "MiniMax Pay as You Go", url: "https://platform.minimax.io/docs/guides/pricing-paygo", note: "按 USD/CNY 6.8562 换算" },
  "MiniMax-M2.5": { input: "¥2.06", output: "¥8.23", unit: "M tokens", source: "MiniMax Pay as You Go", url: "https://platform.minimax.io/docs/guides/pricing-paygo", note: "按 USD/CNY 6.8562 换算" },
  "MiniMax-M2.5-highspeed": { input: "¥4.11", output: "¥16.45", unit: "M tokens", source: "MiniMax Pay as You Go", url: "https://platform.minimax.io/docs/guides/pricing-paygo", note: "按 USD/CNY 6.8562 换算" }
};

export function priceLabel(model: string): string {
  const price = modelPricing[model];
  if (!price) return "价格：官网未列出输入/输出单价";
  const usage = price.output ? `输入 ${price.input} · 输出 ${price.output} / ${price.unit}` : `输入 ${price.input} / ${price.unit}`;
  return `价格：${usage}${price.note ? ` · ${price.note}` : ""}`;
}
