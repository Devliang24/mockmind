import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatEmbedding, formatOpenAIError } from "./adapter.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isString, requireFields } from "../validation.js";

type EmbeddingBody = {
  model?: string;
  input?: unknown;
};

export async function handleOpenAIEmbeddings(
  handlerContext: ProtocolHandlerContext,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "input" }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  const started = Date.now();
  const body = request.body as EmbeddingBody;
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: body.model,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "embedding", embedding: [0.0123, -0.0456, 0.0789] }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatOpenAIError(result.error.status, result.error.code, result.error.message, result.error.type));
  return reply.send(formatEmbedding(body.model ?? "text-embedding-3-small", result.embedding ?? [0.0123, -0.0456, 0.0789]));
}
