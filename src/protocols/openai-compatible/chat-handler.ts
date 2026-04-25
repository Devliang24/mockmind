import type { FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest, Provider } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatChatCompletion, formatOpenAIError } from "./adapter.js";
import { sendOpenAIStream } from "./stream.js";

export type OpenAICompatibleChatBody = {
  model?: string;
  messages?: unknown[];
  stream?: boolean;
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
  const started = Date.now();
  const body = request.body;
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
  const result = renderResult(found.result ?? { type: "text", content: defaultContent(provider) }, mockRequest);
  if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
  const status = result.error?.status ?? 200;
  context.recorder.add({ provider: mockRequest.provider, endpoint: mockRequest.endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream: Boolean(body.stream), request: mockRequest });
  if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatOpenAIError(result.error.status, result.error.code, result.error.message, result.error.type));
  if (body.stream) return sendOpenAIStream(reply, body.model ?? "mock-model", result, context.config.defaults.streamChunkDelayMs);
  return reply.send(formatChatCompletion(body.model ?? "mock-model", result));
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
