import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatMiniMaxChatCompletion, formatMiniMaxError } from "./adapter.js";
import { sendMiniMaxStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isString, requireFields } from "../validation.js";

type MiniMaxBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
  tools?: unknown[];
};

export async function handleMiniMaxChat(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatMiniMaxError(validationError.code, validationError.message));
  const started = Date.now();
  const body = request.body as MiniMaxBody;
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: body.model,
    messages: body.messages,
    stream: Boolean(body.stream),
    tools: body.tools,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "text", content: "你好，我是模拟的 MiniMax 响应。" }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatMiniMaxError(result.error.code, result.error.message));
  if (body.stream) return sendMiniMaxStream(reply, body.model ?? "abab6.5s-chat", result, context.config.defaults.streamChunkDelayMs);
  return reply.send(formatMiniMaxChatCompletion(body.model ?? "abab6.5s-chat", result));
}
