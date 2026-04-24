import { describe, expect, it } from "vitest";
import { scenarioMatches } from "../../src/core/scenario/matcher.js";
import type { MockRequest, Scenario } from "../../src/core/scenario/types.js";

const request: MockRequest = {
  provider: "openai",
  endpoint: "/v1/chat/completions",
  method: "POST",
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hello" }],
  stream: false,
  rawBody: { model: "gpt-4o-mini" },
  headers: {},
  query: {}
};

describe("scenarioMatches", () => {
  it("matches provider, endpoint, model, and message content", () => {
    const scenario: Scenario = {
      id: "hello",
      provider: "openai",
      endpoint: "/v1/chat/completions",
      priority: 0,
      match: { model: "gpt-4o-mini", messagesContain: "hello" },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(true);
  });

  it("rejects mismatched model", () => {
    const scenario: Scenario = {
      id: "other",
      priority: 0,
      match: { model: "other-model" },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(false);
  });
});
