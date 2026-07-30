import { describe, expect, it } from "vitest";
import { latencyForRequest } from "../../src/protocols/latency.js";
import type { MockRequest } from "../../src/core/scenario/types.js";
import type { ServerContext } from "../../src/server/context.js";

const context = {
  systemSettings: {
    modelLatencyMs: { "claude-sonnet-4-6": 30 },
    disabledModelStatusCode: 403
  }
} as ServerContext;

function request(provider: MockRequest["provider"], model?: string): MockRequest {
  return { provider, endpoint: "/test", method: "POST", model, rawBody: {}, headers: {}, query: {} };
}

describe("latencyForRequest", () => {
  it("uses only single-model latency rules", () => {
    expect(latencyForRequest(context, request("anthropic", "claude-sonnet-4-6"))).toBe(30);
    expect(latencyForRequest(context, request("anthropic", "claude-other"))).toBe(0);
    expect(latencyForRequest(context, request("openai", "gpt-4o-mini"))).toBe(0);
  });
});
