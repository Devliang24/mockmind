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
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应：

```json
{
  "id": "chatcmpl_mock_0001",
  "object": "chat.completion",
  "model": "gpt-5.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello from OpenAI-compatible mock."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 6,
    "total_tokens": 14
  }
}
```

## Web UI

启动服务后访问：

```txt
http://127.0.0.1:4000/console
```

内置控制台左侧直接展示供应商菜单，并提供请求记录页面。供应商按国外优先、国内随后排序，可查看每家 Provider 的协议、端点、必填项、非流式/流式 cURL 示例、响应 Body 和官方文档。

## 持久化

默认配置使用 SQLite 持久化请求记录，服务重启后 `__admin/requests` 和 Web UI 的请求记录仍可查看。

```yaml
persistence:
  enabled: true
  driver: sqlite
  sqlite:
    path: .mockmind/mockmind.sqlite
```

请求记录会保存摘要、请求体、响应体和完整日志。调用 `POST /__admin/reset` 会同步清空内存和 SQLite 中的请求记录。

## Docker

```bash
docker build -t mockmind:local .
docker run --rm -p 4000:4000 \
  -v "$PWD/mockmind.yaml:/app/mockmind.yaml:ro" \
  -v mockmind-data:/app/.mockmind \
  mockmind:local
```

或者使用 Compose：

```bash
docker compose up --build
```

容器默认监听 `0.0.0.0:4000`，并固定读取容器内的 `/app/mockmind.yaml`。启动后可访问：

```txt
http://127.0.0.1:4000/health
http://127.0.0.1:4000/console
http://127.0.0.1:4000/__admin/requests
http://127.0.0.1:4000/v1
```

说明：

