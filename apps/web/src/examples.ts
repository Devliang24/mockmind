import type { AdminRoute } from "@mockmind/shared";

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
  deepseek: "https://api-docs.deepseek.com/api/create-chat-completion",
  moonshot: "https://platform.kimi.ai/docs/api/overview",
  zhipu: "https://docs.bigmodel.cn/api-reference",
  "aliyun-bailian": "https://help.aliyun.com/zh/model-studio/",
  anthropic: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages",
  gemini: "https://ai.google.dev/api",
  minimax: "https://platform.minimax.io/docs/api-reference/text-post"
};

export function exampleForRoute(route: AdminRoute, model: string, baseUrl: string): RouteExample {
  if (route.protocol === "anthropic-messages") {
    const body = { model, max_tokens: 256, messages: [{ role: "user", content: "hello" }] };
    return {
      docsUrl: providerDocs.anthropic,
      required: ["model", "max_tokens", "messages", "anthropic-version"],
      requestBody: body,
      responseBody: { type: "message", role: "assistant", content: [{ type: "text", text: "Hello from MockMind." }] },
      curl: curl(baseUrl, route.path, body, ["x-api-key: 123456", "anthropic-version: 2023-06-01"]),
      stream: {
        curl: curl(baseUrl, route.path, { ...body, stream: true }, ["x-api-key: 123456", "anthropic-version: 2023-06-01"]),
        responseText: "event: content_block_delta\\ndata: {\"type\":\"content_block_delta\",\"delta\":{\"type\":\"text_delta\",\"text\":\"Hello\"}}"
      }
    };
  }

  if (route.protocol === "gemini-generate-content") {
    const body = { contents: [{ parts: [{ text: "hello" }] }] };
    const path = route.path.replace(":modelAndMethod", `${model}:generateContent`);
    const streamPath = route.path.replace(":modelAndMethod", `${model}:streamGenerateContent?alt=sse`);
    return {
      docsUrl: providerDocs.gemini,
      required: ["contents"],
      requestBody: body,
      responseBody: { candidates: [{ content: { parts: [{ text: "Hello from MockMind." }] } }] },
      curl: curl(baseUrl, path, body, ["x-goog-api-key: 123456"]),
      stream: {
        curl: curl(baseUrl, streamPath, body, ["x-goog-api-key: 123456"]),
        responseText: "data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Hello\"}]}}]}"
      }
    };
  }

  if (route.protocol === "dashscope-generation") {
    const body = { model, input: { messages: [{ role: "user", content: "hello" }] }, parameters: { result_format: "message" } };
    return {
      docsUrl: providerDocs["aliyun-bailian"],
      required: ["model", "input.messages"],
      requestBody: body,
      responseBody: { output: { text: "Hello from MockMind." }, usage: { input_tokens: 8, output_tokens: 6 } },
      curl: curl(baseUrl, route.path, body, ["Authorization: Bearer 123456"]),
      stream: {
        curl: curl(baseUrl, route.path, { ...body, stream: true }, ["Authorization: Bearer 123456"]),
        responseText: "event: result\\ndata: {\"output\":{\"text\":\"Hello\"}}"
      }
    };
  }

  if (route.protocol === "openai-embeddings") {
    const body = { model, input: "hello" };
    return {
      docsUrl: providerDocs[route.provider] ?? providerDocs.openai,
      required: ["model", "input"],
      requestBody: body,
      responseBody: { data: [{ object: "embedding", embedding: [0.01, 0.02, 0.03], index: 0 }] },
      curl: curl(baseUrl, route.path, body, authHeaders(route))
    };
  }

  if (route.protocol === "openai-responses") {
    const body = { model, input: "hello" };
    return {
      docsUrl: providerDocs[route.provider] ?? providerDocs.openai,
      required: ["model", "input"],
      requestBody: body,
      responseBody: { id: "resp_mock_0001", output_text: "Hello from MockMind." },
      curl: curl(baseUrl, route.path, body, authHeaders(route)),
      stream: {
        curl: curl(baseUrl, route.path, { ...body, stream: true }, authHeaders(route)),
        responseText: "event: response.output_text.delta\\ndata: {\"delta\":\"Hello\"}"
      }
    };
  }

  if (route.protocol === "rerank") {
    const body = { model, query: "mock server", documents: ["MockMind records requests", "Other document"], return_documents: true };
    return {
      docsUrl: providerDocs[route.provider] ?? providerDocs.openai,
      required: ["model", "query", "documents"],
      requestBody: body,
      responseBody: { results: [{ index: 0, relevance_score: 0.98, document: { text: "MockMind records requests" } }] },
      curl: curl(baseUrl, route.path, body, authHeaders(route))
    };
  }

  if (route.method === "GET") {
    return {
      docsUrl: providerDocs[route.provider] ?? providerDocs.openai,
      required: [],
      requestBody: null,
      responseBody: { object: "list", data: [{ id: model, object: "model" }] },
      curl: `curl ${baseUrl}${route.path}`
    };
  }

  const body = { model, messages: [{ role: "user", content: "hello" }] };
  return {
    docsUrl: route.provider === "zhipu" && route.path.includes("/api/coding/") ? "https://docs.bigmodel.cn/cn/coding-plan/tool/others" : providerDocs[route.provider] ?? providerDocs.openai,
    required: ["model", "messages"],
    requestBody: body,
    responseBody: { id: "chatcmpl_mock_0001", choices: [{ message: { role: "assistant", content: "Hello from MockMind." } }] },
    curl: curl(baseUrl, route.path, body, authHeaders(route)),
    stream: {
      curl: curl(baseUrl, route.path, { ...body, stream: true }, authHeaders(route)),
      responseText: "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\\n\\ndata: [DONE]"
    }
  };
}

function authHeaders(route: AdminRoute): string[] {
  if (route.auth.scheme === "x-api-key") return ["x-api-key: 123456"];
  if (route.auth.scheme === "x-goog-api-key-or-query-key") return ["x-goog-api-key: 123456"];
  return ["Authorization: Bearer 123456"];
}

function curl(baseUrl: string, path: string, body: unknown, headers: string[]): string {
  const headerLines = [...headers, "Content-Type: application/json"].map((header) => `  -H '${header}'`).join(" \\\n");
  return `curl ${baseUrl}${path} \\\n${headerLines} \\\n  -d '${JSON.stringify(body, null, 2)}'`;
}
