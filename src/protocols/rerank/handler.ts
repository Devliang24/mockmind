import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isArray, isRecord, isString, requireFields } from "../validation.js";
import { estimateTokenCount } from "../usage.js";

type RerankBody = {
  model?: string;
  query?: unknown;
  documents?: unknown[];
  top_n?: number;
  topN?: number;
  return_documents?: boolean;
  returnDocuments?: boolean;
  input?: {
    query?: unknown;
    documents?: unknown[];
  };
  parameters?: {
    top_n?: number;
    return_documents?: boolean;
  };
};

export async function handleRerank(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  if (!checkAuth(context.config, request, reply)) return;
  const validationError = requireFields(request.body, [
    { path: "model", validate: isString }
  ]);
  if (validationError) return reply.code(validationError.status).send(formatRerankError(provider, validationError.code, validationError.message));

  const started = Date.now();
  const body = request.body as RerankBody;
  const rerankInput = normalizeRerankInput(body);
  if (!isValidQuery(rerankInput.query) || !isArray(rerankInput.documents)) {
    return reply.code(400).send(formatRerankError(provider, "invalid_request", "Missing or invalid required field: query/documents or input.query/input.documents."));
  }
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: body.model,
    prompt: queryText(rerankInput.query),
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const usage = estimateTokenCount([rerankInput.query, rerankInput.documents]);
  const result = renderResult(found.result ?? { type: "json", json: formatRerankResponse(provider, rerankInput, usage) }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatRerankError(provider, result.error.code ?? "mock_error", result.error.message);
    context.recorder.add({ provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  const responseBody = result.type === "json" && result.json ? result.json : formatRerankResponse(provider, rerankInput, usage);
  context.recorder.add({ provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}

type NormalizedRerankInput = {
  model?: string;
  query: unknown;
  documents: unknown[];
  topN?: number;
  returnDocuments: boolean;
};

function normalizeRerankInput(body: RerankBody): NormalizedRerankInput {
  return {
    model: body.model,
    query: body.query ?? body.input?.query,
    documents: body.documents ?? body.input?.documents ?? [],
    topN: body.top_n ?? body.topN ?? body.parameters?.top_n,
    returnDocuments: body.return_documents ?? body.returnDocuments ?? body.parameters?.return_documents ?? false
  };
}

function isValidQuery(value: unknown): boolean {
  return isString(value) || isRecord(value);
}

function queryText(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function formatRerankResponse(provider: string, body: NormalizedRerankInput, totalTokens = 0): unknown {
  const documents = body.documents;
  const topN = Math.min(body.topN ?? documents.length, documents.length);
  const results = documents.slice(0, topN).map((document, index) => ({
    index,
    relevance_score: Number((1 - index * 0.1).toFixed(4)),
    ...(body.returnDocuments ? { document: formatRerankDocument(document) } : {})
  }));

  if (provider === "aliyun-bailian") {
    return {
      request_id: "req_mock_rerank_0001",
      output: { results },
      usage: { total_tokens: totalTokens }
    };
  }

  return {
    id: "rerank_mock_0001",
    object: "rerank",
    model: body.model,
    results,
    usage: { total_tokens: totalTokens }
  };
}

function formatRerankDocument(document: unknown): unknown {
  return typeof document === "string" ? { text: document } : document;
}

function formatRerankError(provider: string, code: string, message: string): unknown {
  if (provider === "aliyun-bailian") return { request_id: "req_mock_rerank_error_0001", code, message };
  return { error: { message, type: "invalid_request_error", param: null, code } };
}
