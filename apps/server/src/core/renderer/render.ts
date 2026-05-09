import type { MockRequest, MockResult } from "../scenario/types.js";

export function renderResult(result: MockResult, request: MockRequest): MockResult {
  if (result.type !== "text" && result.type !== "stream") return result;

  const rendered = result.type === "text" && !result.content ? renderDefaultTextContent(result, request) : result;
  if (!shouldIncludeModelInContent(request)) return rendered;

  return appendModelToContent(rendered, request.model);
}

function renderDefaultTextContent(result: MockResult, request: MockRequest): MockResult {
  const lastMessage = request.messages?.at(-1);
  return {
    ...result,
    content: lastMessage ? JSON.stringify(lastMessage) : ""
  };
}

function shouldIncludeModelInContent(request: MockRequest): request is MockRequest & { model: string } {
  if (!request.model) return false;
  return [
    "/images/",
    "/audio/",
    "/moderations",
    "/embeddings",
    "/rerank",
    "/reranks"
  ].every((part) => !request.endpoint.includes(part));
}

function appendModelToContent(result: MockResult, model: string): MockResult {
  const label = `model: ${model}`;
  if (result.chunks?.length) {
    return {
      ...result,
      chunks: result.chunks.map((chunk, index) => index === 0 ? appendModel(chunk, label) : chunk)
    };
  }
  return {
    ...result,
    content: appendModel(result.content ?? "", label)
  };
}

function appendModel(content: string, label: string): string {
  if (!content) return label;
  if (content.includes(label)) return content;
  return `${content} (${label})`;
}
