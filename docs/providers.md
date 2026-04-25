# Providers

MockMind starts all implemented providers by default.

## Implemented Providers

| Provider | Protocols | Routes |
|---|---|---|
| OpenAI Compatible | `openai-compatible`, `openai-embeddings` | `/v1/models`, `/v1/chat/completions`, `/v1/embeddings` |
| DeepSeek | `openai-compatible` | `/v1/chat/completions`, `/deepseek/v1/chat/completions` |
| Moonshot / Kimi | `openai-compatible` | `/v1/chat/completions`, `/moonshot/v1/chat/completions` |
| Zhipu GLM | `openai-compatible` | `/v1/chat/completions`, `/zhipu/v1/chat/completions`, `/api/paas/v4/chat/completions` |
| Alibaba Bailian / DashScope | `openai-compatible`, `dashscope-generation` | `/compatible-mode/v1/chat/completions`, `/api/v1/services/aigc/text-generation/generation` |
| Anthropic | `anthropic-messages` | `/v1/messages`, `/anthropic/v1/messages` |
| Gemini | `gemini-generate-content` | `/v1beta/models/:model:generateContent`, `/v1beta/models/:model:streamGenerateContent` |
| MiniMax | `minimax-chat`, `openai-compatible` | `/v1/text/chatcompletion_v2`, `/minimax/v1/text/chatcompletion_v2`, `/v1/chat/completions` via `abab*` |

## Not Planned

Volcengine Ark / Doubao is not currently planned for implementation.
