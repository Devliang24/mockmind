import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay, unixSeconds } from "../../shared/time.js";
import { formatUsage, normalizeOpenAIToolCalls } from "./adapter.js";

function chunk(model: string, delta: Record<string, unknown>, finishReason: string | null = null, extra: Record<string, unknown> = {}): string {
  return `data: ${JSON.stringify({
    id: "chatcmpl_mock_0001",
    object: "chat.completion.chunk",
    created: unixSeconds(),
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
    ...extra
  })}\n\n`;
}

export async function sendOpenAIStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number, includeUsage = false): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  reply.raw.write(chunk(model, { role: "assistant" }));

  for (const reasoningContent of result.reasoningChunks ?? (result.reasoningContent ? [result.reasoningContent] : [])) {
    reply.raw.write(chunk(model, { reasoning_content: reasoningContent }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  if (result.type === "tool_call") {
    const toolCalls = normalizeOpenAIToolCalls(result);
    for (const toolCall of toolCalls) {
      reply.raw.write(chunk(model, { tool_calls: [toolCall] }));
      if (chunkDelayMs > 0) await delay(chunkDelayMs);
    }
    reply.raw.write(chunk(model, {}, "tool_calls"));
    if (includeUsage) reply.raw.write(usageChunk(model, result));
    reply.raw.write("data: [DONE]\n\n");
    reply.raw.end();
    return;
  }

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const content of chunks) {
    reply.raw.write(chunk(model, { content }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  if (result.streamError) {
    reply.raw.write(`data: ${JSON.stringify({ error: { message: result.streamError.message, code: result.streamError.code ?? "stream_error" } })}\n\n`);
    reply.raw.end();
    return;
  }

  reply.raw.write(chunk(model, {}, "stop"));
  if (includeUsage) reply.raw.write(usageChunk(model, result));
  reply.raw.write("data: [DONE]\n\n");
  reply.raw.end();
}

function usageChunk(model: string, result: MockResult): string {
  return `data: ${JSON.stringify({
    id: "chatcmpl_mock_0001",
    object: "chat.completion.chunk",
    created: unixSeconds(),
    model,
    choices: [],
    usage: formatUsage(result)
  })}\n\n`;
}
