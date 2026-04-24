import type { MockResult } from "../../core/scenario/types.js";

export function formatAnthropicMessage(model: string, result: MockResult): unknown {
  return {
    id: "msg_mock_0001",
    type: "message",
    role: "assistant",
    model,
    content: formatAnthropicContent(result),
    stop_reason: result.type === "tool_call" ? "tool_use" : "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: result.usage?.promptTokens ?? 0,
      output_tokens: result.usage?.completionTokens ?? 0
    }
  };
}

export function formatAnthropicError(type: string | undefined, message: string): unknown {
  return {
    type: "error",
    error: {
      type: type ?? "api_error",
      message
    }
  };
}

export function formatAnthropicContent(result: MockResult): unknown[] {
  if (result.type !== "tool_call") return [{ type: "text", text: result.content ?? "" }];
  if (result.toolCalls?.length) return result.toolCalls;
  return [{
    type: "tool_use",
    id: "toolu_mock_0001",
    name: result.toolName ?? "mock_tool",
    input: result.toolArguments ?? {}
  }];
}
