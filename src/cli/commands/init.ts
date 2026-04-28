import { existsSync, writeFileSync } from "node:fs";

export const defaultConfig = `server:
  host: 127.0.0.1
  port: 4000

providers:
  # MockMind starts all implemented protocols by default.
  # This field is metadata for compatibility with the project plan and Admin API.
  enabled: all

auth:
  mode: permissive
  apiKeys:
    - test-key

models:
  - id: gpt-5.5
    provider: openai
  - id: deepseek-v4-flash
    provider: deepseek
  - id: deepseek-v4-pro
    provider: deepseek
  - id: kimi-k2.6
    provider: moonshot
  - id: qwen3.6-plus
    provider: aliyun-bailian
  - id: qwen3-rerank
    provider: aliyun-bailian
  - id: glm-5.1
    provider: zhipu
  - id: MiniMax-M2.7
    provider: minimax
  - id: claude-sonnet-4-5-20250929
    provider: anthropic
  - id: gemini-3-flash-preview
    provider: gemini

defaults:
  latencyMs: 30
  streamChunkDelayMs: 25

persistence:
  enabled: true
  driver: sqlite
  sqlite:
    path: .mockmind/mockmind.sqlite

fallback:
  enabled: true
  response:
    type: text
    content: This is a default mock response from mockmind.

scenarios:
  - id: openai-basic
    provider: openai
    endpoint: /v1/chat/completions
    match:
      model: gpt-5.5
      messagesContain: hello
    response:
      type: text
      content: Hello from OpenAI-compatible mock.
      usage:
        promptTokens: 8
        completionTokens: 6
        totalTokens: 14

  - id: openai-stream
    provider: openai
    endpoint: /v1/chat/completions
    match:
      model: gpt-5.5
      stream: true
    response:
      type: stream
      chunks:
        - Hello
        - ', '
        - streaming world!

  - id: deepseek-reasoning
    provider: deepseek
    endpoint: /chat/completions
    match:
      model: deepseek-v4-pro
    response:
      type: text
      reasoningContent: This is mock reasoning content.
      content: This is the final DeepSeek mock answer.

  - id: moonshot-basic
    provider: moonshot
    endpoint: /v1/chat/completions
    match:
      model: kimi-k2.6
      lastUserMessageContains: hello
    response:
      type: text
      content: Hello from mock Moonshot / Kimi.

  - id: zhipu-basic
    provider: zhipu
    endpoint: /api/paas/v4/chat/completions
    match:
      model: glm-5.1
      lastUserMessageContains: hello
    response:
      type: text
      content: Hello from mock Zhipu GLM.

  - id: minimax-basic
    provider: minimax
    endpoint: /v1/text/chatcompletion_v2
    match:
      model: MiniMax-M2.7
      lastUserMessageContains: hello
    response:
      type: text
      content: 你好，我是模拟的 MiniMax 响应。

  - id: qwen-compatible
    provider: aliyun-bailian
    endpoint: /compatible-mode/v1/chat/completions
    match:
      model: qwen3.6-plus
    response:
      type: text
      content: 你好，我是模拟的通义千问响应。

  - id: anthropic-basic
    provider: anthropic
    endpoint: /v1/messages
    match:
      model: claude-sonnet-4-5-20250929
    response:
      type: text
      content: Hello from mock Anthropic.

  - id: gemini-basic
    provider: gemini
    endpoint: /v1beta/models/gemini-3-flash-preview:generateContent
    match:
      model: gemini-3-flash-preview
    response:
      type: text
      content: Hello from mock Gemini.

  - id: dashscope-basic
    provider: aliyun-bailian
    endpoint: /api/v1/services/aigc/text-generation/generation
    match:
      model: qwen3.6-plus
    response:
      type: text
      content: 你好，我是模拟的 DashScope 原生响应。

  - id: bailian-rerank-basic
    provider: aliyun-bailian
    endpoint: /compatible-api/v1/reranks
    match:
      model: qwen3-rerank
      bodyPath:
        query: hello
    response:
      type: json
      json:
        request_id: req_mock_rerank_0001
        output:
          results:
            - index: 0
              relevance_score: 1
              document:
                text: hello world
            - index: 1
              relevance_score: 0.12
              document:
                text: other
        usage:
          total_tokens: 2

  - id: openai-rate-limit
    provider: openai
    endpoint: /v1/chat/completions
    match:
      messagesContain: trigger-rate-limit
    response:
      type: error
      status: 429
      code: rate_limit_exceeded
      message: mock rate limit exceeded
`;

export function initConfig(file = "mockmind.yaml", force = false): void {
  if (existsSync(file) && !force) {
    throw new Error(`${file} already exists. Use --force to overwrite.`);
  }
  writeFileSync(file, defaultConfig, "utf8");
}
