import { describe, expect, it } from "vitest";
import { resolveOpenAICompatibleProvider } from "../../src/protocols/openai-compatible/resolver.js";
import { providerRouteSummaries, providerRegistry } from "../../src/providers/registry.js";

describe("OpenAI-compatible resolver", () => {
  it("resolves providers from registry model patterns", () => {
    expect(resolveOpenAICompatibleProvider("deepseek-v4-pro")).toBe("deepseek");
    expect(resolveOpenAICompatibleProvider("kimi-k2.6")).toBe("moonshot");
    expect(resolveOpenAICompatibleProvider("glm-5.1")).toBe("zhipu");
    expect(resolveOpenAICompatibleProvider("qwen3.6-plus")).toBe("aliyun-bailian");
  });

  it("falls back to openai", () => {
    expect(resolveOpenAICompatibleProvider("unknown-model")).toBe("openai");
  });

  it("summarizes structured provider routes", () => {
    const deepseek = providerRegistry.find((provider) => provider.provider === "deepseek");
    expect(deepseek).toBeDefined();
    expect(providerRouteSummaries(deepseek!).join("\n")).toContain("/deepseek/v1/chat/completions");
  });
});
