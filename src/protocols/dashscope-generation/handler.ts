import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatDashScopeError, formatDashScopeGeneration } from "./adapter.js";
import { sendDashScopeStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isString, requireFields } from "../validation.js";

type DashScopeBody = {
  model?: string;
  input?: {
    messages?: unknown[];
  };
  parameters?: {
    incremental_output?: boolean;
    result_format?: string;
  };
  stream?: boolean;
};

export async function handleDashScopeGeneration(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "input.messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatDashScopeError(validationError.code, validationError.message));
  const started = Date.now();
  const body = request.body as DashScopeBody;
  const stream = Boolean(body.stream ?? body.parameters?.incremental_output);
  const mockRequest: MockRequest = {
    provider: "aliyun-bailian",
    endpoint,
    method: request.method,
    model: body.model,
    messages: body.input?.messages,
    stream,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "text", content: "你好，我是模拟的 DashScope 原生响应。" }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatDashScopeError(result.error.code, result.error.message);
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  if (stream) {
    const responseBody = { stream: true, format: "text/event-stream", content: result.chunks ?? result.content ?? "" };
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
    return sendDashScopeStream(reply, result, context.config.defaults.streamChunkDelayMs);
  }
  const responseBody = formatDashScopeGeneration(result);
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
  return reply.send(responseBody);
}
