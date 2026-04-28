import type { MockResult } from "../core/scenario/types.js";

export type TokenUsage = NonNullable<MockResult["usage"]>;

export function withEstimatedUsage(result: MockResult, promptSource: unknown): MockResult {
  if (result.type === "error") return result;

  const promptTokens = result.usage?.promptTokens ?? estimateTokenCount(promptSource);
  const completionTokens = result.usage?.completionTokens ?? estimateCompletionTokens(result);
  const totalTokens = result.usage?.totalTokens ?? promptTokens + completionTokens;

  return {
    ...result,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens
    }
  };
}

export function estimateTokenCount(value: unknown): number {
  const text = normalizeText(value);
  if (!text) return 0;

  const cjkCharacters = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  const asciiText = text.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ");
  const asciiWords = asciiText.match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g)?.length ?? 0;

  return Math.max(1, Math.ceil(cjkCharacters + asciiWords * 0.75));
}

export function usageOrEstimate(result: MockResult, promptSource: unknown): TokenUsage {
  return withEstimatedUsage(result, promptSource).usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
}

function estimateCompletionTokens(result: MockResult): number {
  if (result.type === "embedding") return 0;
  if (result.type === "json") return estimateTokenCount(result.json);
  if (result.type === "tool_call") {
    return estimateTokenCount(result.toolCalls?.length ? result.toolCalls : {
      name: result.toolName,
      arguments: result.toolArguments
    });
  }
  return estimateTokenCount([
    result.reasoningChunks,
    result.reasoningContent,
    result.chunks,
    result.content
  ]);
}

function normalizeText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
