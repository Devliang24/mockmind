import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import type { MockRequest } from "../../core/scenario/types.js";
import { renderResult } from "../../core/renderer/render.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import type { ServerContext } from "../../server/context.js";
import { resolveOpenAICompatibleProvider } from "../openai-compatible/resolver.js";
import { formatChatCompletion, formatEmbedding, formatOpenAIError } from "./adapter.js";
import { sendOpenAIStream } from "./stream.js";

type ChatBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
  tools?: unknown[];
};

type EmbeddingBody = {
  model?: string;
  input?: unknown;
};

export async function registerOpenAIRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.get("/v1/models", async (_request, reply) => {
    return reply.send({ object: "list", data: context.config.models.map((model) => ({ id: model.id, object: "model", owned_by: model.provider })) });
  });

  app.post<{ Body: ChatBody }>("/v1/chat/completions", async (request, reply) => handleChat(request, reply));
  app.post<{ Body: ChatBody }>("/compatible-mode/v1/chat/completions", async (request, reply) => handleChat(request, reply, "aliyun-bailian", "/compatible-mode/v1/chat/completions"));
  app.post<{ Body: EmbeddingBody }>("/v1/embeddings", async (request, reply) => {
    if (!checkAuth(context.config, request, reply)) return;
    const started = Date.now();
    const body = request.body;
    const mockRequest: MockRequest = {
      provider: "openai",
      endpoint: "/v1/embeddings",
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
    if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatOpenAIError(result.error.status, result.error.code, result.error.message));
    return reply.send(formatEmbedding(body.model ?? "text-embedding-3-small", result.embedding ?? [0.0123, -0.0456, 0.0789]));
  });

  async function handleChat(request: FastifyRequest<{ Body: ChatBody }>, reply: FastifyReply, forcedProvider?: MockRequest["provider"], endpoint = "/v1/chat/completions") {
    if (!checkAuth(context.config, request, reply)) return;
    const started = Date.now();
    const body = request.body;
    const provider = forcedProvider ?? resolveOpenAICompatibleProvider(body.model);
    const mockRequest: MockRequest = {
      provider,
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
    const result = renderResult(found.result ?? { type: "text", content: "This is a default mock response from mockmind." }, mockRequest);
    if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
    const status = result.error?.status ?? 200;
    context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest });
    if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatOpenAIError(result.error.status, result.error.code, result.error.message));
    if (body.stream) return sendOpenAIStream(reply, body.model ?? "mock-model", result, context.config.defaults.streamChunkDelayMs);
    return reply.send(formatChatCompletion(body.model ?? "mock-model", result));
  }
}
