import { describe, expect, it } from "vitest";
import { createMockMindServer } from "../../src/server/create-server.js";
import type { MockMindConfig } from "../../src/core/scenario/types.js";

const config: MockMindConfig = {
  server: { host: "127.0.0.1", port: 0 },
  providers: { enabled: "all" },
  auth: { mode: "permissive", apiKeys: ["test-key"] },
  models: [],
  defaults: { latencyMs: 0, streamChunkDelayMs: 0 },
  fallback: { enabled: true, response: { type: "text", content: "fallback" } },
  scenarios: []
};

describe("provider embedding endpoints", () => {
  it.each([
    "/api/paas/v4/embeddings",
    "/compatible-mode/v1/embeddings"
  ])("serves %s", async (url) => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url, payload: { model: "text-embedding-mock", input: "hello" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().object).toBe("list");
    expect(response.json().data[0].object).toBe("embedding");
    await app.close();
  });

  it.each([
    "/api/paas/v4/rerank",
    "/compatible-api/v1/reranks",
    "/api/v1/services/rerank/text-rerank/text-rerank"
  ])("serves rerank %s", async (url) => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url, payload: { model: "qwen3-rerank", query: "hello", documents: ["hello world", "other"], top_n: 2, return_documents: true } });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("relevance_score");
    await app.close();
  });

  it("serves DashScope native rerank request body", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/services/rerank/text-rerank/text-rerank",
      payload: { model: "gte-rerank-v2", input: { query: "hello", documents: ["hello world", "other"] }, parameters: { top_n: 1, return_documents: true } }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().request_id).toBe("req_mock_rerank_0001");
    expect(response.json().output.results).toHaveLength(1);
    expect(response.json().output.results[0].document).toEqual({ text: "hello world" });
    await app.close();
  });
});
