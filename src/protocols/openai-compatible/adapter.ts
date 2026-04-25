import type { MockResult } from "../../core/scenario/types.js";
import { unixSeconds } from "../../shared/time.js";

export function formatChatCompletion(model: string, result: MockResult): unknown {
  if (result.type === "tool_call") {
    return {
      id: "chatcmpl_mock_tool_0001",
      object: "chat.completion",
      created: unixSeconds(),
      model,
      choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: normalizeOpenAIToolCalls(result) }, finish_reason: "tool_calls" }],
      usage: formatUsage(result)
    };
  }

  return {
    id: "chatcmpl_mock_0001",
    object: "chat.completion",
    created: unixSeconds(),
    model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        ...(result.reasoningContent ? { reasoning_content: result.reasoningContent } : {}),
        content: result.content ?? ""
      },
      finish_reason: "stop"
    }],
    usage: formatUsage(result)
  };
}

export function formatEmbedding(model: string, embedding: number[]): unknown {
  return {
    object: "list",
    data: [{ object: "embedding", index: 0, embedding }],
    model,
    usage: { prompt_tokens: 1, total_tokens: 1 }
  };
}

export function formatOpenAIError(status: number, code: string | undefined, message: string, type?: string): unknown {
  return {
    error: {
      message,
      type: type ?? inferOpenAIErrorType(status, code),
      param: null,
      code: code ?? "mock_error"
    }
  };
}

export function normalizeOpenAIToolCalls(result: MockResult): unknown[] {
  if (result.toolCalls?.length) return result.toolCalls;
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

export function formatUsage(result: MockResult): unknown {
  return {
    prompt_tokens: result.usage?.promptTokens ?? 0,
    completion_tokens: result.usage?.completionTokens ?? 0,
    total_tokens: result.usage?.totalTokens ?? 0
  };
}

function inferOpenAIErrorType(status: number, code: string | undefined): string {
  if (status === 401) return "authentication_error";
  if (status === 404 || code === "model_not_found") return "invalid_request_error";
  if (status === 429) return "rate_limit_error";
  if (status >= 500) return "server_error";
  return "invalid_request_error";
}
