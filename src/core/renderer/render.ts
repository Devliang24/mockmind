import type { MockRequest, MockResult } from "../scenario/types.js";

export function renderResult(result: MockResult, request: MockRequest): MockResult {
  if (result.type !== "text" || result.content) return result;
  const lastMessage = request.messages?.at(-1);
  return {
    ...result,
    content: lastMessage ? JSON.stringify(lastMessage) : ""
  };
}
