import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatAnthropicError, formatAnthropicMessage } from "./adapter.js";
import { sendAnthropicStream } from "./stream.js";

type AnthropicBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
};

export async function registerAnthropicRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.post<{ Body: AnthropicBody }>("/v1/messages", async (request, reply) => handleMessage(request, reply, "/v1/messages"));
  app.post<{ Body: AnthropicBody }>("/anthropic/v1/messages", async (request, reply) => handleMessage(request, reply, "/anthropic/v1/messages"));

  async function handleMessage(request: FastifyRequest<{ Body: AnthropicBody }>, reply: FastifyReply, endpoint: string) {
    if (!checkAuth(context.config, request, reply)) return;
    const started = Date.now();
    const body = request.body;
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
}
