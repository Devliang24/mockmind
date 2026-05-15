import type { AdminRoute } from "@mockmind/shared";
import { embeddingModelForProvider, rerankModelsForProvider } from "./provider-models";

export type RouteExample = {
  docsUrl: string;
  required: string[];
  requestBody: unknown;
  responseBody: unknown;
  curl: string;
  stream?: {
    curl: string;
    responseText: string;
  };
};

const providerDocs: Record<string, string> = {
  openai: "https://platform.openai.com/docs/api-reference",
  azure: "https://learn.microsoft.com/azure/ai-foundry/openai/latest",
  deepseek: "https://api-docs.deepseek.com/api/create-chat-completion",
  moonshot: "https://platform.kimi.ai/docs/api/overview",
  zhipu: "https://docs.bigmodel.cn/api-reference",
  "aliyun-bailian": "https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope",
  anthropic: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages",
  gemini: "https://ai.google.dev/api",
  minimax: "https://platform.minimax.io/docs/api-reference/text-post"
};

const thinkingModels = new Set([
  "gpt-5.5",
  "gpt-5.4",
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "deepseek-v4-pro",
  "kimi-k2.6",
  "kimi-k2-thinking",
  "kimi-k2-thinking-turbo",
  "glm-5.1",
  "glm-5",
  "qwen3.6-max-preview",
  "qwen3.6-plus",
  "MiniMax-M2.7",
  "MiniMax-M2.5"
]);

export function exampleForRoute(route: AdminRoute, selectedModel: string, baseUrl: string): RouteExample {
  const model = exampleModel(route, selectedModel);
  const isZhipuCodingPlan = route.provider === "zhipu" && route.path.includes("/api/coding/paas/v4");
  const docsUrl = isZhipuCodingPlan ? "https://docs.bigmodel.cn/cn/coding-plan/tool/others" : providerDocs[route.provider] ?? providerDocs.openai;
  const newline = "\n";

  if (route.protocol === "openai-responses") {
    const body = nonStreamBody({ model, input: "hello" });
    return {
      ...openAIExample(baseUrl, route, docsUrl, body, openAIResponsesResponse(model, route), ["model", "input"]),
      stream: streamExampleFor(baseUrl, route, { ...body, stream: true }, openAIResponsesStream(model, route, newline))
    };
  }

  if (route.protocol === "openai-embeddings") {
    const embedding = embeddingModelForProvider(route.provider);
    return openAIExample(baseUrl, route, docsUrl, { model: embedding, input: "hello" }, openAIEmbeddingResponse(embedding, route), ["model", "input"]);
  }

  if (route.protocol === "anthropic-messages") {
    const body = nonStreamBody({ model, max_tokens: 128, messages: [{ role: "user", content: "hello" }] });
    return {
      docsUrl,
      required: ["model", "max_tokens", "messages"],
      requestBody: body,
      responseBody: anthropicMessageResponse(model, route),
      curl: curl(baseUrl, route.path, body, ["x-api-key: 123456", "anthropic-version: 2023-06-01", "Content-Type: application/json"]),
      stream: {
        curl: curl(baseUrl, route.path, { ...body, stream: true }, ["x-api-key: 123456", "anthropic-version: 2023-06-01", "Content-Type: application/json"]),
        responseText: anthropicMessageStream(model, route, newline)
      }
    };
  }

  if (route.protocol === "gemini-generate-content") {
    const body = { contents: [{ role: "user", parts: [{ text: "hello" }] }] };
    return {
      docsUrl,
      required: ["contents"],
      requestBody: body,
      responseBody: geminiContentResponse(route, model),
      curl: curl(baseUrl, route.path.replace(":modelAndMethod", `${model}:generateContent`), body, ["x-goog-api-key: 123456", "Content-Type: application/json"]),
      stream: {
        curl: curl(baseUrl, route.path.replace(":modelAndMethod", `${model}:streamGenerateContent?alt=sse`), body, ["x-goog-api-key: 123456", "Content-Type: application/json"]),
        responseText: geminiStreamResponse(route, model, newline)
      }
    };
  }

  if (route.protocol === "dashscope-generation") {
    const body = nonStreamBody({ model, input: { messages: [{ role: "user", content: "hello" }] }, parameters: { result_format: "message" } });
    return {
      docsUrl,
      required: ["model", "input.messages"],
      requestBody: body,
      responseBody: dashScopeGenerationResponse(route, model),
      curl: curl(baseUrl, route.path, body),
      stream: streamExampleFor(
        baseUrl,
        route,
        { model, input: { messages: [{ role: "user", content: "hello" }] }, parameters: { incremental_output: true }, stream: true },
        dashScopeGenerationStream(route, model, newline)
      )
    };
  }

  if (route.protocol === "minimax-chat") {
    const body = nonStreamBody({ model, messages: [{ role: "user", content: "hello" }] });
    return {
      docsUrl,
      required: ["model", "messages"],
      requestBody: body,
      responseBody: miniMaxChatResponse(model, route),
      curl: curl(baseUrl, route.path, body),
      stream: streamExampleFor(baseUrl, route, { ...body, stream: true }, miniMaxChatStream(model, route, newline))
    };
  }

  if (route.protocol === "rerank") {
    const body = rerankRequestBody(model);
    return {
      docsUrl,
      required: ["model", "query", "documents"],
      requestBody: body,
      responseBody: rerankResponse(route, body),
      curl: curl(baseUrl, route.path, body)
    };
  }

  if (route.method === "GET") {
    return {
      docsUrl,
      required: [],
      requestBody: {},
      responseBody: modelsResponse(route.provider, selectedModel),
      curl: curl(baseUrl, route.path, {}, [], "GET")
    };
  }

  const body = nonStreamBody({ model, messages: [{ role: "user", content: "hello" }] });
  return {
    ...openAIExample(baseUrl, route, docsUrl, body, openAIChatResponse(model, route), ["model", "messages"]),
    stream: streamExampleFor(baseUrl, route, { model, messages: [{ role: "user", content: "hello" }], stream: true, stream_options: { include_usage: true } }, openAIChatStream(model, route, newline))
  };
}

