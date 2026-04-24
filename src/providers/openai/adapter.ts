import type { MockResult } from "../../core/scenario/types.js";
import { unixSeconds } from "../../shared/time.js";

export function formatChatCompletion(model: string, result: MockResult): unknown {
  if (result.type === "tool_call") {
    return {
      id: "chatcmpl_mock_tool_0001",
      object: "chat.completion",
      created: unixSeconds(),
      model,
      choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: result.toolCalls ?? [] }, finish_reason: "tool_calls" }],
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

export function formatOpenAIError(status: number, code: string | undefined, message: string): unknown {
  return {
    error: {
      message,
      type: status === 429 ? "rate_limit_error" : "mock_error",
      param: null,
      code: code ?? "mock_error"
    }
  };
}

function formatUsage(result: MockResult): unknown {
  return {
    prompt_tokens: result.usage?.promptTokens ?? 0,
    completion_tokens: result.usage?.completionTokens ?? 0,
    total_tokens: result.usage?.totalTokens ?? 0
  };
}
