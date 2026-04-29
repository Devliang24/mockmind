# Providers

MockMind starts all implemented providers by default.

## Implemented Providers

| Provider | Protocols | Routes | Official API docs |
|---|---|---|---|
| OpenAI Compatible | `openai-compatible`, `openai-embeddings`, `openai-responses`, `openai-images`, `openai-audio`, `openai-moderations`, `openai-files`, `openai-batch` | `/v1/models`, `/v1/chat/completions`, `/v1/embeddings`, `/v1/responses`, `/v1/images/generations`, `/v1/audio/*`, `/v1/moderations`, `/v1/files`, `/v1/batches` | [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) |
| DeepSeek | `openai-compatible` | `/chat/completions` | [DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion) |
| Moonshot / Kimi | `openai-compatible` | `/v1/chat/completions` | [Kimi API Overview](https://platform.kimi.ai/docs/api/overview) |
| Zhipu GLM | `openai-compatible`, `openai-embeddings`, `rerank` | `/api/paas/v4/chat/completions`, `/api/coding/paas/v4/chat/completions`, `/api/paas/v4/embeddings`, `/api/paas/v4/rerank` | [智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference), [智谱 Coding Plan 其他工具配置](https://docs.bigmodel.cn/cn/coding-plan/tool/others) |
| Alibaba Bailian / DashScope | `openai-compatible`, `openai-responses`, `openai-embeddings`, `dashscope-generation`, `rerank` | `/compatible-mode/v1/chat/completions`, `/compatible-mode/v1/responses`, `/compatible-mode/v1/embeddings`, `/api/v1/services/aigc/text-generation/generation`, `/compatible-api/v1/reranks`, `/api/v1/services/rerank/text-rerank/text-rerank` | [OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions), [OpenAI Responses API](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-responses), [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope), [DashScope Rerank API](https://help.aliyun.com/zh/model-studio/text-rerank-api) |
| Anthropic | `anthropic-messages` | `/v1/messages` | [Anthropic Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) |
| Gemini | `gemini-generate-content` | `/v1beta/models/:model:generateContent`, `/v1beta/models/:model:streamGenerateContent` | [Gemini API Reference](https://ai.google.dev/api) |
| MiniMax | `minimax-chat`, `openai-compatible` | `/v1/text/chatcompletion_v2`, `/v1/chat/completions` via `MiniMax-*` | [MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post) |

## Latest Model Snapshot

| Provider | Models shown by default |
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

## Not Planned

Volcengine Ark / Doubao is not currently planned for implementation.
