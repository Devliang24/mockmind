import type { FastifyReply, FastifyRequest } from "fastify";
import { checkProviderAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatDashScopeError, formatDashScopeGeneration } from "./adapter.js";
import { sendDashScopeStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { checkModelDisabled, isArray, isString, requireFields } from "../validation.js";
import { withEstimatedUsage } from "../usage.js";
import { streamResponseBody } from "../stream-summary.js";
import { latencyForRequest } from "../latency.js";

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
  if (!checkProviderAuth(context.config, request, reply, "aliyun-bailian", formatDashScopeError("InvalidApiKey", "Invalid API key"))) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "input.messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatDashScopeError(validationError.code, validationError.message));
  const started = Date.now();
  const body = request.body as DashScopeBody;
  if (!checkModelDisabled(context, body.model, reply, (status, code, message) => formatDashScopeError(code, message))) return;
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
  const result = withEstimatedUsage(renderResult(found.result ?? { type: "text", content: "你好，我是模拟的 DashScope 原生响应。" }, mockRequest), body.input?.messages);
  const latencyMs = latencyForRequest(context, mockRequest);
  if (latencyMs > 0) await delay(latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatDashScopeError(result.error.code, result.error.message);
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  if (stream) {
    if (body.model && context.systemSettings.modelStreamErrors[body.model]) {
      result.streamError = context.systemSettings.modelStreamErrors[body.model];
    }
    const responseBody = streamResponseBody(result, body.model ?? "qwen-mock");
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
    return sendDashScopeStream(reply, result, context.config.defaults.streamChunkDelayMs);
  }
  const responseBody = formatDashScopeGeneration(result);
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest, responseBody });
  return reply.send(responseBody);
}
