import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isString, requireFields } from "../validation.js";

type RerankBody = {
  model?: string;
  query?: string;
  documents?: unknown[];
  top_n?: number;
  topN?: number;
};

export async function handleRerank(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString },
    { path: "query", validate: isString },
    { path: "documents", validate: isArray }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatRerankError(provider, validationError.code, validationError.message));

  const started = Date.now();
  const body = request.body as RerankBody;
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: body.model,
    prompt: body.query,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "json", json: formatRerankResponse(provider, body) }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatRerankError(provider, result.error.code ?? "mock_error", result.error.message));
  if (result.type === "json" && result.json) return reply.send(result.json);
  return reply.send(formatRerankResponse(provider, body));
}

function formatRerankResponse(provider: string, body: RerankBody): unknown {
  const documents = body.documents ?? [];
  const topN = Math.min(body.top_n ?? body.topN ?? documents.length, documents.length);
  const results = documents.slice(0, topN).map((document, index) => ({
    index,
    relevance_score: Number((1 - index * 0.1).toFixed(4)),
    document
  }));

  if (provider === "aliyun-bailian") {
    return {
      request_id: "req_mock_rerank_0001",
      output: { results },
      usage: { total_tokens: 0 }
    };
  }

  return {
    id: "rerank_mock_0001",
    object: "rerank",
    model: body.model,
    results,
    usage: { total_tokens: 0 }
  };
}

function formatRerankError(provider: string, code: string, message: string): unknown {
  if (provider === "aliyun-bailian") return { request_id: "req_mock_rerank_error_0001", code, message };
  return { error: { message, type: "invalid_request_error", param: null, code } };
}
