import { describe, expect, it } from "vitest";
import { providerGroups, providerRegistry } from "../../src/providers/registry.js";

describe("provider registry", () => {
  it("lists implemented protocol providers", () => {
    expect(providerRegistry.map((item) => item.provider)).toContain("openai");
    expect(providerRegistry.map((item) => item.provider)).toContain("anthropic");
    expect(providerRegistry.map((item) => item.provider)).toContain("gemini");
    expect(providerRegistry.map((item) => item.provider)).toContain("aliyun-bailian");
  });

  it("exposes provider groups for admin metadata", () => {
    expect(providerGroups().international).toContain("anthropic");
    expect(providerGroups().chinese).toContain("aliyun-bailian");
    expect(providerGroups().native).toContain("gemini");
  });
});
