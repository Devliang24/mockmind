# Mock API

MockMind implements provider-shaped mock routes for local development and tests. It does not call real providers and does not attempt to reproduce full provider-owned OpenAPI specifications. Use the official documentation links for complete upstream behavior.

## Common Behavior

- Auth is controlled by `auth.mode`. In `strict` mode, MockMind accepts the provider's documented API key style. In `permissive` and `disabled` modes, auth does not block requests.
- Request matching uses configured scenarios first, then fallback behavior when enabled.
- Requests are recorded through the existing memory recorder by default, or SQLite when configured.
- Streaming support is endpoint-specific and returns provider-shaped `text/event-stream` data where implemented.

## Supported Provider Routes

| Provider | Protocol | Routes | Auth headers | Required fields | Streaming | Official docs | MockMind notes |
|---|---|---|---|---|---|---|---|
| OpenAI | Chat Completions | `POST /v1/chat/completions` | `Authorization` | `model`, `messages` | `stream: true` returns OpenAI-compatible SSE chunks | [Chat Completions](https://platform.openai.com/docs/api-reference/chat/create) | Also used by OpenAI-compatible providers when their route maps to this protocol. |
| OpenAI | Models | `GET /v1/models` | `Authorization` | none | No | [Models](https://platform.openai.com/docs/api-reference/models) | Returns configured and preset model metadata. |
| OpenAI | Embeddings | `POST /v1/embeddings` | `Authorization` | `model`, `input` | No | [Embeddings](https://platform.openai.com/docs/api-reference/embeddings/create) | Produces deterministic mock vectors. |
| OpenAI | Responses | `POST /v1/responses` | `Authorization` | `model`, `input` | `stream: true` returns Responses-style SSE events | [Responses](https://platform.openai.com/docs/api-reference/responses/create) | Supports text, reasoning, and tool-call shaped mock output. |
| OpenAI | Images | `POST /v1/images/generations` | `Authorization` | `model`, `prompt` | No | [Images](https://platform.openai.com/docs/api-reference/images/create) | Returns mock image URL/base64-shaped data. |
| OpenAI | Audio | `POST /v1/audio/speech`, `POST /v1/audio/transcriptions`, `POST /v1/audio/translations` | `Authorization` | endpoint-specific body fields | No | [Audio](https://platform.openai.com/docs/api-reference/audio) | Returns mock audio/transcription payloads without media processing. |
| OpenAI | Moderations | `POST /v1/moderations` | `Authorization` | `model`, `input` | No | [Moderations](https://platform.openai.com/docs/api-reference/moderations/create) | Returns provider-shaped safe mock results. |
| OpenAI | Files | `GET /v1/files`, `POST /v1/files`, `GET /v1/files/:fileId`, `DELETE /v1/files/:fileId` | `Authorization` | endpoint-specific | No | [Files](https://platform.openai.com/docs/api-reference/files) | Metadata-only mock behavior. |
| OpenAI | Batch | `POST /v1/batches`, `GET /v1/batches/:batchId`, `POST /v1/batches/:batchId/cancel` | `Authorization` | endpoint-specific | No | [Batch](https://platform.openai.com/docs/api-reference/batch) | Returns mock batch lifecycle payloads. |
| DeepSeek | OpenAI-compatible Chat | `POST /chat/completions` | `Authorization` | `model`, `messages` | `stream: true` returns OpenAI-compatible SSE chunks | [DeepSeek Chat](https://api-docs.deepseek.com/api/create-chat-completion) | Supports DeepSeek-style `reasoning_content`. |
| Moonshot / Kimi | OpenAI-compatible Chat | `POST /v1/chat/completions` | `Authorization` | `model`, `messages` | `stream: true` returns OpenAI-compatible SSE chunks | [Kimi API](https://platform.kimi.ai/docs/api/overview) | Shares OpenAI-compatible protocol handling. |
| Zhipu GLM | Chat Completions | `POST /api/paas/v4/chat/completions`, `POST /api/coding/paas/v4/chat/completions` | `Authorization` | `model`, `messages` | `stream: true` returns OpenAI-compatible SSE chunks | [Zhipu API](https://docs.bigmodel.cn/api-reference), [Coding Plan](https://docs.bigmodel.cn/cn/coding-plan/tool/others) | Includes Coding Plan-compatible route for local tool configuration. |
| Zhipu GLM | Embeddings | `POST /api/paas/v4/embeddings` | `Authorization` | `model`, `input` | No | [Zhipu API](https://docs.bigmodel.cn/api-reference) | Uses OpenAI embeddings-compatible validation and mock vectors. |
| Zhipu GLM | Rerank | `POST /api/paas/v4/rerank` | `Authorization` | `model`, `query`, `documents` | No | [Zhipu API](https://docs.bigmodel.cn/api-reference) | Returns rerank scores and optional document payloads. |
| Alibaba Bailian | OpenAI-compatible Chat | `POST /compatible-mode/v1/chat/completions` | `Authorization` | `model`, `messages` | `stream: true` returns OpenAI-compatible SSE chunks | [Qwen OpenAI Chat](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions) | Shares OpenAI-compatible protocol handling. |
| Alibaba Bailian | OpenAI-compatible Responses | `POST /compatible-mode/v1/responses` | `Authorization` | `model`, `input` | `stream: true` returns Responses-style SSE events | [Qwen Responses](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-responses) | Mirrors MockMind Responses behavior through Bailian path. |
| Alibaba Bailian | OpenAI-compatible Embeddings | `POST /compatible-mode/v1/embeddings` | `Authorization` | `model`, `input` | No | [Qwen Embeddings](https://help.aliyun.com/zh/model-studio/text-embedding-api) | Produces deterministic mock vectors. |
| DashScope | Text Generation | `POST /api/v1/services/aigc/text-generation/generation` | `Authorization` | `model`, `input.messages` | `parameters.result_format` and stream request options select SSE behavior | [DashScope API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope) | Returns DashScope-style output, usage, and error payloads. |
| DashScope | Rerank | `POST /compatible-api/v1/reranks`, `POST /api/v1/services/rerank/text-rerank/text-rerank` | `Authorization` | `model`, `query`, `documents` | No | [DashScope Rerank](https://help.aliyun.com/zh/model-studio/text-rerank-api) | Supports OpenAI-compatible and native DashScope paths. |
| Anthropic | Messages | `POST /v1/messages` | `x-api-key`, `anthropic-version` | `model`, `max_tokens`, `messages` | `stream: true` returns Anthropic event stream | [Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) | Supports text, error, and `tool_use` shaped responses. |
| Gemini | Generate Content | `POST /v1beta/models/:model:generateContent` | `x-goog-api-key` or `key` query | `contents` | No | [Gemini API](https://ai.google.dev/api) | Route model segment is normalized into request metadata. |
| Gemini | Stream Generate Content | `POST /v1beta/models/:model:streamGenerateContent` | `x-goog-api-key` or `key` query | `contents` | Endpoint-selected SSE response | [Gemini API](https://ai.google.dev/api) | Streaming is selected by route rather than body `stream`. |
| MiniMax | ChatCompletion v2 | `POST /v1/text/chatcompletion_v2` | `Authorization` | `model`, `messages` | Endpoint-selected streaming where MiniMax protocol indicates stream behavior | [MiniMax Text Generation](https://platform.minimax.io/docs/api-reference/text-post) | Returns MiniMax `base_resp` error and chat completion shapes. |

## Route Alignment

When provider routes are added, removed, or renamed in the provider registry, update this document in the same change. Admin API route metadata is available from `GET /__admin/routes` for quick comparison with the implemented registry.
