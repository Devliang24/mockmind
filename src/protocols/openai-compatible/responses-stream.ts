import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";
import { formatResponsesUsage } from "./adapter.js";

function event(type: string, data: Record<string, unknown>): string {
  return `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
}

export async function sendOpenAIResponsesStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  reply.raw.write(event("response.created", { response: { id: "resp_mock_0001", object: "response", status: "in_progress", model } }));

  if (result.type === "tool_call") {
    reply.raw.write(event("response.output_item.added", { output_index: 0, item: { id: "fc_mock_0001", type: "function_call", name: result.toolName ?? "mock_tool", arguments: JSON.stringify(result.toolArguments ?? {}) } }));
    reply.raw.write(event("response.completed", { response: { id: "resp_mock_0001", object: "response", status: "completed", model, usage: formatResponsesUsage(result) } }));
    reply.raw.write("data: [DONE]\n\n");
    reply.raw.end();
    return;
  }

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const text of chunks) {
    reply.raw.write(event("response.output_text.delta", { delta: text }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  if (result.streamError) {
    reply.raw.write(event("error", { error: { code: result.streamError.code ?? "stream_error", message: result.streamError.message } }));
    reply.raw.end();
    return;
  }

  reply.raw.write(event("response.output_text.done", { text: chunks.join("") }));
  reply.raw.write(event("response.completed", { response: { id: "resp_mock_0001", object: "response", status: "completed", model, usage: formatResponsesUsage(result) } }));
  reply.raw.write("data: [DONE]\n\n");
  reply.raw.end();
}
