import type { MockResult } from "../../core/scenario/types.js";

export function formatGeminiContent(result: MockResult): unknown {
  return {
    candidates: [{
      content: {
        role: "model",
        parts: formatGeminiParts(result)
      },
      finishReason: result.type === "tool_call" ? "STOP" : "STOP",
      index: 0,
      safetyRatings: []
    }],
    usageMetadata: {
      promptTokenCount: result.usage?.promptTokens ?? 0,
      candidatesTokenCount: result.usage?.completionTokens ?? 0,
      totalTokenCount: result.usage?.totalTokens ?? 0
    }
  };
}

export function formatGeminiError(status: number, message: string, code?: string): unknown {
  return {
    error: {
      code: status,
      message,
      status: code ?? inferGeminiStatus(status)
    }
  };
}

export function formatGeminiParts(result: MockResult): unknown[] {
  if (result.type !== "tool_call") return [{ text: result.content ?? "" }];
  if (result.toolCalls?.length) return result.toolCalls;
  return [{
    functionCall: {
      name: result.toolName ?? "mock_tool",
      args: result.toolArguments ?? {}
    }
  }];
}

function inferGeminiStatus(status: number): string {
  if (status === 400) return "INVALID_ARGUMENT";
  if (status === 401) return "UNAUTHENTICATED";
  if (status === 403) return "PERMISSION_DENIED";
  if (status === 429) return "RESOURCE_EXHAUSTED";
  if (status >= 500) return "INTERNAL";
  return "UNKNOWN";
}
