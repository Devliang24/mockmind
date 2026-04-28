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
  scenarios: [
    { id: "response", provider: "openai", endpoint: "/v1/responses", priority: 0, match: { bodyPath: { input: "hello" } }, response: { type: "text", content: "responses ok" } },
    { id: "image", provider: "openai", endpoint: "/v1/images/generations", priority: 0, match: { bodyPath: { prompt: "cat" } }, response: { type: "text", content: "https://example.com/cat.png" } }
  ]
};

describe("OpenAI additional APIs", () => {
  it("serves Responses API", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/responses", payload: { model: "gpt-4o-mini", input: "hello" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().object).toBe("response");
    expect(response.json().output_text).toBe("responses ok");
    await app.close();
  });

  it("validates Responses API required fields", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/responses", payload: { input: "hello" } });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("invalid_request");
    await app.close();
  });

  it("serves Alibaba compatible Responses API", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/compatible-mode/v1/responses", payload: { model: "qwen3.6-plus", input: "hello" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().object).toBe("response");
    expect(response.json().usage.input_tokens).toBeGreaterThan(0);
    await app.close();
  });

  it("serves image generation", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/images/generations", payload: { model: "gpt-image-1", prompt: "cat" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().data[0].url).toBe("https://example.com/cat.png");
    await app.close();
  });

  it("serves audio speech bytes", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/audio/speech", payload: { model: "gpt-4o-mini-tts", input: "hello", voice: "alloy" } });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("audio/mpeg");
    await app.close();
  });

  it("serves moderations", async () => {
    const { app } = await createMockMindServer(config);
    const response = await app.inject({ method: "POST", url: "/v1/moderations", payload: { model: "omni-moderation-latest", input: "hello" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().results[0].flagged).toBe(false);
    await app.close();
  });

  it("serves files and batches", async () => {
    const { app } = await createMockMindServer(config);
    const files = await app.inject({ method: "GET", url: "/v1/files" });
    expect(files.json().object).toBe("list");
    const batch = await app.inject({ method: "POST", url: "/v1/batches", payload: { input_file_id: "file-mock-0001", endpoint: "/v1/chat/completions", completion_window: "24h" } });
    expect(batch.json().object).toBe("batch");
    await app.close();
  });
});
