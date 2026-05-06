import type { MockResult } from "../core/scenario/types.js";

export function streamResponseBody(result: MockResult, model: string): { stream: true; format: "text/event-stream"; content: string | string[] } {
  return {
    stream: true,
    format: "text/event-stream",
    content: streamContentWithModel(result, model)
  };
}

function streamContentWithModel(result: MockResult, model: string): string | string[] {
  const label = `model: ${model}`;
  if (result.chunks?.length) return result.chunks.map((chunk, index) => index === 0 ? appendModel(chunk, label) : chunk);
  return appendModel(result.content ?? "", label);
}

function appendModel(content: string, label: string): string {
  if (!content) return label;
  if (content.includes(label)) return content;
  return `${content} (${label})`;
}
