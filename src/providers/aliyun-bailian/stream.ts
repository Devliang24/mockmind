import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";

export async function sendDashScopeStream(reply: FastifyReply, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const content of chunks) {
    reply.raw.write(`data: ${JSON.stringify({
      output: {
        choices: [{ finish_reason: null, message: { role: "assistant", content } }]
      }
    })}\n\n`);
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  reply.raw.write(`data: ${JSON.stringify({
    output: { choices: [{ finish_reason: "stop", message: { role: "assistant", content: "" } }] },
    usage: {
      input_tokens: result.usage?.promptTokens ?? 0,
      output_tokens: result.usage?.completionTokens ?? 0,
      total_tokens: result.usage?.totalTokens ?? 0
    }
  })}\n\n`);
  reply.raw.end();
}
