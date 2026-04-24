import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatGeminiContent, formatGeminiError } from "./adapter.js";
import { sendGeminiStream } from "./stream.js";

type GeminiBody = {
  contents?: unknown[];
};

type GeminiParams = {
  modelAndMethod: string;
};

type GeminiOperation = {
  model: string;
  method: "generateContent" | "streamGenerateContent";
};

export async function registerGeminiRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.post<{ Params: GeminiParams; Body: GeminiBody }>("/v1beta/models/:modelAndMethod", async (request, reply) => handleGenerate(request, reply, ""));
  app.post<{ Params: GeminiParams; Body: GeminiBody }>("/gemini/v1beta/models/:modelAndMethod", async (request, reply) => handleGenerate(request, reply, "/gemini"));

  async function handleGenerate(request: FastifyRequest<{ Params: GeminiParams; Body: GeminiBody }>, reply: FastifyReply, prefix: string) {
    const operation = parseOperation(request.params.modelAndMethod);
    if (!operation) {
      return reply.code(404).send(formatGeminiError(404, `Unsupported Gemini operation: ${request.params.modelAndMethod}`));
    }
    if (!checkAuth(context.config, request, reply)) return;

    const started = Date.now();
    const body = request.body;
    const stream = operation.method === "streamGenerateContent";
    const endpoint = `${prefix}/v1beta/models/${operation.model}:${operation.method}`;
    const mockRequest: MockRequest = {
      provider: "gemini",
      endpoint,
      method: request.method,
      model: operation.model,
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
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: operation.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest });
    if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatGeminiError(result.error.status, result.error.message, result.error.code));
    if (stream) return sendGeminiStream(reply, result, context.config.defaults.streamChunkDelayMs);
    return reply.send(formatGeminiContent(result));
  }
}

function parseOperation(value: string): GeminiOperation | undefined {
  const separator = value.lastIndexOf(":");
  if (separator < 0) return undefined;
  const model = value.slice(0, separator);
  const method = value.slice(separator + 1);
  if (method !== "generateContent" && method !== "streamGenerateContent") return undefined;
  return { model, method };
}
