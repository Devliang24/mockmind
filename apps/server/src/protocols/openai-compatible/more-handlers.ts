import type { FastifyReply, FastifyRequest } from "fastify";
import { checkProviderAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { unixSeconds } from "../../shared/time.js";
import type { ProtocolHandlerContext } from "../types.js";
import { isString, requireFields, validateJsonObjectBody } from "../validation.js";
import { formatOpenAIError } from "./adapter.js";

type Body = Record<string, unknown>;

export async function handleOpenAIImages(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (!checkOpenAICompatibleAuth(handlerContext, request, reply)) return;
  const validationError = requireFields(request.body, [{ path: "prompt", validate: isString }]);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  return sendRendered(handlerContext, request, reply, "image", (body, content) => ({
    created: unixSeconds(),
    data: [{ revised_prompt: body.prompt, url: content || "https://mockmind.local/images/mock.png" }]
  }));
}

export async function handleOpenAIAudio(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (!checkOpenAICompatibleAuth(handlerContext, request, reply)) return;
  const endpoint = handlerContext.endpoint;
  const fields = endpoint.endsWith("/speech")
    ? [{ path: "model", validate: isString }, { path: "input", validate: isString }, { path: "voice", validate: isString }]
    : [{ path: "model", validate: isString }];
  const validationError = requireFields(request.body, fields);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  if (endpoint.endsWith("/speech")) return reply.header("content-type", "audio/mpeg").send(Buffer.from("MOCKMIND_AUDIO_BYTES"));
  return sendRendered(handlerContext, request, reply, "audio", (_body, content) => ({ text: content || "Mock transcription text." }));
}

export async function handleOpenAIModerations(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (!checkOpenAICompatibleAuth(handlerContext, request, reply)) return;
  const validationError = requireFields(request.body, [{ path: "model", validate: isString }, { path: "input" }]);
  if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  return sendRendered(handlerContext, request, reply, "moderation", () => ({
    id: "modr_mock_0001",
    model: (request.body as Body).model,
    results: [{ flagged: false, categories: {}, category_scores: {} }]
  }));
}

export async function handleOpenAIFiles(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (!checkOpenAICompatibleAuth(handlerContext, request, reply)) return;
  if (request.method === "POST") {
    const validationError = validateJsonObjectBody(request.body);
    if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  }
  const fileId = param(request, "fileId") ?? "file-mock-0001";
  if (request.method === "GET" && handlerContext.routePath === "/v1/files") {
    return reply.send({ object: "list", data: [fileObject(fileId)] });
  }
  if (request.method === "DELETE") return reply.send({ id: fileId, object: "file", deleted: true });
  return reply.send(fileObject(fileId));
}

export async function handleOpenAIBatch(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (!checkOpenAICompatibleAuth(handlerContext, request, reply)) return;
  if (request.method === "POST" && handlerContext.routePath === "/v1/batches") {
    const validationError = requireFields(request.body, [
      { path: "input_file_id", validate: isString },
      { path: "endpoint", validate: isString },
      { path: "completion_window", validate: isString }
    ]);
    if (validationError) return reply.code(validationError.status).send(formatOpenAIError(validationError.status, validationError.code, validationError.message, validationError.type));
  }
  const batchId = param(request, "batchId") ?? "batch_mock_0001";
  return reply.send({
    id: batchId,
    object: "batch",
    endpoint: (request.body as Body | undefined)?.endpoint ?? "/v1/chat/completions",
    errors: null,
    input_file_id: (request.body as Body | undefined)?.input_file_id ?? "file-mock-0001",
    completion_window: (request.body as Body | undefined)?.completion_window ?? "24h",
    status: handlerContext.endpoint.endsWith("/cancel") ? "cancelled" : "completed",
    output_file_id: "file-mock-output-0001",
    error_file_id: null,
    created_at: unixSeconds(),
    in_progress_at: unixSeconds(),
    expires_at: unixSeconds() + 86400,
    finalizing_at: unixSeconds(),
    completed_at: unixSeconds(),
    failed_at: null,
    expired_at: null,
    cancelling_at: null,
    cancelled_at: handlerContext.endpoint.endsWith("/cancel") ? unixSeconds() : null,
    request_counts: { total: 1, completed: 1, failed: 0 },
    metadata: null
  });
}

async function sendRendered(
  handlerContext: ProtocolHandlerContext,
  request: FastifyRequest,
  reply: FastifyReply,
  label: string,
  format: (body: Body, content: string) => unknown
): Promise<unknown> {
  const { context, provider, endpoint } = handlerContext;
  const body = request.body as Body;
  const mockRequest: MockRequest = {
    provider,
    endpoint,
    method: request.method,
    model: typeof body.model === "string" ? body.model : undefined,
    prompt: typeof body.prompt === "string" ? body.prompt : typeof body.input === "string" ? body.input : undefined,
    rawBody: body,
    headers: requestHeaders(request),
    query: requestQuery(request)
  };
  const found = context.scenarios.find(mockRequest);
  const result = renderResult(found.result ?? { type: "text", content: `Mock ${label} response.` }, mockRequest);
  const status = result.error?.status ?? 200;
  if (result.type === "error" && result.error) {
    const responseBody = formatOpenAIError(result.error.status, result.error.code, result.error.message, result.error.type);
    context.recorder.add({ provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: 0, stream: false, request: mockRequest, responseBody });
    return reply.code(result.error.status).send(responseBody);
  }
  const responseBody = format(body, result.content ?? "");
  context.recorder.add({ provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: 0, stream: false, request: mockRequest, responseBody });
  return reply.send(responseBody);
}

function checkOpenAICompatibleAuth(handlerContext: ProtocolHandlerContext, request: FastifyRequest, reply: FastifyReply): boolean {
  return checkProviderAuth(
    handlerContext.context.config,
    request,
    reply,
    handlerContext.provider,
    formatOpenAIError(401, "invalid_api_key", "Invalid API key", "authentication_error")
  );
}

function fileObject(id: string): Record<string, unknown> {
  return { id, object: "file", bytes: 128, created_at: unixSeconds(), filename: "mockmind.jsonl", purpose: "batch", status: "processed" };
}

function param(request: FastifyRequest, name: string): string | undefined {
  const params = request.params;
  if (!params || typeof params !== "object") return undefined;
  const value = (params as Record<string, unknown>)[name];
  return typeof value === "string" ? value : undefined;
}
