import { describe, expect, it } from "vitest";
import { resolveOpenAICompatibleProvider } from "../../src/protocols/openai-compatible/resolver.js";
import { providerRouteSummaries, providerRegistry } from "../../src/providers/registry.js";

describe("OpenAI-compatible resolver", () => {
  it("resolves providers from registry model patterns", () => {
    expect(resolveOpenAICompatibleProvider("deepseek-chat")).toBe("deepseek");
    expect(resolveOpenAICompatibleProvider("moonshot-v1-8k")).toBe("moonshot");
    expect(resolveOpenAICompatibleProvider("glm-4")).toBe("zhipu");
    expect(resolveOpenAICompatibleProvider("qwen-plus")).toBe("aliyun-bailian");
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