function exampleModel(route: AdminRoute, selectedModel: string): string {
  if (route.provider === "zhipu" && route.path.includes("/api/coding/paas/v4")) return "GLM-5.1";
  if (route.protocol === "openai-embeddings") return embeddingModelForProvider(route.provider);
  if (route.protocol === "rerank") return rerankModelsForProvider(route.provider).includes(selectedModel) ? selectedModel : rerankModelsForProvider(route.provider)[0] ?? selectedModel;
  return selectedModel;
}

function streamExampleFor(baseUrl: string, route: AdminRoute, body: Record<string, unknown>, responseText: string): RouteExample["stream"] {
  if (route.method === "GET") return undefined;
  return {
    curl: curl(baseUrl, route.path, body, jsonAuthHeaders(route), route.method),
    responseText
  };
}

function openAIExample(baseUrl: string, route: AdminRoute, docsUrl: string, requestBody: Record<string, unknown>, responseBody: unknown, required: string[]): RouteExample {
  return {
    docsUrl,
    required,
    requestBody,
    responseBody,
    curl: curl(baseUrl, route.path, requestBody, jsonAuthHeaders(route), route.method)
  };
}

function usage() {
  return { prompt_tokens: 8, completion_tokens: 7, total_tokens: 15 };
}

function responsesUsage() {
  return { input_tokens: 8, input_tokens_details: { cached_tokens: 0 }, output_tokens: 7, output_tokens_details: { reasoning_tokens: 0 }, total_tokens: 15 };
}

function tokenUsage() {
  return { input_tokens: 8, output_tokens: 7, total_tokens: 15 };
}

function miniMaxUsage() {
  return { prompt_tokens: 8, completion_tokens: 7, total_characters: 0, completion_tokens_details: { reasoning_tokens: 0 }, total_tokens: 15 };
}

function createdAt() {
  return 1777103905;
}

function sseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}`;
}

function sseEvent(name: string, payload: Record<string, unknown>, newline: string): string {
  return `event: ${name}${newline}data: ${JSON.stringify({ type: name, ...payload })}`;
}

function thinkingText(model: string, route: AdminRoute): string {
  return `Reasoning trace for ${model} on ${route.path}.`;
}

function endpointKey(route: AdminRoute): string {
  return route.path
    .replace(/^\/+/, "")
    .replace(":modelAndMethod", "model")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function endpointText(route: AdminRoute): string {
  return `${shortProviderName(route.displayName)} ${route.path}`;
}

function openAIChatResponse(model: string, route: AdminRoute) {
  const message = { role: "assistant", ...(isThinkingModel(model) ? { reasoning_content: thinkingText(model, route) } : {}), content: `Hello from ${endpointText(route)}.` };
  return { id: `chatcmpl_mock_${endpointKey(route)}`, object: "chat.completion", created: createdAt(), model, choices: [{ index: 0, message, finish_reason: "stop" }], usage: usage() };
}

function openAIChatChunk(model: string, route: AdminRoute, delta: Record<string, unknown>, finishReason: string | null = null, extra: Record<string, unknown> = {}) {
  return { id: `chatcmpl_mock_${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [{ index: 0, delta, finish_reason: finishReason }], ...extra };
}

