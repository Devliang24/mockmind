# MockMind

MockMind is a TypeScript mock server for OpenAI-compatible and major LLM provider APIs. It is designed for local development, CI testing, SDK compatibility checks, and agent/RAG workflow debugging.

MockMind does not run real LLM inference and does not proxy real provider APIs by default. It returns protocol-shaped mock responses from YAML scenarios.

## Quick Start

```bash
npm install
npm run dev -- start --config mockmind.yaml --port 4000
```

Call the OpenAI-compatible endpoint:

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

Expected response:

```json
{
  "id": "chatcmpl_mock_0001",
  "object": "chat.completion",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello from OpenAI-compatible mock."
      },
      "finish_reason": "stop"
    }
  ]
}
```

## CLI

```bash
npm run dev -- init
npm run dev -- validate --config mockmind.yaml
npm run dev -- start --config mockmind.yaml --port 4000
```

MockMind starts all implemented protocols by default. The `providers` section is metadata for documentation, model ownership, and Admin API output rather than a route enable/disable switch.

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
- OpenAI-compatible text, streaming, error, embeddings, and tool calls
- DeepSeek-style `reasoning_content`
- Anthropic Messages text, streaming, errors, and `tool_use`
- Gemini `generateContent`, streaming, errors, and `functionCall`
- DashScope text generation, SSE result events, usage, and provider-style errors
- YAML config loading, scenario matching, fallback, recorder, Admin API, and Provider Registry

## OpenAI-Compatible Examples

### Chat Completion

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

### Streaming With Usage

```bash
curl -N http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "stream": true,
    "messages": [{"role":"user","content":"hello"}]
  }'
```

The response is Server-Sent Events:

```txt
data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":"stop"}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":null}],"usage":{"prompt_tokens":0,"completion_tokens":0,"total_tokens":0}}

data: [DONE]
```

### Tool Calls

The default `mockmind.yaml` contains a weather tool-call scenario.

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"weather"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"]
          }
        }
      }
    ]
  }'
```

Expected response:

```json
{
  "id": "chatcmpl_mock_tool_0001",
  "object": "chat.completion",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_mock_0001",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"city\":\"Shanghai\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

### Streaming Tool Calls

```bash
curl -N http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "stream": true,
    "messages": [{"role":"user","content":"weather"}],
    "tools": [{"type":"function","function":{"name":"get_weather"}}]
  }'
```

The stream includes a `tool_calls` delta and ends with `finish_reason: "tool_calls"`.

### Error Mock

The default config contains a rate-limit scenario triggered by `trigger-rate-limit`.

```bash
curl -i http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"trigger-rate-limit"}]
  }'
```

Expected HTTP status: `429`.

```json
{
  "error": {
    "message": "mock rate limit exceeded",
    "type": "rate_limit_error",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

### Embeddings

```bash
curl http://127.0.0.1:4000/v1/embeddings \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "text-embedding-3-small",
    "input": "hello world"
  }'
```

## DeepSeek Reasoning Example

DeepSeek uses the OpenAI-compatible endpoint and is routed by model name.

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role":"user","content":"explain"}]
  }'
```

Expected response includes `reasoning_content`:

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "reasoning_content": "This is mock reasoning content.",
        "content": "This is the final DeepSeek mock answer."
      }
    }
  ]
}
```

## Anthropic Messages Examples

### Text Message

```bash
curl http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: test-key' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "max_tokens": 128,
    "messages": [{"role":"user","content":"hello"}]
  }'
```

Expected response:

```json
{
  "id": "msg_mock_0001",
  "type": "message",
  "role": "assistant",
  "model": "claude-3-5-sonnet-latest",
  "content": [{"type":"text","text":"Hello from mock Anthropic."}],
  "stop_reason": "end_turn"
}
```

### Tool Use

```bash
curl http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: test-key' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "max_tokens": 128,
    "messages": [{"role":"user","content":"weather"}],
    "tools": [{"name":"get_weather","input_schema":{"type":"object"}}]
  }'
```

Expected response:

```json
{
  "type": "message",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_mock_0001",
      "name": "get_weather",
      "input": {"city":"Shanghai"}
    }
  ],
  "stop_reason": "tool_use"
}
```

### Streaming

```bash
curl -N http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: test-key' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-3-5-sonnet-latest",
    "stream": true,
    "messages": [{"role":"user","content":"hello"}]
  }'
```

The stream emits Anthropic-style events such as `message_start`, `content_block_delta`, `message_delta`, and `message_stop`.

## Gemini Examples

### generateContent

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:generateContent \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [{"text":"hello"}]
      }
    ]
  }'
```

