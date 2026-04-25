import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay, unixSeconds } from "../../shared/time.js";

function event(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function sendMiniMaxStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const content of chunks) {
    reply.raw.write(event({
      id: "minimax-mock-0001",
      created: unixSeconds(),
      model,
      choices: [{ index: 0, delta: { content }, finish_reason: null }]
    }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  if (result.streamError) {
    reply.raw.write(event({ base_resp: { status_code: Number(result.streamError.code) || 1001, status_msg: result.streamError.message } }));
    reply.raw.end();
    return;
  }

  reply.raw.write(event({
    id: "minimax-mock-0001",
    created: unixSeconds(),
    model,
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
    usage: { total_tokens: result.usage?.totalTokens ?? 0 },
    base_resp: { status_code: 0, status_msg: "success" }
  }));
  reply.raw.write("data: [DONE]\n\n");
  reply.raw.end();
}
