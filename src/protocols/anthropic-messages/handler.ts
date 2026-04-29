import type { FastifyReply, FastifyRequest } from "fastify";
import { checkProviderAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatAnthropicError, formatAnthropicMessage } from "./adapter.js";
import { sendAnthropicStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isString, requireFields, requireHeaders } from "../validation.js";
import { withEstimatedUsage } from "../usage.js";

type AnthropicBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
};

export async function handleAnthropicMessages(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, endpoint } = handlerContext;
  if (!checkProviderAuth(context.config, request, reply, "anthropic", formatAnthropicError("authentication_error", "Invalid API key"))) return;
  const headerError = requireHeaders(request, ["anthropic-version"]);
  if (headerError) return reply.code(headerError.status).send(formatAnthropicError(headerError.code, headerError.message));
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "max_tokens" },
    { path: "messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatAnthropicError(validationError.code, validationError.message));
  const started = Date.now();
  const body = request.body as AnthropicBody;
  const mockRequest: MockRequest = {
    provider: "anthropic",
    endpoint,
    method: request.method,
    model: body.model,
    messages: body.messages,
    stream: Boolean(body.stream),
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = withEstimatedUsage(renderResult(found.result ?? { type: "text", content: "Hello from mock Anthropic." }, mockRequest), body.messages);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatAnthropicError(result.error.code, result.error.message);
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  if (body.stream) {
    const responseBody = { stream: true, format: "text/event-stream", content: result.chunks ?? result.content ?? "" };
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: true, request: mockRequest, responseBody });
    return sendAnthropicStream(reply, body.model ?? "claude-mock", result, context.config.defaults.streamChunkDelayMs);
  }
  const responseBody = formatAnthropicMessage(body.model ?? "claude-mock", result);
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}
