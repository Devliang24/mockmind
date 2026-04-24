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
  - id: gpt-4o-mini
    provider: openai
  - id: deepseek-chat
    provider: deepseek
  - id: deepseek-reasoner
    provider: deepseek
  - id: moonshot-v1-8k
    provider: moonshot
  - id: qwen-plus
    provider: aliyun-bailian
  - id: glm-4
    provider: zhipu
  - id: doubao-pro
    provider: volcengine-ark
  - id: claude-3-5-sonnet-latest
    provider: anthropic
  - id: gemini-1.5-pro
    provider: gemini

defaults:
  latencyMs: 30
  streamChunkDelayMs: 25

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
      model: gpt-4o-mini
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
      model: gpt-4o-mini
      stream: true
    response:
      type: stream
      chunks:
        - Hello
        - ', '
        - streaming world!

  - id: deepseek-reasoning
    provider: deepseek
    endpoint: /v1/chat/completions
    match:
      model: deepseek-reasoner
    response:
      type: text
      reasoningContent: This is mock reasoning content.
      content: This is the final DeepSeek mock answer.

  - id: qwen-compatible
    provider: aliyun-bailian
    endpoint: /compatible-mode/v1/chat/completions
    match:
      model: qwen-plus
    response:
      type: text
      content: 你好，我是模拟的通义千问响应。

  - id: anthropic-basic
    provider: anthropic
    endpoint: /v1/messages
    match:
      model: claude-3-5-sonnet-latest
    response:
      type: text
      content: Hello from mock Anthropic.

  - id: gemini-basic
    provider: gemini
    endpoint: /v1beta/models/gemini-1.5-pro:generateContent
    match:
      model: gemini-1.5-pro
    response:
      type: text
      content: Hello from mock Gemini.

  - id: dashscope-basic
    provider: aliyun-bailian
    endpoint: /api/v1/services/aigc/text-generation/generation
    match:
      model: qwen-plus
    response:
      type: text
      content: 你好，我是模拟的 DashScope 原生响应。

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
