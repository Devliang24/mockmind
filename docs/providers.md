# Providers

MockMind starts all implemented providers by default.

## Implemented Providers

| Provider | Protocols | Routes | Official API docs |
|---|---|---|---|
| OpenAI Compatible | `openai-compatible`, `openai-embeddings`, `openai-responses`, `openai-images`, `openai-audio`, `openai-moderations`, `openai-files`, `openai-batch` | `/v1/models`, `/v1/chat/completions`, `/v1/embeddings`, `/v1/responses`, `/v1/images/generations`, `/v1/audio/*`, `/v1/moderations`, `/v1/files`, `/v1/batches` | [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) |
| DeepSeek | `openai-compatible`, `openai-embeddings` | `/v1/chat/completions`, `/deepseek/v1/chat/completions`, `/deepseek/v1/embeddings` | [DeepSeek Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion) |
| Moonshot / Kimi | `openai-compatible`, `openai-embeddings` | `/v1/chat/completions`, `/moonshot/v1/chat/completions`, `/moonshot/v1/embeddings` | [Kimi API Overview](https://platform.kimi.ai/docs/api/overview) |
| Zhipu GLM | `openai-compatible`, `openai-embeddings`, `rerank` | `/v1/chat/completions`, `/zhipu/v1/chat/completions`, `/api/paas/v4/chat/completions`, `/api/paas/v4/embeddings`, `/api/paas/v4/rerank` | [智谱 AI 对话补全](https://docs.bigmodel.cn/api-reference) |
| Alibaba Bailian / DashScope | `openai-compatible`, `openai-embeddings`, `dashscope-generation`, `rerank` | `/compatible-mode/v1/chat/completions`, `/compatible-mode/v1/embeddings`, `/api/v1/services/aigc/text-generation/generation`, `/api/v1/services/rerank/text-rerank/text-rerank` | [OpenAI Chat API](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-chat-completions), [DashScope API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope) |
| Anthropic | `anthropic-messages` | `/v1/messages`, `/anthropic/v1/messages` | [Anthropic Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) |
| Gemini | `gemini-generate-content` | `/v1beta/models/:model:generateContent`, `/v1beta/models/:model:streamGenerateContent` | [Gemini API Reference](https://ai.google.dev/api) |
| MiniMax | `minimax-chat`, `openai-compatible` | `/v1/text/chatcompletion_v2`, `/minimax/v1/text/chatcompletion_v2`, `/v1/chat/completions` via `abab*` | [MiniMax Text Generation API](https://platform.minimax.io/docs/api-reference/text-post) |

## Not Planned

Volcengine Ark / Doubao is not currently planned for implementation.