- Docker 镜像使用 `package-lock.json` 对应的依赖版本构建。
- Dockerfile 强绑定清华 Debian 源；构建阶段会安装 `python3`、`make`、`g++` 以支持 `better-sqlite3` 原生依赖，并将裁剪后的生产依赖复制到运行镜像。
- 运行阶段使用非 root 的 `node` 用户。
- `docker-compose.yml` 会把当前目录下的 `mockmind.yaml` 只读挂载到容器内，并用 `mockmind-data` volume 持久化 SQLite 数据。

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
- `POST /chat/completions`
- `POST /v1/embeddings`
- `POST /v1/responses`
- `POST /compatible-mode/v1/responses`
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
- `POST /api/paas/v4/chat/completions`
- `POST /api/coding/paas/v4/chat/completions`
- `POST /v1/text/chatcompletion_v2`
- `POST /v1/messages`
- `POST /v1beta/models/:model:generateContent`
- `POST /v1beta/models/:model:streamGenerateContent`
- `POST /api/v1/services/aigc/text-generation/generation`
- `POST /api/paas/v4/embeddings`
- `POST /compatible-mode/v1/embeddings`
- `POST /api/paas/v4/rerank`
- `POST /compatible-api/v1/reranks`
- `POST /api/v1/services/rerank/text-rerank/text-rerank`
- OpenAI 兼容的文本、流式、错误、嵌入向量、工具调用和 Responses API 响应
- DeepSeek 风格的 `reasoning_content`
- DeepSeek、Moonshot/Kimi、智谱、阿里百炼和 MiniMax 的官方 OpenAI 兼容路径
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
| DeepSeek Chat Completions | `/chat/completions` | [DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion) |
| Moonshot / Kimi OpenAI-compatible | `/v1/chat/completions` | [Kimi API Overview](https://platform.kimi.ai/docs/api/overview) |
| Zhipu GLM Chat Completions / Coding Plan / Embeddings / Rerank | `/api/paas/v4/chat/completions`, `/api/coding/paas/v4/chat/completions`, `/api/paas/v4/embeddings`, `/api/paas/v4/rerank` | [智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference), [智谱 Coding Plan 其他工具配置](https://docs.bigmodel.cn/cn/coding-plan/tool/others) |
| Alibaba Bailian OpenAI-compatible | `/compatible-mode/v1/chat/completions`, `/compatible-mode/v1/responses`, `/compatible-mode/v1/embeddings` | [Alibaba Model Studio OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions), [Alibaba Responses API](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-responses) |
| DashScope Text Generation / Rerank | `/api/v1/services/aigc/text-generation/generation`, `/compatible-api/v1/reranks`, `/api/v1/services/rerank/text-rerank/text-rerank` | [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope), [DashScope Rerank API](https://help.aliyun.com/zh/model-studio/text-rerank-api) |
| Anthropic Messages | `/v1/messages` | [Anthropic Messages examples](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) |
| Gemini generateContent | `/v1beta/models/:model:generateContent` | [Gemini API Reference](https://ai.google.dev/api) |
| MiniMax ChatCompletion v2 | `/v1/text/chatcompletion_v2` | [MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post) |

这些链接用于对照真实 Provider 的请求、响应、流式事件和错误结构；MockMind 的实现目标是协议级模拟，不会调用真实 Provider。

## 最新模型快照

Web UI 和 Provider Registry 默认展示每家供应商最多 4 个可用于当前协议示例的官方模型：

| Provider | 模型 |
|---|---|
| OpenAI | `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano` |
| Anthropic | `claude-opus-4-1-20250805`, `claude-sonnet-4-5-20250929`, `claude-haiku-4-5-20251001` |
| Gemini | `gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| DeepSeek | `deepseek-v4-pro`, `deepseek-v4-flash` |
| Moonshot / Kimi | `kimi-k2.6`, `kimi-k2.5`, `kimi-k2-thinking`, `kimi-k2-thinking-turbo` |
| Zhipu GLM | `glm-5.1`, `glm-5`, `glm-5-turbo`, `glm-4.7` |
| Alibaba Bailian / DashScope | `qwen3.6-max-preview`, `qwen3.6-plus`, `qwen3.6-flash`, `qwen3.5-plus` |
| Alibaba Bailian / DashScope Rerank | `qwen3-rerank`, `gte-rerank-v2`, `qwen3-vl-rerank` |
| MiniMax | `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5`, `MiniMax-M2.5-highspeed` |

模型名称只使用官方文档已公开的模型 ID；不再保留非官方占位版本。

## 协议校验

MockMind 会在进入场景匹配前执行轻量协议校验：

- `auth.mode: strict` 时会按各家官网鉴权方式校验 API Key；`permissive` 和 `disabled` 不阻断本地调试请求。
- OpenAI Chat：要求 `model` 和 `messages`。
- OpenAI Embeddings：要求 `model` 和 `input`。
- OpenAI Responses：要求 `model` 和 `input`。
- Anthropic Messages：要求 `anthropic-version` Header、`model`、`max_tokens` 和 `messages`。
- Gemini：要求 `contents`。
- DashScope：要求 `model` 和 `input.messages`。
- MiniMax：要求 `model` 和 `messages`。

校验失败会返回对应 Provider 风格的错误结构，例如 OpenAI `error`、Anthropic `type:error`、DashScope `code/message`、MiniMax `base_resp`。

### 鉴权方式

MockMind 的严格鉴权只接受各家官网公开的 API Key 传递方式：

| Provider | 官方鉴权方式 | MockMind strict 行为 |
|---|---|---|
| OpenAI | `Authorization: Bearer 123456` | 只接受 Bearer |
| DeepSeek | `Authorization: Bearer 123456` | 只接受 Bearer |
| Moonshot / Kimi | `Authorization: Bearer 123456` | 只接受 Bearer |
| Zhipu GLM / Coding Plan | `Authorization: Bearer 123456` | 只接受 Bearer |
| Alibaba Bailian / DashScope | `Authorization: Bearer 123456` | 只接受 Bearer |
| MiniMax | `Authorization: Bearer 123456` | 只接受 Bearer |
| Anthropic | `x-api-key: 123456`，并按 Messages API 要求携带 `anthropic-version` | 只接受 `x-api-key` |
| Gemini | `x-goog-api-key: 123456`，REST API 同时支持 `?key=123456` | 接受 `x-goog-api-key` 或 `?key=` |

## Token 用量

场景响应可以显式配置 `usage.promptTokens`、`usage.completionTokens` 和 `usage.totalTokens`。未配置时，MockMind 会按请求消息、输入文本、工具参数和输出内容做确定性的本地估算，并映射到各家官方字段：OpenAI Chat 使用 `prompt_tokens/completion_tokens/total_tokens`，OpenAI Responses 使用 `input_tokens/output_tokens/total_tokens`，Anthropic 使用 `input_tokens/output_tokens`，Gemini 使用 `usageMetadata`，DashScope 使用 `input_tokens/output_tokens/total_tokens`，MiniMax 使用 `prompt_tokens/completion_tokens/total_tokens`。

## OpenAI 兼容示例

官方文档：[OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create)。


### Responses API

```bash
curl http://127.0.0.1:4000/v1/responses \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "input": "hello"
  }'
```

### 图片生成

```bash
curl http://127.0.0.1:4000/v1/images/generations \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-image-1",
    "prompt": "a cat"
  }'
```

### 语音合成

```bash
curl http://127.0.0.1:4000/v1/audio/speech \
  -H 'Authorization: Bearer 123456' \
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
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "omni-moderation-latest",
    "input": "hello"
  }'
```

### Files / Batch

```bash
curl http://127.0.0.1:4000/v1/files \
  -H 'Authorization: Bearer 123456'

curl http://127.0.0.1:4000/v1/batches \
  -H 'Authorization: Bearer 123456' \
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
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

### 带用量信息的流式响应

```bash
curl -N http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "stream": true,
    "stream_options": {"include_usage": true},
    "messages": [{"role":"user","content":"hello"}]
  }'
```

响应为 Server-Sent Events：

```txt
data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":"stop"}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","choices":[],"usage":{"prompt_tokens":8,"completion_tokens":7,"total_tokens":15}}

data: [DONE]
```

### 工具调用

默认的 `mockmind.yaml` 包含一个天气工具调用场景。

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
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
  "model": "gpt-5.5",
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
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "stream": true,
    "stream_options": {"include_usage": true},
    "messages": [{"role":"user","content":"weather"}],
    "tools": [{"type":"function","function":{"name":"get_weather"}}]
  }'
