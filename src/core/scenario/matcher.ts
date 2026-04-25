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

function getPathValue(source: unknown, path: string): unknown {
  if (!source || typeof source !== "object") return undefined;
  const parts = path.replaceAll(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let current: unknown = source;
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function matchesPathRecord(expected: Record<string, unknown> | undefined, actual: unknown): boolean {
  if (!expected) return true;
  return Object.entries(expected).every(([path, value]) => getPathValue(actual, path) === value);
}

function getMessageRole(message: unknown): string | undefined {
  if (!message || typeof message !== "object") return undefined;
  const role = (message as Record<string, unknown>).role ?? (message as Record<string, unknown>).Role;
  return typeof role === "string" ? role : undefined;
}

function getMessageContent(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const record = message as Record<string, unknown>;
  const content = record.content ?? record.Content;
  if (typeof content === "string") return content;
  return JSON.stringify(content ?? "");
}

function lastUserMessageText(messages: unknown[] | undefined): string {
  if (!messages) return "";
  const lastUser = [...messages].reverse().find((message) => getMessageRole(message) === "user");
  return getMessageContent(lastUser);
}

function hasRole(messages: unknown[] | undefined, role: string): boolean {
  return Boolean(messages?.some((message) => getMessageRole(message) === role));
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
  if (match.lastUserMessageContains && !lastUserMessageText(request.messages).includes(match.lastUserMessageContains)) return false;
  if (match.messageRole && !hasRole(request.messages, match.messageRole)) return false;
  if (!matchesRecord(match.body, request.rawBody)) return false;
  if (!matchesPathRecord(match.bodyPath, request.rawBody)) return false;

  if (match.headers) {
    for (const [key, value] of Object.entries(match.headers)) {
      if (request.headers[key.toLowerCase()] !== value) return false;
    }
  }

  if (match.query) {
    for (const [key, value] of Object.entries(match.query)) {
      if (request.query[key] !== value) return false;
    }
  }

  return true;
}
