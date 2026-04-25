# MockMind

MockMind 是一个使用 TypeScript 编写的模拟服务，用于兼容 OpenAI 以及主流 LLM 提供商 API。它适合本地开发、CI 测试、SDK 兼容性验证，以及 Agent/RAG 工作流调试。

MockMind 不执行真实 LLM 推理，默认也不会代理真实提供商 API。它会根据 YAML 场景返回符合对应协议结构的模拟响应。

## 快速开始

```bash
npm install
npm run dev -- start --config mockmind.yaml --port 4000
```

调用 OpenAI 兼容端点：

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应：

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

## Docker

```bash
docker build -t mockmind:local .
docker run --rm -p 4000:4000 -v "$PWD/mockmind.yaml:/app/mockmind.yaml:ro" mockmind:local
```

或者使用 Compose：

```bash
docker compose up --build
```

## 命令行

```bash
npm run dev -- init
npm run dev -- validate --config mockmind.yaml
npm run dev -- start --config mockmind.yaml --port 4000
```

MockMind 默认启动所有已实现的协议。`providers` 配置节仅作为文档、模型归属和 Admin API 输出的元数据，而不是路由启用/禁用开关。

## 已实现能力

- `GET /health`
- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/embeddings`
- `POST /v1/responses`
- `POST /v1/images/generations`
- `POST /v1/audio/speech`
- `POST /v1/audio/transcriptions`
- `POST /v1/audio/translations`
- `POST /v1/moderations`
- `GET|POST /v1/files`
- `GET|DELETE /v1/files/:fileId`
- `POST /v1/batches`
- `GET /v1/batches/:batchId`
- `POST /v1/batches/:batchId/cancel`
- `POST /compatible-mode/v1/chat/completions`
- `POST /deepseek/v1/chat/completions`
- `POST /moonshot/v1/chat/completions`
- `POST /zhipu/v1/chat/completions`
- `POST /api/paas/v4/chat/completions`
- `POST /v1/text/chatcompletion_v2`
- `POST /minimax/v1/text/chatcompletion_v2`
- `POST /v1/messages`
- `POST /anthropic/v1/messages`
- `POST /v1beta/models/:model:generateContent`
- `POST /v1beta/models/:model:streamGenerateContent`
- `POST /gemini/v1beta/models/:model:generateContent`
- `POST /gemini/v1beta/models/:model:streamGenerateContent`
- `POST /api/v1/services/aigc/text-generation/generation`
- `POST /dashscope/api/v1/services/aigc/text-generation/generation`
- `POST /deepseek/v1/embeddings`
- `POST /moonshot/v1/embeddings`
- `POST /api/paas/v4/embeddings`
- `POST /compatible-mode/v1/embeddings`
- `POST /api/paas/v4/rerank`
- `POST /api/v1/services/rerank/text-rerank/text-rerank`
- OpenAI 兼容的文本、流式、错误、嵌入向量、工具调用和 Responses API 响应
- DeepSeek 风格的 `reasoning_content`
- DeepSeek、Moonshot/Kimi 和智谱的 OpenAI 兼容命名空间路由
- MiniMax 原生聊天补全
- Anthropic Messages 的文本、流式、错误和 `tool_use` 响应
- Gemini `generateContent`、流式、错误和 `functionCall` 响应
- DashScope 文本生成、SSE 结果事件、用量信息和提供商风格错误
- OpenAI Images、Audio、Moderations、Files、Batch 的 cURL 可调用 Mock 响应
- 智谱和 DashScope 风格 Rerank Mock 响应
- 各协议基础必填字段、关键 Header 和提供商风格错误校验
- YAML 配置加载、场景匹配、兜底响应、请求记录器、Admin API 和提供商注册表


## 官方 API 文档对照

| Provider / 协议 | MockMind 覆盖路径 | 官方 API 文档 |
|---|---|---|
| OpenAI Chat Completions | `/v1/chat/completions` | [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) |
| OpenAI Responses | `/v1/responses` | [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses/create) |
| OpenAI Images / Audio / Moderations / Files / Batch | `/v1/images/generations`, `/v1/audio/*`, `/v1/moderations`, `/v1/files`, `/v1/batches` | [OpenAI API Reference](https://platform.openai.com/docs/api-reference) |
| DeepSeek Chat Completions / Embeddings | `/v1/chat/completions`, `/deepseek/v1/chat/completions`, `/deepseek/v1/embeddings` | [DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion) |
| Moonshot / Kimi OpenAI-compatible | `/v1/chat/completions`, `/moonshot/v1/chat/completions`, `/moonshot/v1/embeddings` | [Kimi API Overview](https://platform.kimi.ai/docs/api/overview) |
| Zhipu GLM Chat Completions / Embeddings / Rerank | `/v1/chat/completions`, `/api/paas/v4/chat/completions`, `/api/paas/v4/embeddings`, `/api/paas/v4/rerank` | [智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference) |
| Alibaba Bailian OpenAI-compatible | `/compatible-mode/v1/chat/completions`, `/compatible-mode/v1/embeddings` | [Alibaba Model Studio OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions) |
| DashScope Text Generation / Rerank | `/api/v1/services/aigc/text-generation/generation`, `/api/v1/services/rerank/text-rerank/text-rerank` | [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope) |
| Anthropic Messages | `/v1/messages`, `/anthropic/v1/messages` | [Anthropic Messages examples](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) |
| Gemini generateContent | `/v1beta/models/:model:generateContent` | [Gemini API Reference](https://ai.google.dev/api) |
| MiniMax ChatCompletion v2 | `/v1/text/chatcompletion_v2` | [MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post) |

这些链接用于对照真实 Provider 的请求、响应、流式事件和错误结构；MockMind 的实现目标是协议级模拟，不会调用真实 Provider。

## 协议校验

MockMind 会在进入场景匹配前执行轻量协议校验：

- OpenAI Chat：要求 `model` 和 `messages`。
- OpenAI Embeddings：要求 `model` 和 `input`。
- OpenAI Responses：要求 `model` 和 `input`。
- Anthropic Messages：要求 `anthropic-version` Header、`model`、`max_tokens` 和 `messages`。
- Gemini：要求 `contents`。
- DashScope：要求 `model` 和 `input.messages`。
- MiniMax：要求 `model` 和 `messages`。

校验失败会返回对应 Provider 风格的错误结构，例如 OpenAI `error`、Anthropic `type:error`、DashScope `code/message`、MiniMax `base_resp`。

## OpenAI 兼容示例

官方文档：[OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create)。


### Responses API

```bash
curl http://127.0.0.1:4000/v1/responses \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "input": "hello"
  }'
```

### 图片生成

```bash
curl http://127.0.0.1:4000/v1/images/generations \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-image-1",
    "prompt": "a cat"
  }'
```

### 语音合成

```bash
curl http://127.0.0.1:4000/v1/audio/speech \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": "alloy",
    "input": "hello"
  }' --output mockmind.mp3
```

### 内容安全审核

```bash
curl http://127.0.0.1:4000/v1/moderations \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "omni-moderation-latest",
    "input": "hello"
  }'
```

### Files / Batch

```bash
curl http://127.0.0.1:4000/v1/files \
  -H 'Authorization: Bearer test-key'

curl http://127.0.0.1:4000/v1/batches \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "input_file_id": "file-mock-0001",
    "endpoint": "/v1/chat/completions",
    "completion_window": "24h"
  }'
```

### 聊天补全

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

### 带用量信息的流式响应

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

响应为 Server-Sent Events：

```txt
data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":"stop"}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":null}],"usage":{"prompt_tokens":0,"completion_tokens":0,"total_tokens":0}}

data: [DONE]
```

### 工具调用

默认的 `mockmind.yaml` 包含一个天气工具调用场景。

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

预期响应：

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

### 流式工具调用

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

流式响应会包含 `tool_calls` 增量，并以 `finish_reason: "tool_calls"` 结束。

### 错误模拟

默认配置包含一个由 `trigger-rate-limit` 触发的限流场景。

```bash
curl -i http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user","content":"trigger-rate-limit"}]
  }'
```

预期 HTTP 状态码：`429`。

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

### 嵌入向量

```bash
curl http://127.0.0.1:4000/v1/embeddings \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "text-embedding-3-small",
    "input": "hello world"
  }'
```

## DeepSeek 推理示例

官方文档：[DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion)。


DeepSeek 使用 OpenAI 兼容端点，并根据模型名称进行路由。

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role":"user","content":"explain"}]
  }'
```

预期响应包含 `reasoning_content`：

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

DeepSeek 也提供命名空间端点：

```bash
curl http://127.0.0.1:4000/deepseek/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role":"user","content":"explain"}]
  }'
```

## Moonshot / Kimi 示例

官方文档：[Kimi API Overview](https://platform.kimi.ai/docs/api/overview)。


```bash
curl http://127.0.0.1:4000/moonshot/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应包含：

```json
{
  "model": "moonshot-v1-8k",
  "choices": [{"message":{"content":"Hello from mock Moonshot / Kimi."}}]
}
```

## 智谱 GLM 示例

官方文档：[智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference)。

```bash
curl http://127.0.0.1:4000/api/paas/v4/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "glm-4",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应包含：

```json
{
  "model": "glm-4",
  "choices": [{"message":{"content":"Hello from mock Zhipu GLM."}}]
}
```

## Anthropic Messages 示例

官方文档：[Anthropic Messages examples](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)。


### 文本消息

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

预期响应：

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

### 工具使用

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

预期响应：

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

### 流式响应

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

流式响应会发送 Anthropic 风格的事件，例如 `message_start`、`content_block_delta`、`message_delta` 和 `message_stop`。

## Gemini 示例

官方文档：[Gemini API Reference](https://ai.google.dev/api)。


### generateContent 示例

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

预期响应：

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

### functionCall 示例

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

预期响应：

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

### streamGenerateContent 示例

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:streamGenerateContent \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{"role":"user","parts":[{"text":"hello"}]}]
  }'
```

MockMind 会返回由 Gemini 风格流式分块组成的 JSON 数组。


## MiniMax 示例

官方文档：[MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post)。


```bash
curl http://127.0.0.1:4000/v1/text/chatcompletion_v2 \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "abab6.5s-chat",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应：

```json
{
  "id": "minimax-mock-0001",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好，我是模拟的 MiniMax 响应。"
      }
    }
  ],
  "model": "abab6.5s-chat",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

MiniMax 也支持 `"stream": true` 的 SSE 流式响应，并通过 `base_resp` 返回提供商风格错误。

## DashScope / 阿里云百炼示例

官方文档：

- [Alibaba Model Studio OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions)
- [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope)


### 文本生成

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

预期响应：

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

### 流式响应

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

MockMind 会发送 SSE 事件：

```txt
event: result
data: {"request_id":"req_mock_dashscope_0001","output":{"choices":[{"finish_reason":null,"message":{"role":"assistant","content":"你好"}}]}}

event: result
data: {"request_id":"req_mock_dashscope_0001","output":{"choices":[{"finish_reason":"stop","message":{"role":"assistant","content":""}}]},"usage":{"input_tokens":0,"output_tokens":0,"total_tokens":0}}
```

### 错误

可以创建 `response.type: error` 场景，或使用自定义配置触发提供商风格错误：

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

预期响应：

```json
{
  "request_id": "req_mock_dashscope_error_0001",
  "code": "Throttling",
  "message": "mock throttling"
}
```

## 场景配置示例

### 工具调用场景

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

### 流式场景

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

### 推理流式场景

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

### 流式错误场景

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

### 高级匹配场景

可使用 `lastUserMessageContains`、`messageRole`、`bodyPath` 和 `query`，相比原始 JSON 子串匹配实现更精确的匹配。

```yaml
scenarios:
  - id: dashscope-message-format
    provider: aliyun-bailian
    endpoint: /api/v1/services/aigc/text-generation/generation
    match:
      model: qwen-plus
      messageRole: user
      lastUserMessageContains: 你好
      bodyPath:
        parameters.result_format: message
      query:
        debug: 'true'
    response:
      type: text
      content: Matched by body path and query.
```

支持的匹配字段：

- `model`：精确匹配模型。
- `stream`：精确匹配布尔类型的流式开关。
- `messagesContain`：对序列化后的消息进行子串匹配。
- `lastUserMessageContains`：对最后一条用户消息进行子串匹配。
- `messageRole`：要求至少存在一条指定角色的消息。
- `hasTools`：要求工具存在或不存在。
- `body`：浅层顶级请求体匹配。
- `bodyPath`：点路径形式的嵌套请求体匹配，例如 `parameters.result_format`。
- `headers`：精确匹配小写请求头。
- `query`：精确匹配查询参数。

## 管理 API

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

查看已记录的请求：

```bash
curl http://127.0.0.1:4000/__admin/requests
```

重置已记录的请求：

```bash
curl -X POST http://127.0.0.1:4000/__admin/reset
```


## 安全说明

- MockMind 适用于本地开发和 CI。
- Admin API 不适合暴露到公网。
- MockMind 不包含真实提供商 API Key。
- MockMind 默认不会代理真实 LLM 请求。
- MockMind 仍处于 1.0 之前版本；配置字段和 Admin API 可能会在小版本之间演进。

## 更多文档

- `docs/architecture.md`
- `docs/providers.md`
- `docs/protocols.md`
- `docs/adding-provider.md`
- `docs/npm-publishing.md`

## 许可证

MIT