Expected response:

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [{"text":"Hello from mock Gemini."}]
      },
      "finishReason": "STOP",
      "index": 0
    }
  ]
}
```

### functionCall

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:generateContent \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [{"text":"weather"}]
      }
    ],
    "tools": [
      {
        "functionDeclarations": [
          {"name":"get_weather","parameters":{"type":"object"}}
        ]
      }
    ]
  }'
```

Expected response:

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "functionCall": {
              "name": "get_weather",
              "args": {"city":"Shanghai"}
            }
          }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

### streamGenerateContent

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:streamGenerateContent \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{"role":"user","parts":[{"text":"hello"}]}]
  }'
```

MockMind returns a JSON array of Gemini-style streamed chunks.

## DashScope / Alibaba Bailian Examples

### Text Generation

```bash
curl http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen-plus",
    "input": {
      "messages": [{"role":"user","content":"你好"}]
    },
    "parameters": {
      "result_format": "message"
    }
  }'
```

Expected response:

```json
{
  "request_id": "req_mock_dashscope_0001",
  "output": {
    "choices": [
      {
        "finish_reason": "stop",
        "message": {
          "role": "assistant",
          "content": "你好，我是模拟的 DashScope 原生响应。"
        }
      }
    ]
  }
}
```

### Streaming

```bash
curl -N http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen-plus",
    "stream": true,
    "input": {
      "messages": [{"role":"user","content":"你好"}]
    },
    "parameters": {
      "result_format": "message",
      "incremental_output": true
    }
  }'
```

MockMind emits SSE events:

```txt
event: result
data: {"request_id":"req_mock_dashscope_0001","output":{"choices":[{"finish_reason":null,"message":{"role":"assistant","content":"你好"}}]}}

event: result
data: {"request_id":"req_mock_dashscope_0001","output":{"choices":[{"finish_reason":"stop","message":{"role":"assistant","content":""}}]},"usage":{"input_tokens":0,"output_tokens":0,"total_tokens":0}}
```

### Error

Create a scenario with `response.type: error`, or use your own config to trigger a provider-style error:

```yaml
scenarios:
  - id: dashscope-throttling
    provider: aliyun-bailian
    endpoint: /api/v1/services/aigc/text-generation/generation
    match:
      messagesContain: trigger-error
    response:
      type: error
      status: 429
      code: Throttling
      message: mock throttling
```

Expected response:

```json
{
  "request_id": "req_mock_dashscope_error_0001",
  "code": "Throttling",
  "message": "mock throttling"
}
```

## Scenario Configuration Examples

### Tool Call Scenario

```yaml
scenarios:
  - id: openai-tool-weather
    provider: openai
    endpoint: /v1/chat/completions
    match:
      messagesContain: weather
      hasTools: true
    response:
      type: tool_call
      toolName: get_weather
      toolArguments:
        city: Shanghai
```

### Streaming Scenario

```yaml
scenarios:
  - id: openai-stream-demo
    provider: openai
    endpoint: /v1/chat/completions
    match:
      stream: true
    response:
      type: stream
      chunks:
        - Hello
        - ', '
        - streaming world!
      usage:
        promptTokens: 8
        completionTokens: 6
        totalTokens: 14
```

### Reasoning Stream Scenario

```yaml
scenarios:
  - id: deepseek-reasoning-stream
    provider: deepseek
    endpoint: /v1/chat/completions
    match:
      model: deepseek-reasoner
      stream: true
    response:
      type: stream
      reasoningChunks:
        - This is mock reasoning.
      chunks:
        - This is the final answer.
```

### Stream Error Scenario

```yaml
scenarios:
  - id: openai-stream-error
    provider: openai
    endpoint: /v1/chat/completions
    match:
      stream: true
      messagesContain: stream-error
    response:
      type: stream
      chunks:
        - partial output
      streamError:
        code: stream_error
        message: mock stream interrupted
```

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

Inspect recorded requests:

```bash
curl http://127.0.0.1:4000/__admin/requests
```

Reset recorded requests:

```bash
curl -X POST http://127.0.0.1:4000/__admin/reset
```

## SDK Example

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "test-key",
  baseURL: "http://127.0.0.1:4000/v1"
});

const result = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "hello" }]
});

console.log(result.choices[0]?.message.content);
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

## Safety Notes

- MockMind is intended for local development and CI.
- Admin APIs are not designed for public internet exposure.
- MockMind does not include real provider API keys.
- MockMind does not proxy real LLM requests by default.
- MockMind is pre-1.0; configuration fields and Admin APIs may evolve between minor versions.

## License

MIT
