import { describe, expect, it } from "vitest";
import { latencyForRequest } from "../../src/protocols/latency.js";
import type { MockRequest } from "../../src/core/scenario/types.js";
import type { ServerContext } from "../../src/server/context.js";

const context = {
  systemSettings: {
    latencyMs: 10,
    providerLatencyMs: { anthropic: 20 },
    modelLatencyMs: { "claude-sonnet-4-6": 30 },
    disabledModelStatusCode: 403
  }
} as ServerContext;

function request(provider: MockRequest["provider"], model?: string): MockRequest {
  return { provider, endpoint: "/test", method: "POST", model, rawBody: {}, headers: {}, query: {} };
}

describe("latencyForRequest", () => {
  it("uses model, provider, then global latency", () => {
    expect(latencyForRequest(context, request("anthropic", "claude-sonnet-4-6"))).toBe(30);
    expect(latencyForRequest(context, request("anthropic", "claude-other"))).toBe(20);
    expect(latencyForRequest(context, request("openai", "gpt-4o-mini"))).toBe(10);
  });
});
