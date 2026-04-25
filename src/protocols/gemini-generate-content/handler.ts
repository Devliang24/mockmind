import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatGeminiContent, formatGeminiError } from "./adapter.js";
import { sendGeminiStream } from "./stream.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, requireFields } from "../validation.js";

type GeminiBody = {
  contents?: unknown[];
};

export async function handleGeminiGenerateContent(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [{ path: "contents", validate: isArray }]);
  if (validationError) return reply.code(validationError.status).send(formatGeminiError(validationError.status, validationError.message, validationError.code));
  const started = Date.now();
  const body = request.body as GeminiBody;
  const model = modelFromEndpoint(endpoint);
  const stream = endpoint.endsWith(":streamGenerateContent");
  const mockRequest: MockRequest = {
    provider: "gemini",
    endpoint,
    method: request.method,
    model,
    messages: body.contents,
    stream,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "text", content: "Hello from mock Gemini." }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider: mockRequest.provider, endpoint, model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatGeminiError(result.error.status, result.error.message, result.error.code));
  if (stream) return sendGeminiStream(reply, result, context.config.defaults.streamChunkDelayMs);
  return reply.send(formatGeminiContent(result));
}

function modelFromEndpoint(endpoint: string): string | undefined {
  const match = endpoint.match(/\/models\/([^:]+):/);
  return match?.[1];
}
