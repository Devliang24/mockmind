import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";
import { formatGeminiParts } from "./adapter.js";

export async function sendGeminiStream(reply: FastifyReply, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  if (result.type === "tool_call") {
    reply.raw.write(event({
      candidates: [{ content: { role: "model", parts: formatGeminiParts(result) }, finishReason: "STOP", index: 0, safetyRatings: [] }],
      usageMetadata: {
        promptTokenCount: result.usage?.promptTokens ?? 0,
        candidatesTokenCount: result.usage?.completionTokens ?? 0,
        totalTokenCount: result.usage?.totalTokens ?? 0
      }
    }));
    reply.raw.end();
    return;
  }

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];

  for (let index = 0; index < chunks.length; index += 1) {
    reply.raw.write(event({
      candidates: [{
        content: { role: "model", parts: [{ text: chunks[index] }] },
        finishReason: index === chunks.length - 1 ? "STOP" : undefined,
        index: 0,
        safetyRatings: []
      }],
      ...(index === chunks.length - 1 ? {
        usageMetadata: {
          promptTokenCount: result.usage?.promptTokens ?? 0,
          candidatesTokenCount: result.usage?.completionTokens ?? 0,
          totalTokenCount: result.usage?.totalTokens ?? 0
        }
      } : {})
    }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  reply.raw.end();
}

function event(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
