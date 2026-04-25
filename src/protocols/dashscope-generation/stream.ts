import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";
import { formatDashScopeUsage } from "./adapter.js";

function dashScopeEvent(data: unknown): string {
  return `event: result\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function sendDashScopeStream(reply: FastifyReply, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const content of chunks) {
    reply.raw.write(dashScopeEvent({
      request_id: "req_mock_dashscope_0001",
      output: {
        choices: [{ finish_reason: null, message: { role: "assistant", content } }]
      }
    }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  if (result.streamError) {
    reply.raw.write(`event: error\ndata: ${JSON.stringify({ request_id: "req_mock_dashscope_error_0001", code: result.streamError.code ?? "ServiceUnavailable", message: result.streamError.message })}\n\n`);
    reply.raw.end();
    return;
  }

  reply.raw.write(dashScopeEvent({
    request_id: "req_mock_dashscope_0001",
    output: { choices: [{ finish_reason: "stop", message: { role: "assistant", content: "" } }] },
    usage: formatDashScopeUsage(result)
  }));
  reply.raw.end();
}
