import type { Provider } from "../../core/scenario/types.js";

const prefixRules: Array<[RegExp, Provider]> = [
  [/^deepseek-/, "deepseek"],
  [/^(moonshot-|kimi-)/, "moonshot"],
  [/^qwen-/, "aliyun-bailian"],
  [/^glm-/, "zhipu"],
  [/^doubao-/, "volcengine-ark"]
];

export function resolveOpenAICompatibleProvider(model: string | undefined): Provider {
  if (!model) return "openai";
  for (const [pattern, provider] of prefixRules) {
    if (pattern.test(model)) return provider;
  }
  return "openai";
}