```

流式响应会包含 `tool_calls` 增量，并以 `finish_reason: "tool_calls"` 结束。

### 错误模拟

默认配置包含一个由 `trigger-rate-limit` 触发的限流场景。

```bash
curl -i http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
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
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "text-embedding-3-small",
    "input": "hello world"
  }'
```

## DeepSeek 推理示例

官方文档：[DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion)。


DeepSeek 使用官方 OpenAI 兼容端点。

```bash
curl http://127.0.0.1:4000/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "deepseek-v4-pro",
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

## Moonshot / Kimi 示例

官方文档：[Kimi API Overview](https://platform.kimi.ai/docs/api/overview)。


```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "kimi-k2.6",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应包含：

```json
{
  "model": "kimi-k2.6",
  "choices": [{"message":{"content":"Hello from mock Moonshot / Kimi."}}]
}
```

## 智谱 GLM 示例

官方文档：[智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference)。

```bash
curl http://127.0.0.1:4000/api/paas/v4/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "glm-5.1",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应包含：

```json
{
  "model": "glm-5.1",
  "choices": [{"message":{"content":"Hello from mock Zhipu GLM."}}]
}
```

### Coding Plan 端点

官方文档：[智谱 Coding Plan 其他工具配置](https://docs.bigmodel.cn/cn/coding-plan/tool/others)。

真实 Base URL 为 `https://open.bigmodel.cn/api/coding/paas/v4`；MockMind 本地 Base URL 对应为 `http://127.0.0.1:4000/api/coding/paas/v4`。

```bash
curl http://127.0.0.1:4000/api/coding/paas/v4/chat/completions \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "GLM-5.1",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应包含：

```json
{
  "model": "GLM-5.1",
  "choices": [{"message":{"content":"Hello from mock Zhipu GLM Coding Plan."}}]
}
```

## Anthropic Messages 示例

官方文档：[Anthropic Messages examples](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)。


### 文本消息

```bash
curl http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: 123456' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
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
  "model": "claude-sonnet-4-5-20250929",
  "content": [{"type":"text","text":"Hello from mock Anthropic."}],
  "stop_reason": "end_turn"
}
```

### 工具使用

```bash
curl http://127.0.0.1:4000/v1/messages \
  -H 'x-api-key: 123456' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
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
  -H 'x-api-key: 123456' \
  -H 'anthropic-version: 2023-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "stream": true,
    "messages": [{"role":"user","content":"hello"}]
  }'
