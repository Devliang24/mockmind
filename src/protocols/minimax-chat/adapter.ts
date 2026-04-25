import type { MockResult } from "../../core/scenario/types.js";
import { unixSeconds } from "../../shared/time.js";

export function formatMiniMaxChatCompletion(model: string, result: MockResult): unknown {
  if (result.type === "tool_call") {
    return {
      id: "minimax-mock-tool-0001",
      choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: result.toolCalls ?? defaultToolCalls(result) }, finish_reason: "tool_calls" }],
      created: unixSeconds(),
      model,
      usage: formatMiniMaxUsage(result),
      base_resp: { status_code: 0, status_msg: "success" }
    };
  }

  return {
    id: "minimax-mock-0001",
    choices: [{ index: 0, message: { role: "assistant", content: result.content ?? "" }, finish_reason: "stop" }],
    created: unixSeconds(),
    model,
    usage: formatMiniMaxUsage(result),
    base_resp: { status_code: 0, status_msg: "success" }
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
