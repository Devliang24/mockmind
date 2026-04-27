import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest, Provider } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay, unixSeconds } from "../../shared/time.js";
import { formatOpenAIError, formatUsage, normalizeOpenAIToolCalls } from "./adapter.js";
import { sendOpenAIResponsesStream } from "./responses-stream.js";
import { isString, requireFields } from "../validation.js";

export type OpenAIResponsesBody = {
  model?: string;
  input?: unknown;
  stream?: boolean;
  tools?: unknown[];
};

export async function handleOpenAIResponses(
  context: ServerContext,
  request: FastifyRequest<{ Body: OpenAIResponsesBody }>,
  reply: FastifyReply,
  provider: Provider,
  endpoint: string
): Promise<unknown> {
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "input" }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));

  const started = Date.now();
  const body = request.body;
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: body.model,
    messages: Array.isArray(body.input) ? body.input : undefined,
    prompt: typeof body.input === "string" ? body.input : undefined,
    stream: Boolean(body.stream),
    tools: body.tools,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "text", content: "This is a mock OpenAI Responses API response." }, mockRequest);
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
    return sendOpenAIResponsesStream(reply, body.model ?? "mock-model", result, context.config.defaults.streamChunkDelayMs);
  }
  const responseBody = formatResponse(body.model ?? "mock-model", result);
  context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}

export function formatResponse(model: string, result: ReturnType<typeof renderResult>): unknown {
  const output = result.type === "tool_call"
    ? normalizeOpenAIToolCalls(result).map((toolCall) => ({ type: "function_call", ...toolCall as Record<string, unknown> }))
    : [{ id: "msg_mock_0001", type: "message", role: "assistant", content: [{ type: "output_text", text: result.content ?? "" }] }];

  return {
    id: "resp_mock_0001",
    object: "response",
    created_at: unixSeconds(),
    status: "completed",
    model,
    output,
    output_text: result.type === "tool_call" ? "" : result.content ?? "",
    usage: formatUsage(result)
  };
}
