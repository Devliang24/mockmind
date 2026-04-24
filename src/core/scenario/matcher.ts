import type { MockRequest, Scenario } from "./types.js";

function messageText(messages: unknown[] | undefined): string {
  if (!messages) return "";
  return messages.map((message) => JSON.stringify(message)).join("\n");
}

function matchesRecord(expected: Record<string, unknown> | undefined, actual: unknown): boolean {
  if (!expected) return true;
  if (!actual || typeof actual !== "object") return false;
  const actualRecord = actual as Record<string, unknown>;
  return Object.entries(expected).every(([key, value]) => actualRecord[key] === value);
}

export function scenarioMatches(scenario: Scenario, request: MockRequest): boolean {
  if (scenario.provider && scenario.provider !== request.provider) return false;
  if (scenario.endpoint && scenario.endpoint !== request.endpoint) return false;

  const match = scenario.match;
  if (!match) return true;
  if (match.model && match.model !== request.model) return false;
  if (match.stream !== undefined && match.stream !== Boolean(request.stream)) return false;
  if (match.hasTools !== undefined && match.hasTools !== Boolean(request.tools?.length)) return false;
  if (match.messagesContain && !messageText(request.messages).includes(match.messagesContain)) return false;
  if (!matchesRecord(match.body, request.rawBody)) return false;

  if (match.headers) {
    for (const [key, value] of Object.entries(match.headers)) {
      if (request.headers[key.toLowerCase()] !== value) return false;
    }
  }

  return true;
}