function openAIChatStream(model: string, route: AdminRoute, newline: string): string {
  const chunks = [sseData(openAIChatChunk(model, route, { role: "assistant" }))];
  if (isThinkingModel(model)) chunks.push(sseData(openAIChatChunk(model, route, { reasoning_content: thinkingText(model, route) })));
  chunks.push(
    sseData(openAIChatChunk(model, route, { content: "Hello" })),
    sseData(openAIChatChunk(model, route, { content: ` from ${endpointText(route)}.` })),
    sseData(openAIChatChunk(model, route, {}, "stop")),
    sseData({ id: `chatcmpl_mock_${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [], usage: usage() }),
    "data: [DONE]"
  );
  return chunks.join(newline + newline);
}

function openAIResponsesResponse(model: string, route: AdminRoute) {
  const text = `This is a mock response from ${endpointText(route)}.`;
  const output: unknown[] = [{ id: `msg_mock_${endpointKey(route)}`, type: "message", role: "assistant", content: [{ type: "output_text", text }] }];
  if (isThinkingModel(model)) output.unshift({ id: `rs_mock_${endpointKey(route)}`, type: "reasoning", summary: [{ type: "summary_text", text: thinkingText(model, route) }] });
  return { id: `resp_mock_${endpointKey(route)}`, object: "response", created_at: createdAt(), status: "completed", model, output, output_text: text, usage: responsesUsage() };
}

function openAIResponsesStream(model: string, route: AdminRoute, newline: string): string {
  const text = `This is a mock response from ${endpointText(route)}.`;
  const events = [sseEvent("response.created", { response: { id: `resp_mock_${endpointKey(route)}`, object: "response", status: "in_progress", model } }, newline)];
  if (isThinkingModel(model)) events.push(sseEvent("response.reasoning_summary.delta", { delta: thinkingText(model, route) }, newline));
  events.push(
    sseEvent("response.output_text.delta", { delta: text.slice(0, 24) }, newline),
    sseEvent("response.output_text.delta", { delta: text.slice(24) }, newline),
    sseEvent("response.output_text.done", { text }, newline),
    sseEvent("response.completed", { response: { id: `resp_mock_${endpointKey(route)}`, object: "response", status: "completed", model, usage: responsesUsage() } }, newline),
    "data: [DONE]"
  );
  return events.join(newline + newline);
}

function openAIEmbeddingResponse(model: string, route: AdminRoute) {
  return { object: "list", data: [{ object: "embedding", index: 0, embedding: [0.0123, -0.0456, 0.0789], endpoint: route.path }], model, usage: { prompt_tokens: 1, total_tokens: 1 } };
}

function anthropicMessageResponse(model: string, route: AdminRoute) {
  const content = isThinkingModel(model)
    ? [{ type: "thinking", thinking: thinkingText(model, route), signature: "mock_signature" }, { type: "text", text: `Hello from ${endpointText(route)}.` }]
    : [{ type: "text", text: `Hello from ${endpointText(route)}.` }];
  return { id: `msg_mock_${endpointKey(route)}`, type: "message", role: "assistant", model, content, stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 8, output_tokens: 7 } };
}

function anthropicMessageStream(model: string, route: AdminRoute, newline: string): string {
  const events = [
    sseEvent("message_start", { message: { id: `msg_mock_${endpointKey(route)}`, type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 8, output_tokens: 0 } } }, newline)
  ];
  let textIndex = 0;
  if (isThinkingModel(model)) {
    events.push(
      sseEvent("content_block_start", { index: 0, content_block: { type: "thinking", thinking: "" } }, newline),
      sseEvent("content_block_delta", { index: 0, delta: { type: "thinking_delta", thinking: thinkingText(model, route) } }, newline),
      sseEvent("content_block_stop", { index: 0 }, newline)
    );
    textIndex = 1;
  }
  events.push(
    sseEvent("content_block_start", { index: textIndex, content_block: { type: "text", text: "" } }, newline),
    sseEvent("content_block_delta", { index: textIndex, delta: { type: "text_delta", text: "Hello" } }, newline),
    sseEvent("content_block_delta", { index: textIndex, delta: { type: "text_delta", text: ` from ${endpointText(route)}.` } }, newline),
    sseEvent("content_block_stop", { index: textIndex }, newline),
    sseEvent("message_delta", { delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 7 } }, newline),
    sseEvent("message_stop", {}, newline)
  );
  return events.join(newline + newline);
}

function geminiContentResponse(route: AdminRoute, model: string) {
  const parts = isThinkingModel(model) ? [{ thought: true, text: thinkingText(model, route) }, { text: `Hello from ${endpointText(route)}.` }] : [{ text: `Hello from ${endpointText(route)}.` }];
  return { candidates: [{ content: { role: "model", parts }, finishReason: "STOP", index: 0, safetyRatings: [] }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 7, totalTokenCount: 15 } };
}

function geminiStreamResponse(route: AdminRoute, model: string, newline: string): string {
  const items: string[] = [];
  if (isThinkingModel(model)) items.push(sseData({ candidates: [{ content: { role: "model", parts: [{ thought: true, text: thinkingText(model, route) }] }, index: 0, safetyRatings: [] }] }));
  items.push(
    sseData({ candidates: [{ content: { role: "model", parts: [{ text: "Hello" }] }, index: 0, safetyRatings: [] }] }),
    sseData({ candidates: [{ content: { role: "model", parts: [{ text: ` from ${endpointText(route)}.` }] }, finishReason: "STOP", index: 0, safetyRatings: [] }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 7, totalTokenCount: 15 } })
  );
  return items.join(newline + newline);
}

function dashScopeGenerationResponse(route: AdminRoute, model: string) {
  const message = { role: "assistant", ...(isThinkingModel(model) ? { reasoning_content: thinkingText(model, route) } : {}), content: `你好，我是 ${endpointText(route)} 的模拟响应。` };
  return { request_id: `req_mock_${endpointKey(route)}`, output: { choices: [{ finish_reason: "stop", message }] }, usage: tokenUsage(), status_code: 200, code: "", message: "" };
}

function dashScopeGenerationStream(route: AdminRoute, model: string, newline: string): string {
  const events: string[] = [];
  if (isThinkingModel(model)) events.push(sseEvent("result", { request_id: `req_mock_${endpointKey(route)}`, output: { choices: [{ finish_reason: null, message: { role: "assistant", reasoning_content: thinkingText(model, route), content: "" } }] } }, newline));
  events.push(
    sseEvent("result", { request_id: `req_mock_${endpointKey(route)}`, output: { choices: [{ finish_reason: null, message: { role: "assistant", content: "你好，" } }] } }, newline),
    sseEvent("result", { request_id: `req_mock_${endpointKey(route)}`, output: { choices: [{ finish_reason: null, message: { role: "assistant", content: `我是 ${endpointText(route)} 的模拟响应。` } }] } }, newline),
    sseEvent("result", { request_id: `req_mock_${endpointKey(route)}`, output: { choices: [{ finish_reason: "stop", message: { role: "assistant", content: "" } }] }, usage: tokenUsage() }, newline)
  );
  return events.join(newline + newline);
}

function miniMaxChatResponse(model: string, route: AdminRoute) {
  const message = { role: "assistant", name: "MiniMax AI", audio_content: "", reasoning_content: isThinkingModel(model) ? thinkingText(model, route) : "", content: `你好，我是 ${endpointText(route)} 的模拟响应。` };
  return {
    id: `minimax-mock-${endpointKey(route)}`,
    object: "chat.completion",
    choices: [{ index: 0, message, finish_reason: "stop" }],
    created: createdAt(),
    model,
    usage: miniMaxUsage(),
    input_sensitive: false,
    output_sensitive: false,
    input_sensitive_type: 0,
    output_sensitive_type: 0,
    output_sensitive_int: 0,
    base_resp: { status_code: 0, status_msg: "" }
  };
}

function miniMaxChatStream(model: string, route: AdminRoute, newline: string): string {
  const events: string[] = [];
  if (isThinkingModel(model)) events.push(sseData({ id: `minimax-mock-${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [{ index: 0, delta: { reasoning_content: thinkingText(model, route) }, finish_reason: null }] }));
  events.push(
    sseData({ id: `minimax-mock-${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [{ index: 0, delta: { content: "你好，" }, finish_reason: null }] }),
    sseData({ id: `minimax-mock-${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [{ index: 0, delta: { content: `我是 ${endpointText(route)} 的模拟响应。` }, finish_reason: null }] }),
    sseData({ id: `minimax-mock-${endpointKey(route)}`, object: "chat.completion.chunk", created: createdAt(), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: miniMaxUsage(), input_sensitive: false, output_sensitive: false, input_sensitive_type: 0, output_sensitive_type: 0, output_sensitive_int: 0, base_resp: { status_code: 0, status_msg: "" } }),
    "data: [DONE]"
  );
  return events.join(newline + newline);
}

function rerankRequestBody(model: string) {
  return { model, query: "hello", documents: ["hello world", "other"], top_n: 2, return_documents: true };
}

function rerankResponse(route: AdminRoute, body: { model: string }) {
  const output = { results: [{ index: 0, relevance_score: 1, document: { text: "hello world" } }, { index: 1, relevance_score: 0.12, document: { text: "other" } }] };
  if (route.provider === "aliyun-bailian") return { request_id: `req_mock_${endpointKey(route)}`, output, usage: { total_tokens: 2 } };
  return { id: `rerank_mock_${endpointKey(route)}`, object: "rerank", model: body.model, results: output.results, usage: { total_tokens: 2 } };
}

function modelsResponse(providerId: string, selectedModel: string) {
  const models = unique([selectedModel, ...rerankModelsForProvider(providerId), embeddingModelForProvider(providerId)]).filter(Boolean);
  return { object: "list", data: models.map((id) => ({ id, object: "model", owned_by: "mockmind" })) };
}

function isThinkingModel(model: string): boolean {
  return thinkingModels.has(model);
}

function shortProviderName(displayName: string): string {
  return displayName.replace("OpenAI Compatible", "OpenAI").replace("Google Gemini", "Gemini").replace("Alibaba Bailian / DashScope", "DashScope / 阿里百炼");
}

function authHeaders(route: AdminRoute): string[] {
  if (route.auth.scheme === "x-api-key") return ["x-api-key: 123456"];
  if (route.auth.scheme === "api-key") return ["api-key: 123456"];
  if (route.auth.scheme === "x-goog-api-key-or-query-key") return ["x-goog-api-key: 123456"];
  return ["Authorization: Bearer 123456"];
}

function jsonAuthHeaders(route: AdminRoute): string[] {
  return [...authHeaders(route), "Content-Type: application/json"];
}

function nonStreamBody<T extends Record<string, unknown>>(body: T): T & { stream: false } {
  return { ...body, stream: false };
}

function curl(baseUrl: string, path: string, body: unknown, headers: string[] = authHeadersForPath(path), method: AdminRoute["method"] = "POST"): string {
  const normalizedPath = examplePath(path, body);
  if (method === "GET") return `curl ${baseUrl}${normalizedPath}`;
  const headerLines = headers.map((header) => `  -H '${header}' \\`).join("\n");
  return `curl ${baseUrl}${normalizedPath} \\\n${headerLines}\n  -d '${JSON.stringify(body, null, 2)}'`;
}

function examplePath(path: string, body: unknown): string {
  const model = modelFromBody(body);
  const normalized = path
    .replace(":modelAndMethod", "gemini-3-flash-preview:generateContent")
    .replace(":deployment", model ?? "gpt-5.4");
  if (path.startsWith("/openai/deployments/")) return `${normalized}?api-version=2024-12-01-preview`;
  if (path === "/openai/v1/responses") return `${normalized}?api-version=preview`;
  return normalized;
}

function modelFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const model = (body as Record<string, unknown>).model;
  return typeof model === "string" ? model : undefined;
}

function authHeadersForPath(path: string): string[] {
  if (path.includes("generativelanguage.googleapis.com")) return ["x-goog-api-key: 123456", "Content-Type: application/json"];
  return ["Authorization: Bearer 123456", "Content-Type: application/json"];
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
