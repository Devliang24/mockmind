import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay } from "../../shared/time.js";
import { formatAnthropicContent } from "./adapter.js";

function event(name: string, data: unknown): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function sendAnthropicStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  reply.raw.write(event("message_start", {
    type: "message_start",
    message: { id: "msg_mock_0001", type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: result.usage?.promptTokens ?? 0, output_tokens: 0 } }
  }));

  if (result.type === "tool_call") {
    const [toolUse] = formatAnthropicContent(result) as Array<Record<string, unknown>>;
    reply.raw.write(event("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "tool_use", id: toolUse.id, name: toolUse.name, input: {} } }));
    reply.raw.write(event("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: JSON.stringify(toolUse.input ?? {}) } }));
    reply.raw.write(event("content_block_stop", { type: "content_block_stop", index: 0 }));
    reply.raw.write(event("message_delta", { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: result.usage?.completionTokens ?? 0 } }));
    reply.raw.write(event("message_stop", { type: "message_stop" }));
    reply.raw.end();
    return;
  }

  reply.raw.write(event("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }));

  const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
  for (const text of chunks) {
    reply.raw.write(event("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } }));
    if (chunkDelayMs > 0) await delay(chunkDelayMs);
  }

  reply.raw.write(event("content_block_stop", { type: "content_block_stop", index: 0 }));
  reply.raw.write(event("message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: result.usage?.completionTokens ?? 0 } }));
  reply.raw.write(event("message_stop", { type: "message_stop" }));
  reply.raw.end();
}
