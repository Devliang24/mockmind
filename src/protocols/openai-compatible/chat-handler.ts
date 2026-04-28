import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest, Provider } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatChatCompletion, formatOpenAIError } from "./adapter.js";
import { isArray, isString, requireFields } from "../validation.js";
import { sendOpenAIStream } from "./stream.js";
import { withEstimatedUsage } from "../usage.js";
import { resolveOpenAICompatibleProvider } from "./resolver.js";

export type OpenAICompatibleChatBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
  stream_options?: {
    include_usage?: boolean;
  };
  tools?: unknown[];
};

export async function handleOpenAICompatibleChat(
  context: ServerContext,
  request: FastifyRequest<{ Body: OpenAICompatibleChatBody }>,
  reply: FastifyReply,
  provider: Provider,
  endpoint: string
): Promise<unknown> {
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "messages", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  const started = Date.now();
  const body = request.body;
  const effectiveProvider = provider === "openai" ? resolveOpenAICompatibleProvider(body.model, endpoint) : provider;
  const mockRequest: MockRequest = {
    provider: effectiveProvider,
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
  const result = withEstimatedUsage(renderResult(found.result ?? { type: "text", content: defaultContent(effectiveProvider) }, mockRequest), body.messages);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatOpenAIError(result.error.status, result.error.code, result.error.message, result.error.type);
    context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  if (body.stream) {
    const responseBody = { stream: true, format: "text/event-stream", content: result.chunks ?? result.content ?? "" };
    context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: true, request: mockRequest, responseBody });
    return sendOpenAIStream(reply, body.model ?? "mock-model", result, context.config.defaults.streamChunkDelayMs, body.stream_options?.include_usage === true);
  }
  const responseBody = formatChatCompletion(body.model ?? "mock-model", result);
  context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}

function defaultContent(provider: Provider): string {
  switch (provider) {
    case "deepseek":
      return "This is a mock DeepSeek response.";
    case "moonshot":
      return "This is a mock Moonshot / Kimi response.";
    case "zhipu":
      return "This is a mock Zhipu GLM response.";
    case "aliyun-bailian":
      return "This is a mock Qwen response.";
    default:
      return "This is a default mock response from mockmind.";
  }
}
