# MockMind

MockMind is a TypeScript mock server for OpenAI-compatible and major LLM provider APIs. It is designed for local development, CI testing, SDK compatibility checks, and agent/RAG workflow debugging.

## Quick Start

```bash
npm install
npm run dev -- start --config mockmind.yaml
```

Then call the OpenAI-compatible endpoint:

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

## CLI

```bash
npm run dev -- init
npm run dev -- validate --config mockmind.yaml
npm run dev -- start --config mockmind.yaml --port 4000
```

MockMind starts all implemented protocols by default. The `providers` section is kept as metadata for documentation, model ownership, and Admin API output rather than as a route enable/disable switch.

## Implemented MVP

- `GET /health`
- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/embeddings`
- `POST /compatible-mode/v1/chat/completions`
- `POST /v1/messages`
- `POST /anthropic/v1/messages`
- `POST /v1beta/models/:model:generateContent`
- `POST /v1beta/models/:model:streamGenerateContent`
- `POST /gemini/v1beta/models/:model:generateContent`
- `POST /gemini/v1beta/models/:model:streamGenerateContent`
- `POST /api/v1/services/aigc/text-generation/generation`
- `POST /dashscope/api/v1/services/aigc/text-generation/generation`
- OpenAI-compatible SSE streaming
- Anthropic, Gemini, and DashScope minimal native protocol mocks
- YAML config loading and validation
- Scenario matching and global fallback
- Text, stream, embedding, tool call, and error mock results
- Basic request recorder and Admin API

## Admin API

```txt
GET  /__admin/config
GET  /__admin/models
GET  /__admin/providers
GET  /__admin/routes
GET  /__admin/scenarios
GET  /__admin/requests
POST /__admin/reset
POST /__admin/reload
```

## OpenAI SDK Example

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "test-key",
  baseURL: "http://127.0.0.1:4000/v1",
});

const result = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hello" }],
});
```

## Programmatic API

```ts
import { createMockLLMServer } from "mockmind";

const server = await createMockLLMServer({ port: 4000 });

await server.start();
await server.resetRequests();

const requests = await server.getRequests();

await server.stop();
```

## Native Protocol Examples

Anthropic Messages:

```bash
curl http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: test-key' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{"model":"claude-3-5-sonnet-latest","messages":[{"role":"user","content":"hello"}]}'
```

Gemini generateContent:

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:generateContent \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"role":"user","parts":[{"text":"hello"}]}]}'
```

DashScope text generation:

```bash
curl http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen-plus","input":{"messages":[{"role":"user","content":"你好"}]},"parameters":{"result_format":"message"}}'
```
