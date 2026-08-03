import type { FastifyReply, FastifyRequest } from "fastify";
import { checkProviderAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatMiniMaxChatCompletion, formatMiniMaxError } from "./adapter.js";
import { sendMiniMaxStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { checkModelDisabled, isArray, isString, requireFields } from "../validation.js";
import { withEstimatedUsage } from "../usage.js";
import { streamResponseBody } from "../stream-summary.js";
import { latencyForRequest } from "../latency.js";

type MiniMaxBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
  tools?: unknown[];
};

export async function handleMiniMaxChat(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  if (!checkProviderAuth(context.config, request, reply, provider, formatMiniMaxError("1001", "Invalid API key"))) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatMiniMaxError(validationError.code, validationError.message));
  const started = Date.now();
  const body = request.body as MiniMaxBody;
  if (!checkModelDisabled(context, body.model, reply, (status, code, message) => formatMiniMaxError(code, message))) return;
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
  const result = withEstimatedUsage(renderResult(found.result ?? { type: "text", content: "你好，我是模拟的 MiniMax 响应。" }, mockRequest), body.messages);
  const latencyMs = latencyForRequest(context, mockRequest);
  if (latencyMs > 0) await delay(latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatMiniMaxError(result.error.code, result.error.message);
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  if (body.stream) {
    if (body.model && context.systemSettings.modelStreamErrors[body.model]) {
      result.streamError = context.systemSettings.modelStreamErrors[body.model];
    }
    const responseBody = streamResponseBody(result, body.model ?? "MiniMax-M2.7");
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: true, request: mockRequest, responseBody });
    return sendMiniMaxStream(reply, body.model ?? "MiniMax-M2.7", result, context.config.defaults.streamChunkDelayMs);
  }
  const responseBody = formatMiniMaxChatCompletion(body.model ?? "MiniMax-M2.7", result);
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}
