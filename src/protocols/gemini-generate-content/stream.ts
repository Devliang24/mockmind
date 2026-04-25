import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";
import { formatGeminiParts } from "./adapter.js";

export async function sendGeminiStream(reply: FastifyReply, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  reply.raw.write("[");

  if (result.type === "tool_call") {
    reply.raw.write(JSON.stringify({
      candidates: [{ content: { role: "model", parts: formatGeminiParts(result) }, finishReason: "STOP", index: 0, safetyRatings: [] }]
    }));
    reply.raw.write("]");
    reply.raw.end();
    return;
  }

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];

  for (let index = 0; index < chunks.length; index += 1) {
    if (index > 0) reply.raw.write(",");
    reply.raw.write(JSON.stringify({
      candidates: [{
        content: { role: "model", parts: [{ text: chunks[index] }] },
        finishReason: index === chunks.length - 1 ? "STOP" : undefined,
        index: 0,
        safetyRatings: []
      }]
    }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  reply.raw.write("]");
  reply.raw.end();
}