```

流式响应会发送 Anthropic 风格的事件，例如 `message_start`、`content_block_delta`、`message_delta` 和 `message_stop`。

## Gemini 示例

官方文档：[Gemini API Reference](https://ai.google.dev/api)。


### generateContent 示例

```bash
curl http://127.0.0.1:4000/v1beta/models/gemini-3-flash-preview:generateContent \
  -H 'x-goog-api-key: 123456' \
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
curl http://127.0.0.1:4000/v1beta/models/gemini-3-flash-preview:generateContent \
  -H 'x-goog-api-key: 123456' \
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
curl -N 'http://127.0.0.1:4000/v1beta/models/gemini-3-flash-preview:streamGenerateContent?alt=sse' \
  -H 'x-goog-api-key: 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{"role":"user","parts":[{"text":"hello"}]}]
  }'
```

MockMind 会返回 Gemini REST 流式接口使用的 SSE 响应：

```txt
data: {"candidates":[{"content":{"role":"model","parts":[{"text":"Hello"}]},"index":0,"safetyRatings":[]}]}

data: {"candidates":[{"content":{"role":"model","parts":[{"text":" from Gemini /v1beta/models/:model:streamGenerateContent."}]},"finishReason":"STOP","index":0,"safetyRatings":[]}],"usageMetadata":{"promptTokenCount":8,"candidatesTokenCount":7,"totalTokenCount":15}}
```

## MiniMax 示例

官方文档：[MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post)。


```bash
curl http://127.0.0.1:4000/v1/text/chatcompletion_v2 \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "MiniMax-M2.7",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期响应：

```json
{
  "id": "minimax-mock-0001",
  "object": "chat.completion",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "name": "MiniMax AI",
        "audio_content": "",
        "reasoning_content": "",
        "content": "你好，我是模拟的 MiniMax 响应。"
      }
    }
  ],
  "model": "MiniMax-M2.7",
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 7,
    "total_characters": 0,
    "completion_tokens_details": {
      "reasoning_tokens": 0
    },
    "total_tokens": 15
  },
  "input_sensitive": false,
  "output_sensitive": false,
  "input_sensitive_type": 0,
  "output_sensitive_type": 0,
  "output_sensitive_int": 0,
  "base_resp": {
    "status_code": 0,
    "status_msg": ""
  }
}
```

MiniMax 也支持 `"stream": true` 的 SSE 流式响应，并通过 `base_resp` 返回提供商风格错误。

## DashScope / 阿里云百炼示例

官方文档：

- [Alibaba Model Studio OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions)
- [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope)
- [DashScope Rerank API](https://help.aliyun.com/zh/model-studio/text-rerank-api)


### 文本生成

```bash
curl http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen3.6-plus",
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
  },
  "usage": {
    "input_tokens": 8,
    "output_tokens": 7,
    "total_tokens": 15
  },
  "status_code": 200,
  "code": "",
  "message": ""
}
```

### 流式响应

```bash
curl -N http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen3.6-plus",
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

### Rerank 兼容接口

```bash
curl http://127.0.0.1:4000/compatible-api/v1/reranks \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen3-rerank",
    "query": "hello",
    "documents": ["hello world", "other"],
    "top_n": 2,
    "return_documents": true
  }'
```

预期响应：

```json
{
  "request_id": "req_mock_rerank_0001",
  "output": {
    "results": [
      {
        "index": 0,
        "relevance_score": 1,
        "document": {"text": "hello world"}
      }
    ]
  },
  "usage": {"total_tokens": 2}
}
```

### Rerank 原生接口

```bash
curl http://127.0.0.1:4000/api/v1/services/rerank/text-rerank/text-rerank \
  -H 'Authorization: Bearer 123456' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gte-rerank-v2",
    "input": {
      "query": "hello",
      "documents": ["hello world", "other"]
    },
    "parameters": {
      "top_n": 2,
      "return_documents": true
    }
  }'
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
    endpoint: /chat/completions
    match:
      model: deepseek-v4-pro
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
      model: qwen3.6-plus
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
- `docs/web-ui.md`

## 许可证

MIT
