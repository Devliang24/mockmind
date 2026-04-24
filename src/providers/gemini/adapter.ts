import type { MockResult } from "../../core/scenario/types.js";

export function formatGeminiContent(result: MockResult): unknown {
  return {
    candidates: [{
      content: {
        role: "model",
        parts: [{ text: result.content ?? "" }]
      },
      finishReason: "STOP",
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

export function formatGeminiError(status: number, message: string): unknown {
  return {
    error: {
      code: status,
      message,
      status: status === 429 ? "RESOURCE_EXHAUSTED" : "UNKNOWN"
    }
  };
}
