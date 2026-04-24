import type { MockResult } from "../../core/scenario/types.js";

export function formatAnthropicMessage(model: string, result: MockResult): unknown {
  return {
    id: "msg_mock_0001",
    type: "message",
    role: "assistant",
    model,
    content: [{ type: "text", text: result.content ?? "" }],
    stop_reason: "end_turn",
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
      type: type ?? "mock_error",
      message
    }
  };
}
