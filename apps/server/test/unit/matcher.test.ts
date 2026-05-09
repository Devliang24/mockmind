import { describe, expect, it } from "vitest";
import { scenarioMatches } from "../../src/core/scenario/matcher.js";
import type { MockRequest, Scenario } from "../../src/core/scenario/types.js";

const request: MockRequest = {
  provider: "openai",
  endpoint: "/v1/chat/completions",
  method: "POST",
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are helpful." },
    { role: "user", content: "hello" }
  ],
  stream: false,
  rawBody: { model: "gpt-4o-mini", parameters: { result_format: "message" } },
  headers: { "x-mock": "yes" },
  query: { debug: "true" }
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

  it("matches the last user message", () => {
    const scenario: Scenario = {
      id: "last-user",
      priority: 0,
      match: { lastUserMessageContains: "hello" },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(true);
  });

  it("matches message role", () => {
    const scenario: Scenario = {
      id: "role",
      priority: 0,
      match: { messageRole: "system" },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(true);
  });

  it("matches nested body path", () => {
    const scenario: Scenario = {
      id: "body-path",
      priority: 0,
      match: { bodyPath: { "parameters.result_format": "message" } },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(true);
  });

  it("matches query params", () => {
    const scenario: Scenario = {
      id: "query",
      priority: 0,
      match: { query: { debug: "true" } },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(true);
  });

  it("rejects mismatched query params", () => {
    const scenario: Scenario = {
      id: "query-miss",
      priority: 0,
      match: { query: { debug: "false" } },
      response: { type: "text", content: "ok" }
    };

    expect(scenarioMatches(scenario, request)).toBe(false);
  });
});
