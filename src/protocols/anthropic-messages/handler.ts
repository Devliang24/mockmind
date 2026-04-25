import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatAnthropicError, formatAnthropicMessage } from "./adapter.js";
import { sendAnthropicStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isString, requireFields, requireHeaders } from "../validation.js";

type AnthropicBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
};

export async function handleAnthropicMessages(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
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
  const result = renderResult(found.result ?? { type: "text", content: "Hello from mock Anthropic." }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatAnthropicError(result.error.code, result.error.message));
  if (body.stream) return sendAnthropicStream(reply, body.model ?? "claude-mock", result, context.config.defaults.streamChunkDelayMs);
  return reply.send(formatAnthropicMessage(body.model ?? "claude-mock", result));
}
