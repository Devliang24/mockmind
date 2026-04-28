import type { MockResult } from "../../core/scenario/types.js";
import { unixSeconds } from "../../shared/time.js";

export function formatMiniMaxChatCompletion(model: string, result: MockResult): unknown {
  if (result.type === "tool_call") {
    return {
      id: "minimax-mock-tool-0001",
      choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: result.toolCalls ?? defaultToolCalls(result) }, finish_reason: "tool_calls" }],
      created: unixSeconds(),
      model,
      object: "chat.completion",
      usage: formatMiniMaxUsage(result),
      input_sensitive: false,
      output_sensitive: false,
      input_sensitive_type: 0,
      output_sensitive_type: 0,
      output_sensitive_int: 0,
      base_resp: { status_code: 0, status_msg: "" }
    };
  }

  return {
    id: "minimax-mock-0001",
    choices: [{ index: 0, message: { role: "assistant", name: "MiniMax AI", audio_content: "", reasoning_content: result.reasoningContent ?? "", content: result.content ?? "" }, finish_reason: "stop" }],
    created: unixSeconds(),
    model,
    object: "chat.completion",
    usage: formatMiniMaxUsage(result),
    input_sensitive: false,
    output_sensitive: false,
    input_sensitive_type: 0,
    output_sensitive_type: 0,
    output_sensitive_int: 0,
    base_resp: { status_code: 0, status_msg: "" }
  };
}

export function formatMiniMaxError(code: string | undefined, message: string): unknown {
  return {
    base_resp: {
      status_code: Number(code) || 1001,
      status_msg: message
    }
  };
}

export function formatMiniMaxUsage(result: MockResult): unknown {
  return {
    prompt_tokens: result.usage?.promptTokens ?? 0,
    completion_tokens: result.usage?.completionTokens ?? 0,
    total_characters: 0,
    completion_tokens_details: {
      reasoning_tokens: result.reasoningContent || result.reasoningChunks?.length ? result.usage?.completionTokens ?? 0 : 0
    },
    total_tokens: result.usage?.totalTokens ?? 0
  };
}

function defaultToolCalls(result: MockResult): unknown[] {
  if (!result.toolName) return [];
  return [{
    id: "call_mock_0001",
    type: "function",
    function: {
      name: result.toolName,
      arguments: JSON.stringify(result.toolArguments ?? {})
    }
  }];
}
