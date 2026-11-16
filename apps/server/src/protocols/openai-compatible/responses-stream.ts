import type { FastifyReply } from "fastify";
import type { MockResult } from "../../core/scenario/types.js";
import { delay, unixSeconds } from "../../shared/time.js";
import { formatResponsesUsage } from "./adapter.js";
import { buildOutput, messageItem } from "./responses-handler.js";

function event(type: string, sequenceNumber: number, data: Record<string, unknown>): string {
  return `event: ${type}\ndata: ${JSON.stringify({ type, sequence_number: sequenceNumber, ...data })}\n\n`;
}

function makeResponse(model: string, status: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: "resp_mock_0001", object: "response", created_at: unixSeconds(), status, model, ...extra };
}

export async function sendOpenAIResponsesStream(reply: FastifyReply, model: string, result: MockResult, chunkDelayMs: number): Promise<void> {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });

  let sequenceNumber = 0;
  const send = (type: string, data: Record<string, unknown>): void => {
    reply.raw.write(event(type, sequenceNumber++, data));
  };

  send("response.created", { response: makeResponse(model, "in_progress") });
  send("response.in_progress", { response: makeResponse(model, "in_progress") });

  const [item] = buildOutput(result);
  const itemId = String(item.id);
  const outputIndex = 0;

  if (result.type === "tool_call") {
    const args = String(item.arguments ?? "{}");
    send("response.output_item.added", { output_index: outputIndex, item: { ...item, status: "in_progress", arguments: "" } });
    send("response.function_call_arguments.delta", { item_id: itemId, output_index: outputIndex, delta: args });
    send("response.function_call_arguments.done", { item_id: itemId, output_index: outputIndex, arguments: args });
  } else {
    send("response.output_item.added", { output_index: outputIndex, item: messageItem(itemId, "", "in_progress") });
    send("response.content_part.added", { item_id: itemId, output_index: outputIndex, content_index: 0, part: { type: "output_text", text: "" } });

    const chunks = result.chunks?.length ? result.chunks : [result.content ?? ""];
    for (const text of chunks) {
      send("response.output_text.delta", { item_id: itemId, output_index: outputIndex, content_index: 0, delta: text });
      if (chunkDelayMs > 0) await delay(chunkDelayMs);
    }

    const fullText = chunks.join("");
    send("response.output_text.done", { item_id: itemId, output_index: outputIndex, content_index: 0, text: fullText });
    send("response.content_part.done", { item_id: itemId, output_index: outputIndex, content_index: 0, part: { type: "output_text", text: fullText } });
  }

  if (result.streamError) {
    reply.raw.write(event("error", sequenceNumber++, { error: { type: "server_error", code: result.streamError.code ?? "stream_error", message: result.streamError.message, param: null } }));
    reply.raw.write(event("response.failed", sequenceNumber++, { response: makeResponse(model, "failed", { error: { code: result.streamError.code ?? "stream_error", message: result.streamError.message } }) }));
  } else {
    send("response.output_item.done", { output_index: outputIndex, item });
    send("response.completed", {
      response: makeResponse(model, "completed", {
        output: buildOutput(result),
        output_text: result.type === "tool_call" ? "" : result.content ?? "",
        usage: formatResponsesUsage(result)
      })
    });
  }
  reply.raw.write("data: [DONE]\n\n");
  reply.raw.end();
}
