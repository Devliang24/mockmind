import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay, unixSeconds } from "../../shared/time.js";

function chunk(model: string, delta: Record<string, unknown>, finishReason: string | null = null): string {
  return `data: ${JSON.stringify({
    id: "chatcmpl_mock_0001",
    object: "chat.completion.chunk",
    created: unixSeconds(),
    model,
    choices: [{ index: 0, delta, finish_reason: finishReason }]
  })}\n\n`;
}

export async function sendOpenAIStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  reply.raw.write(chunk(model, { role: "assistant" }));

  if (result.reasoningContent) {
    reply.raw.write(chunk(model, { reasoning_content: result.reasoningContent }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const content of chunks) {
    reply.raw.write(chunk(model, { content }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  reply.raw.write(chunk(model, {}, "stop"));
  reply.raw.write("data: [DONE]\n\n");
  reply.raw.end();
}
