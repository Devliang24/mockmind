import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkAuth } from "../../core/auth/auth-mock.js";
import { renderResult } from "../../core/renderer/render.js";
import type { MockRequest } from "../../core/scenario/types.js";
import type { ServerContext } from "../../server/context.js";
import { requestHeaders, requestQuery } from "../../shared/http.js";
import { delay } from "../../shared/time.js";
import { formatDashScopeError, formatDashScopeGeneration } from "./dashscope.js";
import { sendDashScopeStream } from "./stream.js";

type DashScopeBody = {
  model?: string;
  input?: {
    messages?: unknown[];
  };
  parameters?: {
    incremental_output?: boolean;
    result_format?: string;
  };
  stream?: boolean;
};

export async function registerAliyunBailianRoutes(app: FastifyInstance, context: ServerContext): Promise<void> {
  app.post<{ Body: DashScopeBody }>("/api/v1/services/aigc/text-generation/generation", async (request, reply) => handleGeneration(request, reply, "/api/v1/services/aigc/text-generation/generation"));
  app.post<{ Body: DashScopeBody }>("/dashscope/api/v1/services/aigc/text-generation/generation", async (request, reply) => handleGeneration(request, reply, "/dashscope/api/v1/services/aigc/text-generation/generation"));

  async function handleGeneration(request: FastifyRequest<{ Body: DashScopeBody }>, reply: FastifyReply, endpoint: string) {
    if (!checkAuth(context.config, request, reply)) return;
    const started = Date.now();
    const body = request.body;
    const stream = Boolean(body.stream ?? body.parameters?.incremental_output);
    const mockRequest: MockRequest = {
      provider: "aliyun-bailian",
      endpoint,
      method: request.method,
      model: body.model,
      messages: body.input?.messages,
      stream,
      rawBody: body,
      headers: requestHeaders(request),
      query: requestQuery(request)
    };
    const found = context.scenarios.find(mockRequest);
    const result = renderResult(found.result ?? { type: "text", content: "你好，我是模拟的 DashScope 原生响应。" }, mockRequest);
    if (context.config.defaults.latencyMs > 0) await delay(context.config.defaults.latencyMs);
    const status = result.error?.status ?? 200;
    context.recorder.add({ provider: mockRequest.provider, endpoint, model: mockRequest.model, matchedScenarioId: found.scenario?.id, status, durationMs: Date.now() - started, stream, request: mockRequest });
    if (result.type === "error" && result.error) return reply.code(result.error.status).send(formatDashScopeError(result.error.code, result.error.message));
    if (stream) return sendDashScopeStream(reply, result, context.config.defaults.streamChunkDelayMs);
    return reply.send(formatDashScopeGeneration(result));
  }
}
