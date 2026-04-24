# MockMind 开源项目计划

## 1. 项目定位

`mockmind` 是一个使用 TypeScript 编写的多厂商 LLM 协议 Mock Server。

项目目标不是实现真实推理能力，而是提供协议级模拟能力，用于本地开发、CI 测试、Agent/RAG 应用调试，以及不同 LLM Provider SDK 的兼容性验证。

一句话介绍：

> A TypeScript mock server for OpenAI-compatible and major Chinese LLM provider APIs, designed for local development, CI testing, and agent protocol validation.

## 2. 核心使用场景

- 本地开发时不依赖真实 LLM 服务。
- CI 测试时避免调用真实 API，降低成本和不稳定性。
- Agent、RAG、Workflow 应用进行协议兼容测试。
- 模拟流式输出、工具调用、错误、限流、延迟。
- 快速复现线上 LLM 响应问题。
- 作为 SDK、框架、网关、Agent 平台的协议测试替身。

## 3. 开源差异化

- **多协议统一内核**：不同 Provider 共享一套 Scenario Engine。
- **国产厂商优先支持**：不仅支持 OpenAI，也重点兼容国内主流大模型厂商。
- **OpenAI-compatible 优先**：先覆盖最广泛的兼容协议使用场景。
- **协议级精确模拟**：返回接近真实 Provider 的响应结构、错误结构和流式事件。
- **流式优先**：SSE、厂商自定义流式格式作为核心能力。
- **配置驱动**：通过 YAML/JSON 定义模型、场景、响应、错误和延迟。
- **测试友好**：支持 deterministic mode、请求记录、请求断言、回放和 snapshot testing。
- **可嵌入**：既可以作为 CLI 服务运行，也可以作为 npm package 在测试中启动。
- **易部署**：Node.js 和 Docker 即可运行。

## 4. 协议兼容范围

### 4.1 P0：OpenAI Compatible

优先实现 OpenAI-compatible API，因为大量国产厂商已经提供 OpenAI-like 接口。

计划支持：

- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/embeddings`
- `stream: true`
- `tools` / `tool_calls`
- `usage`
- JSON mode / structured output mock
- provider-specific response variants

### 4.2 P1：国产厂商原生协议

优先支持国内主流厂商的原生协议：

- 阿里云百炼 / 通义千问
- 百度千帆 / 文心一言
- 腾讯混元
- 智谱 GLM
- 火山方舟 / 豆包
- MiniMax
- 讯飞星火

### 4.3 P2：国际非 OpenAI 协议

后续支持：

- Anthropic Claude Messages API
- Google Gemini `generateContent` / `streamGenerateContent`

### 4.4 明确不做

- 不支持 Ollama。
- 不实现真实 LLM 推理。
- 不内置真实 Provider API key。
- 不在默认模式下转发请求到真实 LLM。

## 5. 目标 Provider

### 5.1 国际 Provider

- OpenAI
- Anthropic
- Google Gemini

### 5.2 国产 Provider

- DeepSeek
- Moonshot / Kimi
- 阿里云百炼 / 通义千问 / DashScope
- 百度千帆 / 文心一言
- 腾讯混元
- 智谱 GLM
- 火山方舟 / 豆包
- MiniMax
- 零一万物 / 01.AI
- 讯飞星火
- 商汤日日新 / SenseNova

## 6. 推荐技术栈

- **Runtime**：Node.js 20+
- **Language**：TypeScript
- **Web Framework**：Fastify
- **Schema Validation**：Zod
- **Config Format**：YAML + JSON
- **Streaming**：原生 `text/event-stream`
- **Tests**：Vitest + Undici
- **Build**：tsup
- **Dev Runtime**：tsx
- **CLI**：commander 或 cac
- **Release**：changesets
- **Container**：Docker + GHCR

## 7. 仓库结构

```txt
mockmind/
  src/
    cli/
      index.ts
      commands/
        start.ts
        init.ts
    server/
      create-server.ts
      routes.ts
    providers/
      openai/
        index.ts
        routes.ts
        adapter.ts
        stream.ts
        errors.ts
      anthropic/
      gemini/
      aliyun-bailian/
      baidu-qianfan/
      tencent-hunyuan/
      zhipu/
      deepseek/
      moonshot/
      minimax/
      volcengine-ark/
      xfyun-spark/
    core/
      scenario/
        store.ts
        matcher.ts
        types.ts
      renderer/
        fixed.ts
        echo.ts
        template.ts
        random.ts
      stream/
        sse.ts
      errors/
        provider-error.ts
      auth/
        auth-mock.ts
      recorder/
        recorder.ts
    config/
      loader.ts
      schema.ts
    admin/
      routes.ts
  examples/
    openai-sdk/
    deepseek/
    moonshot-kimi/
    aliyun-bailian/
    zhipu/
    docker-compose/
  test/
    unit/
    integration/
    fixtures/
  docs/
    getting-started.md
    config-reference.md
    scenario-matching.md
    openai-compatible.md
    chinese-providers.md
    aliyun-bailian.md
    baidu-qianfan.md
    tencent-hunyuan.md
    zhipu-glm.md
    deepseek.md
    moonshot-kimi.md
    volcengine-ark.md
    minimax.md
    streaming.md
    errors.md
    adding-provider.md
    compatibility-matrix.md
    roadmap.md
  .github/
    workflows/
      ci.yml
    ISSUE_TEMPLATE/
      bug_report.md
      feature_request.md
      provider_request.md
    PULL_REQUEST_TEMPLATE.md
  package.json
  tsconfig.json
  README.md
  LICENSE
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  CHANGELOG.md
  Dockerfile
```

## 8. 核心架构

### 8.1 Protocol Adapter

每个 Provider 实现一个协议适配器：

- 解析厂商请求。
- 统一转换成内部 `MockRequest`。
- 调用 Scenario Engine 获取 `MockResult`。
- 将 `MockResult` 转换为厂商响应格式。
- 处理厂商专属流式事件格式。
- 处理厂商专属错误响应格式。

### 8.2 Scenario Engine

负责：

- 加载 YAML/JSON 配置。
- 匹配 provider、endpoint、model、header、body 字段和 message 内容。
- 支持 priority。
- 支持 fallback scenario。
- 支持 deterministic mode。
- 支持 seeded random。

### 8.3 Renderer

支持响应类型：

- `fixed`：固定文本或固定 JSON。
- `echo`：回显用户输入。
- `template`：使用模板渲染响应。
- `random`：从多个候选响应中随机选择。
- `tool_call`：模拟工具调用。
- `embedding`：模拟 embedding 向量。
- `error`：模拟错误响应。
- `stream`：模拟流式响应。

### 8.4 Stream Engine

统一处理：

- OpenAI SSE。
- Anthropic SSE。
- Gemini stream。
- DashScope stream。
- 百度、腾讯、智谱等厂商自定义 stream 格式。
- chunk delay。
- stream error。
- stream usage。

### 8.5 Auth Mock

支持：

- Bearer token。
- API key。
- query access token。
- permissive mode。
- strict mode。
- disabled mode。
- 云厂商签名的格式校验或跳过校验。

### 8.6 Recorder

支持：

- 记录请求 body。
- 记录请求 headers。
- 记录命中的 scenario。
- 记录响应。
- Admin API 查询请求历史。
- reset 请求历史。
- 后续支持 replay。

## 9. 内部统一类型设计

```ts
type Provider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "aliyun-bailian"
  | "baidu-qianfan"
  | "tencent-hunyuan"
  | "zhipu"
  | "deepseek"
  | "moonshot"
  | "minimax"
  | "volcengine-ark"
  | "xfyun-spark"
  | "sense-nova";

type MockRequest = {
  provider: Provider;
  endpoint: string;
  method: string;
  model?: string;
  messages?: Array<unknown>;
  prompt?: string;
  stream?: boolean;
  tools?: Array<unknown>;
  rawBody: unknown;
  headers: Record<string, string>;
  query: Record<string, string>;
};

type MockResult = {
  type: "text" | "json" | "tool_call" | "embedding" | "error" | "stream";
  content?: string;
  reasoningContent?: string;
  json?: unknown;
  chunks?: string[];
  toolCalls?: Array<unknown>;
  embedding?: number[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: {
    status: number;
    code?: string;
    message: string;
  };
};
```

## 10. 配置文件示例

```yaml
server:
  port: 4000
  host: 127.0.0.1

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
  - id: ernie-4.0
    provider: baidu-qianfan
  - id: hunyuan-standard
    provider: tencent-hunyuan
  - id: glm-4
    provider: zhipu
  - id: doubao-pro
    provider: volcengine-ark

defaults:
  latencyMs: 50
  streamChunkDelayMs: 30

scenarios:
  - id: openai-basic-chat
    provider: openai
    endpoint: /v1/chat/completions
    match:
      model: gpt-4o-mini
      messagesContain: hello
    response:
      type: text
      content: "Hello from mockmind."

  - id: openai-stream-chat
    provider: openai
    endpoint: /v1/chat/completions
    match:
      stream: true
    response:
      type: stream
      chunks:
        - "Hello"
        - ", "
        - "streaming world!"

  - id: deepseek-reasoning-demo
    provider: deepseek
    endpoint: /v1/chat/completions
    match:
      model: deepseek-reasoner
      messagesContain: explain
    response:
      type: text
      reasoningContent: "这里是模拟的推理过程。"
      content: "这里是最终回答。"

  - id: qwen-basic-chat
    provider: aliyun-bailian
    endpoint: /compatible-mode/v1/chat/completions
    match:
      model: qwen-plus
    response:
      type: text
      content: "你好，我是模拟的通义千问响应。"

  - id: baidu-rate-limit
    provider: baidu-qianfan
    endpoint: /rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions
    match:
      messagesContain: trigger-rate-limit
    response:
      type: error
      status: 429
      code: qianfan_rate_limit
      message: "Too many requests."
```

## 11. CLI 设计

### 11.1 启动服务

```bash
mockmind start
mockmind start --config mockmind.yaml
mockmind start --host 127.0.0.1 --port 4000
```

### 11.2 初始化配置

```bash
mockmind init
mockmind init --provider openai
mockmind init --provider deepseek
mockmind init --provider aliyun-bailian
```

### 11.3 校验配置

```bash
mockmind validate --config mockmind.yaml
```

### 11.4 查看版本

```bash
mockmind --version
```

## 12. HTTP API 设计

### 12.1 健康检查

```txt
GET /health
```

### 12.2 Admin API

```txt
GET  /__admin/config
GET  /__admin/models
GET  /__admin/scenarios
GET  /__admin/requests
POST /__admin/reset
POST /__admin/reload
```

### 12.3 OpenAI-compatible API

```txt
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings
```

### 12.4 国产 OpenAI-compatible API Alias

```txt
POST /compatible-mode/v1/chat/completions
POST /ark/v1/chat/completions
POST /openai/deployments/:deployment/chat/completions
```

具体路径按各厂商实际协议逐步扩展。

## 13. Provider Preset 机制

每个 Provider Preset 包含：

- 默认模型列表。
- OpenAI-compatible base path。
- 原生 API base path。
- 默认错误格式。
- 默认流式格式。
- 默认认证方式。
- 是否支持 tool calling。
- 是否支持 reasoning content。
- 是否支持 embedding。
- 是否支持 vision。

示例：

```ts
type ProviderPreset = {
  provider: Provider;
  displayName: string;
  defaultModels: string[];
  compatiblePaths: string[];
  nativePaths: string[];
  authModes: Array<"bearer" | "api-key" | "query-token" | "signature">;
  capabilities: {
    chat: boolean;
    streaming: boolean;
    tools: boolean;
    embeddings: boolean;
    reasoningContent: boolean;
    vision: boolean;
  };
};
```

## 14. 兼容性矩阵

| Provider | OpenAI Compatible | Native API | Streaming | Tools | Embedding | Vision | Priority |
|---|---:|---:|---:|---:|---:|---:|---:|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | planned | P0 |
| DeepSeek | ✅ | partial | ✅ | ✅ | planned | - | P0 |
| Moonshot / Kimi | ✅ | partial | ✅ | planned | planned | - | P0 |
| 阿里百炼 / 通义千问 | ✅ | ✅ | ✅ | ✅ | ✅ | planned | P1 |
| 百度千帆 / 文心 | partial | ✅ | ✅ | planned | planned | planned | P1 |
| 腾讯混元 | partial | ✅ | ✅ | planned | planned | planned | P1 |
| 智谱 GLM | ✅ | ✅ | ✅ | ✅ | planned | planned | P1 |
| 火山方舟 / 豆包 | ✅ | ✅ | ✅ | ✅ | planned | planned | P1 |
| MiniMax | partial | ✅ | ✅ | planned | planned | planned | P1 |
| 零一万物 / 01.AI | ✅ | partial | ✅ | planned | planned | - | P2 |
| 讯飞星火 | partial | planned | planned | planned | - | planned | P2 |
| 商汤 SenseNova | partial | planned | planned | planned | planned | planned | P2 |
| Anthropic | - | ✅ | ✅ | ✅ | - | planned | P2 |
| Gemini | - | ✅ | ✅ | ✅ | ✅ | planned | P2 |

## 15. Roadmap

### v0.1.0：OpenAI-compatible MVP

- 初始化 TypeScript 开源项目骨架。
- 实现 CLI：`start`、`init`。
- 实现 `/health`。
- 实现 `GET /v1/models`。
- 实现 `POST /v1/chat/completions`。
- 支持非流式 chat completion。
- 支持 SSE 流式 chat completion。
- 支持 YAML 配置。
- 支持 fixed、echo、stream、error 响应。
- 支持 latency 配置。
- 支持基础 Admin API。
- 添加 Vitest 测试。
- 添加 README、LICENSE、CONTRIBUTING、CI。
- 添加 Dockerfile。

### v0.2.0：国产 OpenAI-like Provider Presets

- DeepSeek preset。
- Moonshot / Kimi preset。
- 智谱 GLM OpenAI-compatible preset。
- 阿里百炼 OpenAI-compatible preset。
- 火山方舟 / 豆包 OpenAI-compatible preset。
- provider-specific response variants。
- reasoning content mock。
- tool calls mock。
- usage mock。

### v0.3.0：阿里百炼 / DashScope 原生协议

- 通义千问文本生成。
- DashScope native streaming。
- DashScope embedding。
- DashScope error format。
- 多模态响应结构预留。

### v0.4.0：百度千帆 / 文心协议

- ERNIE chat。
- access token mock。
- streaming。
- 百度错误码 mock。
- 千帆模型列表 preset。

### v0.5.0：腾讯混元 + 智谱 GLM 原生协议

- Hunyuan chat。
- Hunyuan streaming。
- GLM chat。
- GLM tool calling。
- provider-specific errors。

### v0.6.0：火山方舟 / 豆包 + MiniMax

- Ark 原生调用格式。
- 豆包模型 preset。
- MiniMax chatcompletion。
- MiniMax streaming。

### v0.7.0：Anthropic + Gemini

- Claude Messages API。
- Claude content block。
- Claude streaming。
- Claude tool use。
- Gemini generateContent。
- Gemini streamGenerateContent。
- Gemini function calling。

### v0.8.0：高级测试能力

- 请求录制。
- 请求回放。
- snapshot testing。
- seeded random。
- scenario priority。
- scenario hot reload。
- request assertions。
- programmatic API。

### v1.0.0：稳定开源发布

- 完整兼容性矩阵。
- Provider 插件机制。
- 完整文档站。
- SemVer。
- npm 发布。
- Docker / GHCR 镜像发布。
- GitHub Release 自动化。

## 16. MVP 任务清单

1. 初始化 TypeScript + Fastify 项目。
2. 添加 `package.json`、`tsconfig.json`、`tsup.config.ts`。
3. 添加 CLI：`mockmind start`、`mockmind init`。
4. 实现配置加载器。
5. 实现配置 Schema 校验。
6. 实现 Scenario Store。
7. 实现 Scenario Matcher。
8. 实现 Renderer：fixed、echo、stream、error。
9. 实现 OpenAI `/v1/models`。
10. 实现 OpenAI `/v1/chat/completions` 非流式。
11. 实现 OpenAI SSE 流式。
12. 实现 latency mock。
13. 实现基础 auth mock。
14. 实现 request recorder。
15. 实现 Admin API。
16. 添加单元测试。
17. 添加集成测试。
18. 添加 Dockerfile。
19. 添加 README 快速开始。
20. 添加开源治理文件。
21. 配置 GitHub Actions CI。
22. 准备 `v0.1.0` 发布。

## 17. 测试计划

### 17.1 Unit Tests

- config loader。
- config schema。
- scenario matcher。
- renderer。
- OpenAI formatter。
- SSE chunk formatter。
- provider preset。

### 17.2 Integration Tests

- OpenAI SDK 调用 `/v1/chat/completions`。
- `stream: false` 响应。
- `stream: true` 响应。
- 错误响应。
- 延迟响应。
- Admin requests 查询。

### 17.3 Contract Tests

- 响应字段结构符合目标 Provider。
- streaming event 格式符合目标 Provider。
- error body 格式符合目标 Provider。
- usage 字段符合目标 Provider。

### 17.4 CLI Tests

- `mockmind init`。
- `mockmind start --config`。
- `mockmind validate --config`。

### 17.5 Docker Tests

- 镜像构建。
- 容器启动。
- health check。
- 挂载配置文件。

## 18. 文档计划

- `docs/getting-started.md`
- `docs/config-reference.md`
- `docs/scenario-matching.md`
- `docs/openai-compatible.md`
- `docs/chinese-providers.md`
- `docs/aliyun-bailian.md`
- `docs/baidu-qianfan.md`
- `docs/tencent-hunyuan.md`
- `docs/zhipu-glm.md`
- `docs/deepseek.md`
- `docs/moonshot-kimi.md`
- `docs/volcengine-ark.md`
- `docs/minimax.md`
- `docs/streaming.md`
- `docs/errors.md`
- `docs/programmatic-api.md`
- `docs/adding-provider.md`
- `docs/compatibility-matrix.md`
- `docs/roadmap.md`

## 19. 开源治理文件

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `.github/workflows/ci.yml`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/provider_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

## 20. 发布计划

### 20.1 npm

候选包名：

- `mockmind`
- `llm-protocol-mock`
- `mockllm-ts`
- `@mockmind/server`

### 20.2 Docker

候选镜像：

```txt
ghcr.io/<owner>/mockmind
```

### 20.3 自动化发布

- PR 合并到 `main` 后运行 CI。
- 使用 changesets 管理 changelog。
- tag 触发 npm publish。
- tag 触发 Docker image publish。
- GitHub Release 自动生成发布说明。

## 21. 第一阶段建议

第一阶段不要一次性实现所有厂商协议。

建议优先完成：

1. OpenAI-compatible 核心。
2. YAML scenario 配置。
3. SSE streaming。
4. request recorder。
5. 国产 Provider preset 机制。
6. DeepSeek、Kimi、智谱、百炼、豆包的 OpenAI-compatible preset。

这样可以快速形成可用的 `v0.1.0`，同时为后续国产原生协议扩展打好基础。

## 22. 用户交互与体验设计

虽然项目核心是 Mock Server，但作为开源工具，用户交互体验会直接影响采用率。交互层需要同时覆盖 CLI、配置文件、Admin API、日志、错误提示、示例和未来可选 Web UI。

### 22.1 交互目标

- 新用户 3 分钟内可以启动一个 OpenAI-compatible mock 服务。
- 常见 SDK 只需要改 `baseURL` 和 `apiKey` 即可接入。
- 配置错误时给出明确、可操作的提示。
- 流式、错误、延迟、工具调用等能力可以通过示例快速复制。
- CI 环境下可以无交互、稳定运行。
- 本地开发时可以清楚看到请求、命中场景和返回内容。

### 22.2 CLI 用户体验

CLI 是项目第一优先级交互入口。

#### 初始化

```bash
mockmind init
```

默认生成：

- `mockmind.yaml`
- 示例模型列表
- 示例 scenarios
- OpenAI-compatible chat 示例
- stream 示例
- error 示例

支持指定 Provider：

```bash
mockmind init --provider openai
mockmind init --provider deepseek
mockmind init --provider aliyun-bailian
mockmind init --provider zhipu
```

支持非交互模式：

```bash
mockmind init --yes
```

#### 启动服务

```bash
mockmind start
mockmind start --config mockmind.yaml
mockmind start --port 4000
mockmind start --watch
```

启动成功后输出：

```txt
MockMind running

Local:   http://127.0.0.1:4000
Health:  http://127.0.0.1:4000/health
Admin:   http://127.0.0.1:4000/__admin/requests

OpenAI-compatible baseURL:
  http://127.0.0.1:4000/v1

Example:
  curl http://127.0.0.1:4000/v1/chat/completions ...
```

#### 配置校验

```bash
mockmind validate
mockmind validate --config mockmind.yaml
```

配置错误示例：

```txt
Config validation failed

scenarios[2].response.type is invalid
Expected one of: text, json, stream, error, tool_call, embedding
Received: txt

Hint:
  Did you mean "text"?
```

#### 场景调试

```bash
mockmind inspect scenarios
mockmind inspect models
mockmind inspect requests
mockmind inspect match --file request.json
```

`inspect match` 用于解释某个请求为什么命中或没有命中 scenario。

#### 请求回放

后续版本支持：

```bash
mockmind replay --request-id req_123
mockmind replay --from requests.jsonl
```

### 22.3 配置文件交互体验

配置文件应尽量可读、可复制、可渐进学习。

设计原则：

- 简单场景只需要 5 到 10 行 YAML。
- 高级能力按需展开。
- 字段命名接近用户心智，例如 `messagesContain`、`latencyMs`、`chunks`。
- 错误提示必须指出 YAML 路径。
- 文档中每个能力都提供可直接运行的最小配置。

最小配置示例：

```yaml
models:
  - id: mock-gpt
    provider: openai

scenarios:
  - id: hello
    provider: openai
    endpoint: /v1/chat/completions
    response:
      type: text
      content: Hello from mock server.
```

### 22.4 日志交互体验

默认日志面向人类可读：

```txt
[12:00:01] POST /v1/chat/completions 200 24ms
  provider: openai
  model: gpt-4o-mini
  scenario: openai-basic-chat
  stream: false
```

流式请求日志：

```txt
[12:00:05] POST /v1/chat/completions 200 stream 183ms
  provider: deepseek
  model: deepseek-chat
  scenario: deepseek-stream-demo
  chunks: 8
```

错误请求日志：

```txt
[12:00:08] POST /v1/chat/completions 429 3ms
  provider: openai
  scenario: openai-rate-limit
  error: rate_limit_exceeded
```

支持 JSON 日志，方便 CI 和容器环境：

```bash
mockmind start --log-format json
```

支持日志级别：

```bash
mockmind start --log-level debug
mockmind start --log-level silent
```

### 22.5 Admin API 交互体验

Admin API 面向调试和自动化测试。

核心接口：

```txt
GET  /__admin/config
GET  /__admin/models
GET  /__admin/scenarios
GET  /__admin/requests
GET  /__admin/requests/:id
POST /__admin/reset
POST /__admin/reload
POST /__admin/scenarios
DELETE /__admin/scenarios/:id
```

典型用途：

- 在测试前 reset 请求历史。
- 在测试后查询某个请求是否发生。
- 动态新增 scenario。
- reload 配置文件。
- 调试请求命中情况。

请求记录返回示例：

```json
{
  "id": "req_123",
  "provider": "openai",
  "endpoint": "/v1/chat/completions",
  "model": "gpt-4o-mini",
  "matchedScenarioId": "openai-basic-chat",
  "status": 200,
  "durationMs": 24,
  "stream": false
}
```

### 22.6 SDK 接入体验

README 首页必须提供主流 SDK 的最短接入示例。

OpenAI SDK 示例：

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

DeepSeek / Kimi / 智谱等 OpenAI-compatible SDK 使用方式保持一致，只替换模型名和 baseURL。

### 22.7 错误提示体验

错误提示分为两类：

1. 用户请求错误。
2. Mock Server 配置错误。

用户请求错误需要模拟对应 Provider 的错误格式。

配置错误需要面向开发者，提供清晰提示：

```txt
Scenario "deepseek-reasoning-demo" is invalid

Path:
  scenarios[3].response.reasoningContent

Problem:
  reasoningContent is only supported by provider: deepseek, openai-compatible variants

Fix:
  Set provider to "deepseek" or remove reasoningContent.
```

### 22.8 Web UI 可选规划

Web UI 不作为 MVP 必做项，但可以作为 v0.8+ 的增强能力。

可选能力：

- 查看实时请求列表。
- 查看请求详情。
- 查看命中的 scenario。
- 编辑 scenarios。
- 热加载配置。
- 查看 Provider 兼容矩阵。
- SSE 流式响应可视化。
- 一键复制 curl / SDK 示例。

建议实现方式：

- 初期只提供 Admin API。
- 后续添加独立 package：`@mockmind/ui`。
- Web UI 通过 `/__admin` API 访问服务状态。

### 22.9 测试中的交互体验

作为测试工具时，需要提供 programmatic API：

```ts
import { createMockLLMServer } from "mockmind";

const server = await createMockLLMServer({
  configFile: "mockmind.yaml",
});

await server.start();
await server.resetRequests();

const requests = await server.getRequests();

await server.stop();
```

Vitest 示例：

```ts
beforeAll(async () => {
  server = await createMockLLMServer({ port: 4000 });
  await server.start();
});

afterAll(async () => {
  await server.stop();
});
```

### 22.10 交互优先级

#### MVP 必做

- `mockmind init`
- `mockmind start`
- `mockmind validate`
- 友好的启动输出
- 友好的配置错误提示
- 人类可读日志
- `/__admin/requests`
- `/__admin/reset`
- README SDK 快速接入示例

#### v0.2+ 增强

- `mockmind inspect scenarios`
- `mockmind inspect requests`
- `mockmind inspect match`
- JSON 日志
- 动态新增 scenario
- 配置热加载
- programmatic API

#### v0.8+ 可选

- Web UI
- 请求回放 UI
- Scenario 编辑器
- Provider 兼容性面板

## 23. 示例请求与响应

本章节用于沉淀不同 Provider 的 Mock 响应样例，方便后续实现协议适配器、编写 contract tests 和补充文档。

示例响应不要求覆盖真实协议的全部字段，但需要保持核心字段结构、流式事件格式、错误格式和 SDK 兼容性。

### 23.1 OpenAI-compatible Chat Completion

#### 请求

```http
POST /v1/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "hello" }
  ]
}
```

#### 非流式响应

```json
{
  "id": "chatcmpl_mock_0001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello from mockmind."
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

#### 流式响应

```txt
data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","created":1710000000,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","created":1710000000,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","created":1710000000,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":" from mock"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_0001","object":"chat.completion.chunk","created":1710000000,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### 23.2 OpenAI-compatible Tool Call

#### 请求

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "What's the weather in Shanghai?" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather",
        "parameters": {
          "type": "object",
          "properties": {
            "city": { "type": "string" }
          },
          "required": ["city"]
        }
      }
    }
  ]
}
```

#### 响应

```json
{
  "id": "chatcmpl_mock_tool_0001",
  "object": "chat.completion",
  "created": 1710000000,
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
  ],
  "usage": {
    "prompt_tokens": 32,
    "completion_tokens": 12,
    "total_tokens": 44
  }
}
```

### 23.3 OpenAI-compatible Embeddings

#### 请求

```http
POST /v1/embeddings
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "text-embedding-3-small",
  "input": "hello world"
}
```

#### 响应

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0123, -0.0456, 0.0789, 0.0012]
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 2,
    "total_tokens": 2
  }
}
```

### 23.4 DeepSeek Chat Completion

DeepSeek 主要按 OpenAI-compatible 协议接入，但需要支持 `reasoning_content` 场景。

#### 请求

```http
POST /v1/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "deepseek-reasoner",
  "messages": [
    { "role": "user", "content": "Explain why the sky is blue." }
  ]
}
```

#### 响应

```json
{
  "id": "chatcmpl_mock_deepseek_0001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "deepseek-reasoner",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "reasoning_content": "We need explain Rayleigh scattering in simple terms.",
        "content": "The sky looks blue because air molecules scatter shorter blue wavelengths of sunlight more than longer red wavelengths."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 28,
    "total_tokens": 40
  }
}
```

#### 流式响应

```txt
data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{"reasoning_content":"We need explain "},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{"reasoning_content":"Rayleigh scattering."},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{"content":"The sky looks blue because "},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{"content":"air scatters blue light."},"finish_reason":null}]}

data: {"id":"chatcmpl_mock_deepseek_0001","object":"chat.completion.chunk","created":1710000000,"model":"deepseek-reasoner","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### 23.5 Moonshot / Kimi Chat Completion

Kimi 使用 OpenAI-compatible 风格，重点测试长上下文和普通 chat 响应。

#### 响应

```json
{
  "id": "chatcmpl_mock_kimi_0001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "moonshot-v1-8k",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好，我是模拟的 Kimi 响应。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 9,
    "total_tokens": 19
  }
}
```

### 23.6 阿里云百炼 OpenAI-compatible 响应

#### 请求

```http
POST /compatible-mode/v1/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "qwen-plus",
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

#### 响应

```json
{
  "id": "chatcmpl_mock_qwen_0001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "qwen-plus",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好，我是模拟的通义千问响应。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 10,
    "total_tokens": 14
  }
}
```

### 23.7 阿里云 DashScope 原生响应

#### 请求

```http
POST /api/v1/services/aigc/text-generation/generation
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "qwen-plus",
  "input": {
    "messages": [
      { "role": "user", "content": "你好" }
    ]
  },
  "parameters": {
    "result_format": "message"
  }
}
```

#### 响应

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
    "input_tokens": 4,
    "output_tokens": 12,
    "total_tokens": 16
  }
}
```

### 23.8 百度千帆 / 文心响应

#### 请求

```http
POST /rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=test-token
Content-Type: application/json
```

```json
{
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": false
}
```

#### 响应

```json
{
  "id": "as-mock-baidu-0001",
  "object": "chat.completion",
  "created": 1710000000,
  "result": "你好，我是模拟的文心一言响应。",
  "is_truncated": false,
  "need_clear_history": false,
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 10,
    "total_tokens": 14
  }
}
```

#### 错误响应

```json
{
  "error_code": 336100,
  "error_msg": "mock rate limit exceeded",
  "id": "as-mock-baidu-error-0001"
}
```

### 23.9 腾讯混元响应

#### 请求

```http
POST /hunyuan/v1/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "Model": "hunyuan-standard",
  "Messages": [
    { "Role": "user", "Content": "你好" }
  ],
  "Stream": false
}
```

#### 响应

```json
{
  "Response": {
    "Id": "hunyuan-mock-0001",
    "Created": 1710000000,
    "Choices": [
      {
        "Index": 0,
        "Message": {
          "Role": "assistant",
          "Content": "你好，我是模拟的腾讯混元响应。"
        },
        "FinishReason": "stop"
      }
    ],
    "Usage": {
      "PromptTokens": 4,
      "CompletionTokens": 10,
      "TotalTokens": 14
    }
  }
}
```

#### 错误响应

```json
{
  "Response": {
    "Error": {
      "Code": "RequestLimitExceeded",
      "Message": "mock request limit exceeded"
    },
    "RequestId": "hunyuan-mock-error-0001"
  }
}
```

### 23.10 智谱 GLM 响应

#### 请求

```http
POST /api/paas/v4/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "glm-4",
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

#### 响应

```json
{
  "id": "glm-mock-0001",
  "created": 1710000000,
  "model": "glm-4",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "content": "你好，我是模拟的智谱 GLM 响应。"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 10,
    "total_tokens": 14
  }
}
```

### 23.11 火山方舟 / 豆包 OpenAI-compatible 响应

#### 请求

```http
POST /api/v3/chat/completions
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "doubao-pro",
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

#### 响应

```json
{
  "id": "chatcmpl_mock_doubao_0001",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "doubao-pro",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好，我是模拟的豆包响应。"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 9,
    "total_tokens": 13
  }
}
```

### 23.12 MiniMax 响应

#### 请求

```http
POST /v1/text/chatcompletion_v2
Authorization: Bearer test-key
Content-Type: application/json
```

```json
{
  "model": "abab6.5s-chat",
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

#### 响应

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
  "created": 1710000000,
  "model": "abab6.5s-chat",
  "usage": {
    "total_tokens": 14
  },
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

### 23.13 Anthropic Messages 响应

#### 请求

```http
POST /v1/messages
x-api-key: test-key
anthropic-version: 2023-06-01
Content-Type: application/json
```

```json
{
  "model": "claude-3-5-sonnet-latest",
  "max_tokens": 128,
  "messages": [
    { "role": "user", "content": "hello" }
  ]
}
```

#### 响应

```json
{
  "id": "msg_mock_0001",
  "type": "message",
  "role": "assistant",
  "model": "claude-3-5-sonnet-latest",
  "content": [
    {
      "type": "text",
      "text": "Hello from mock Anthropic response."
    }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 8,
    "output_tokens": 7
  }
}
```

#### 流式响应

```txt
event: message_start
data: {"type":"message_start","message":{"id":"msg_mock_0001","type":"message","role":"assistant","model":"claude-3-5-sonnet-latest","content":[],"stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":8,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" from mock."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":7}}

event: message_stop
data: {"type":"message_stop"}
```

### 23.14 Gemini generateContent 响应

#### 请求

```http
POST /v1beta/models/gemini-1.5-pro:generateContent?key=test-key
Content-Type: application/json
```

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "hello" }
      ]
    }
  ]
}
```

#### 响应

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          { "text": "Hello from mock Gemini response." }
        ]
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": []
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 8,
    "candidatesTokenCount": 7,
    "totalTokenCount": 15
  }
}
```

### 23.15 通用错误响应

#### OpenAI-compatible 错误

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

#### Anthropic 错误

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "mock rate limit exceeded"
  }
}
```

#### Gemini 错误

```json
{
  "error": {
    "code": 429,
    "message": "mock rate limit exceeded",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

### 23.16 Scenario 对应示例

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
      toolCalls:
        - id: call_mock_0001
          name: get_weather
          arguments:
            city: Shanghai

  - id: deepseek-reasoning-stream
    provider: deepseek
    endpoint: /v1/chat/completions
    match:
      model: deepseek-reasoner
      stream: true
    response:
      type: stream
      reasoningChunks:
        - "We need explain the problem."
        - "Then produce the final answer."
      chunks:
        - "This is the final answer."

  - id: baidu-error
    provider: baidu-qianfan
    endpoint: /rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions
    match:
      messagesContain: trigger-error
    response:
      type: error
      status: 429
      code: "336100"
      message: "mock rate limit exceeded"
```

## 24. 项目开发组织结构

本章节定义项目的开发组织方式，包括代码目录职责、模块边界、贡献流程、版本管理、分支策略和维护角色。目标是让项目从一开始就适合作为长期维护的开源项目演进。

### 24.1 开发组织目标

- 保持核心架构稳定，方便持续增加 Provider。
- 降低新贡献者理解成本。
- 明确模块边界，避免 Provider 逻辑污染核心层。
- 让协议兼容性通过测试和 fixtures 固化。
- 支持小步快跑发布，避免长期大分支。
- 让 README、docs、examples、tests 与代码同步演进。

### 24.2 Monorepo 规划

初期可以采用单 package 仓库，后续演进为轻量 monorepo。

#### v0.x 初期结构

```txt
mockmind/
  src/
  docs/
  examples/
  test/
  package.json
```

适合 MVP，简单直接，降低维护成本。

#### v1.0 前后可演进为 Monorepo

```txt
mockmind/
  packages/
    core/
    server/
    cli/
    providers/
    ui/
    test-utils/
  examples/
  docs/
  test/
  website/
```

各 package 职责：

- `@mockmind/core`：Scenario Engine、Matcher、Renderer、统一类型。
- `@mockmind/server`：HTTP Server、Admin API、Provider 路由注册。
- `@mockmind/cli`：命令行入口。
- `@mockmind/providers`：官方 Provider adapter 集合。
- `@mockmind/test-utils`：测试中嵌入启动服务的工具。
- `@mockmind/ui`：可选 Web UI。

### 24.3 当前推荐目录职责

```txt
src/
  cli/          # 命令行交互，不包含协议实现
  server/       # HTTP 服务创建、生命周期、路由注册
  providers/    # 各厂商协议适配器
  core/         # 与具体厂商无关的核心能力
  config/       # 配置加载、解析、校验
  admin/        # Admin API
  shared/       # 通用工具、类型、常量
```

#### `src/core`

核心层必须保持 Provider 无关。

允许包含：

- Scenario 类型。
- Matcher。
- Renderer。
- Stream 抽象。
- Recorder。
- Error 抽象。
- Deterministic random。

不允许包含：

- `openai`、`deepseek`、`qwen` 等厂商专有字段判断。
- HTTP 路由细节。
- CLI 输出细节。

#### `src/providers`

Provider 层负责协议适配。

每个 Provider 目录建议包含：

```txt
providers/<provider>/
  index.ts       # Provider 注册入口
  routes.ts      # HTTP 路由
  adapter.ts     # request/response adapter
  stream.ts      # 流式格式
  errors.ts      # 错误格式
  preset.ts      # 默认模型和能力
  fixtures.ts    # 测试 fixture 复用
```

Provider 层可以：

- 解析厂商请求格式。
- 格式化厂商响应。
- 定义厂商错误结构。
- 定义厂商流式事件。
- 提供默认模型列表。

Provider 层不应该：

- 自己实现独立 Scenario Engine。
- 绕过统一 Recorder。
- 绕过统一 Auth Mock。
- 修改核心类型以适配单一厂商，除非该能力具备通用性。

#### `src/server`

负责：

- 创建 Fastify 实例。
- 注册 provider routes。
- 注册 Admin API。
- 注入 config、scenario store、recorder。
- 管理 server lifecycle。

不负责：

- 具体 Provider 响应格式。
- CLI 参数解析。
- 配置文件细节解析。

#### `src/cli`

负责：

- `start` 命令。
- `init` 命令。
- `validate` 命令。
- `inspect` 命令。
- 人类友好的输出。

不负责：

- 业务协议逻辑。
- Provider 响应格式。
- Matcher 逻辑。

#### `src/config`

负责：

- YAML/JSON 加载。
- Zod schema 校验。
- 默认配置合并。
- 配置错误格式化。
- 配置热加载。

#### `src/admin`

负责：

- 请求历史查询。
- scenario 查询。
- 配置查询。
- reset。
- reload。
- 动态 scenario 管理。

### 24.4 测试目录组织

```txt
test/
  unit/
    core/
    config/
    providers/
  integration/
    openai/
    deepseek/
    aliyun-bailian/
    baidu-qianfan/
    admin/
    cli/
  contract/
    fixtures/
    snapshots/
  e2e/
    docker/
```

#### Unit Tests

覆盖纯函数和模块逻辑：

- matcher。
- renderer。
- config loader。
- provider formatter。
- stream formatter。

#### Integration Tests

覆盖真实 HTTP 服务：

- API 路由。
- Admin API。
- CLI 启动。
- SDK 调用。

#### Contract Tests

用于防止 Provider 响应结构回归：

- 输入请求 fixture。
- 输出响应 snapshot。
- 流式事件 snapshot。
- 错误响应 snapshot。

#### E2E Tests

用于发布前验证：

- Docker build。
- Docker run。
- 配置挂载。
- health check。

### 24.5 Fixtures 组织

Provider fixtures 建议按协议版本和场景组织：

```txt
test/fixtures/
  openai/
    chat.basic.request.json
    chat.basic.response.json
    chat.stream.events.txt
    chat.tool-call.request.json
    chat.tool-call.response.json
    embeddings.basic.request.json
    embeddings.basic.response.json
  deepseek/
    reasoning.basic.request.json
    reasoning.basic.response.json
    reasoning.stream.events.txt
  aliyun-bailian/
    compatible.chat.request.json
    compatible.chat.response.json
    dashscope.chat.request.json
    dashscope.chat.response.json
```

原则：

- fixtures 是协议兼容性的事实来源。
- 每新增 Provider 能力必须补充 fixture。
- 文档示例应尽量从 fixture 派生，避免漂移。
- snapshot 更新必须在 PR 中明确说明原因。

### 24.6 分支策略

推荐轻量 trunk-based development：

- `main`：始终保持可发布状态。
- `feature/*`：短生命周期功能分支。
- `fix/*`：bugfix 分支。
- `docs/*`：文档分支。
- `release/*`：只有发布准备复杂时才使用。

规则：

- 所有 PR 必须通过 CI。
- 小 PR 优先，避免跨多个 Provider 的大型 PR。
- Provider 新增能力必须包含测试和文档。
- breaking change 必须在 PR 描述中明确标注。

### 24.7 Commit 与 PR 规范

建议使用 Conventional Commits：

```txt
feat(openai): support chat completion streaming
fix(config): improve yaml validation error message
docs(readme): add deepseek quick start example
test(zhipu): add glm tool call fixture
refactor(core): simplify scenario matcher
```

常用 type：

- `feat`
- `fix`
- `docs`
- `test`
- `refactor`
- `chore`
- `ci`
- `perf`

PR 必须包含：

- 变更说明。
- 影响范围。
- 测试说明。
- 文档更新情况。
- 是否影响兼容性。

### 24.8 Issue 分类

建议提供以下 Issue 类型：

- Bug Report
- Feature Request
- Provider Compatibility Request
- Documentation Improvement
- Question
- Good First Issue

Provider compatibility request 需要用户提供：

- Provider 名称。
- 官方文档链接。
- 请求样例。
- 响应样例。
- 是否需要 streaming。
- 是否需要 tool calling。
- 是否需要 embedding。

### 24.9 维护者角色

项目可以按职责划分维护者角色：

#### Core Maintainer

负责：

- 核心架构。
- Scenario Engine。
- 配置格式。
- 发布流程。
- 破坏性变更决策。

#### Provider Maintainer

负责：

- 某个或某类 Provider 的协议适配。
- Provider fixtures。
- Provider 文档。
- Provider 兼容性矩阵更新。

#### Docs Maintainer

负责：

- README。
- docs。
- examples。
- migration guide。

#### Release Maintainer

负责：

- changesets。
- npm 发布。
- Docker 镜像。
- GitHub Release。

### 24.10 新增 Provider 流程

新增 Provider 必须遵循固定流程：

1. 在 `docs/compatibility-matrix.md` 添加 Provider 状态。
2. 在 `src/providers/<provider>` 创建 provider adapter。
3. 添加 `preset.ts`，定义默认模型、路径和能力。
4. 实现 request parser。
5. 实现 response formatter。
6. 实现 error formatter。
7. 如支持流式，添加 stream formatter。
8. 添加 fixtures。
9. 添加 unit tests。
10. 添加 integration tests。
11. 添加 provider 文档。
12. 在 README 兼容矩阵中露出。

### 24.11 新增 Scenario 能力流程

新增 Scenario 能力必须判断是否属于核心能力。

如果多个 Provider 都适用：

- 放入 `src/core`。
- 更新 config schema。
- 更新 docs/config-reference.md。
- 添加 matcher/renderer 单元测试。

如果只对单个 Provider 适用：

- 放入对应 provider adapter。
- 不污染核心 schema，除非后续变成通用能力。
- 在 provider 文档说明限制。

### 24.12 版本管理

使用 SemVer：

- `patch`：bugfix、文档修复、兼容性增强。
- `minor`：新增 Provider、新增非破坏性配置能力。
- `major`：配置格式破坏性变更、API 破坏性变更、Node.js 最低版本提升。

使用 changesets：

```bash
npx changeset
```

每个影响用户行为的 PR 都应包含 changeset。

### 24.13 发布节奏

建议节奏：

- MVP 阶段：按功能完成发布，不固定周期。
- v0.x 阶段：每 1 到 2 周发布 minor。
- 稳定后：按月 minor，必要时 patch。

发布检查清单：

- CI 全绿。
- contract tests 通过。
- README 示例可运行。
- Docker 镜像可启动。
- changelog 完整。
- 兼容矩阵已更新。

### 24.14 CI 组织

GitHub Actions 建议包含：

```txt
ci.yml
  install
  lint
  typecheck
  test:unit
  test:integration
  build

release.yml
  changeset version
  npm publish
  docker publish
```

CI 命令建议：

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### 24.15 代码质量规则

基础规则：

- TypeScript strict mode。
- 禁止隐式 any。
- 核心层保持纯函数优先。
- Provider adapter 只做协议转换。
- 所有 public API 必须有类型导出。
- 错误消息必须可操作。
- 新增能力必须有测试。

建议工具：

- ESLint。
- Prettier。
- Vitest。
- tsup。
- publint。
- type-coverage。

### 24.16 文档组织责任

每个 Provider 至少需要：

- 快速开始。
- 请求路径。
- 支持能力。
- 配置示例。
- 普通响应示例。
- 流式响应示例。
- 错误响应示例。
- 已知限制。

每个核心能力至少需要：

- 概念说明。
- 最小配置。
- 完整配置。
- CLI 示例。
- 测试示例。

### 24.17 Examples 组织

示例应该可以独立运行：

```txt
examples/
  openai-sdk/
    package.json
    README.md
    index.ts
    mockmind.yaml
  deepseek/
  moonshot-kimi/
  aliyun-bailian/
  zhipu/
  ci-vitest/
  docker-compose/
```

每个 example 包含：

- `README.md`
- `mockmind.yaml`
- 最小代码示例
- 运行命令
- 预期输出

### 24.18 安全与隐私

虽然是 Mock Server，也需要明确安全边界：

- 默认只监听 `127.0.0.1`。
- 生产公网暴露需要用户显式配置。
- 请求记录默认可关闭。
- 请求记录支持脱敏配置。
- 不记录 Authorization header 明文，除非 debug 显式开启。
- 不内置真实 API key。
- 不默认转发真实请求。

### 24.19 Governance 后续规划

如果项目社区规模扩大，可以补充：

- Maintainer Guide。
- Provider ownership 表。
- RFC 流程。
- Security policy。
- Deprecation policy。
- Compatibility policy。

### 24.20 开发优先级建议

早期开发优先顺序：

1. 保持单 package，快速完成 MVP。
2. 先稳定核心类型和 Scenario Engine。
3. Provider adapter 保持薄层。
4. fixtures 和 contract tests 从第一天建立。
5. examples 与 README 同步维护。
6. v1.0 前再考虑 monorepo 拆分。

## 25. 一键支持所有 Provider Mock 服务

项目需要支持“一键启动所有提供商 mock 服务”的能力。用户不应该为每个 Provider 单独启动服务，而是通过一个统一进程同时暴露 OpenAI-compatible、国产厂商原生协议、Anthropic、Gemini 等所有已启用 Provider 的 mock endpoint。

### 25.1 目标体验

用户只需要执行：

```bash
mockmind start --all
```

或更简单：

```bash
mockmind start
```

即可启动所有内置 Provider 的 mock 服务。

启动后输出所有可用 Provider、baseURL 和示例路径：

```txt
MockMind running

Local:   http://127.0.0.1:4000
Health:  http://127.0.0.1:4000/health
Admin:   http://127.0.0.1:4000/__admin/requests

Enabled providers:
  OpenAI Compatible:
    baseURL: http://127.0.0.1:4000/v1
    chat:    POST /v1/chat/completions
    models:  GET  /v1/models

  DeepSeek:
    baseURL: http://127.0.0.1:4000/deepseek/v1
    alias:   http://127.0.0.1:4000/v1 with model deepseek-*

  Moonshot / Kimi:
    baseURL: http://127.0.0.1:4000/moonshot/v1

  阿里云百炼 OpenAI-compatible:
    baseURL: http://127.0.0.1:4000/compatible-mode/v1

  阿里云 DashScope Native:
    endpoint: POST /api/v1/services/aigc/text-generation/generation

  百度千帆:
    endpoint: POST /rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions

  腾讯混元:
    endpoint: POST /hunyuan/v1/chat/completions

  智谱 GLM:
    endpoint: POST /api/paas/v4/chat/completions

  火山方舟 / 豆包:
    endpoint: POST /api/v3/chat/completions

  MiniMax:
    endpoint: POST /v1/text/chatcompletion_v2

  Anthropic:
    endpoint: POST /v1/messages

  Gemini:
    endpoint: POST /v1beta/models/:model:generateContent
```

### 25.2 默认行为

默认 `mockmind start` 等价于：

```bash
mockmind start --providers all
```

默认启用：

- OpenAI-compatible 通用协议。
- 所有已实现的 Provider preset。
- 所有 Provider 的默认模型列表。
- 所有 Provider 的 fallback scenario。
- Admin API。
- Request recorder。

如果用户希望只启用部分 Provider，可以指定：

```bash
mockmind start --providers openai,deepseek,zhipu
mockmind start --providers chinese
mockmind start --providers international
mockmind start --providers openai-compatible
```

### 25.3 Provider Group

为了降低命令复杂度，提供 Provider Group。

```txt
all
  启用所有已实现 Provider。

openai-compatible
  启用 OpenAI-compatible 通用路由和相关国产厂商兼容 preset。

chinese
  启用国产厂商：DeepSeek、Kimi、百炼、千帆、混元、智谱、豆包、MiniMax、讯飞星火等。

international
  启用 OpenAI、Anthropic、Gemini。

native-chinese
  只启用国产厂商原生协议。
```

### 25.4 单端口多 Provider 路由

一键服务使用单端口、多路由设计。

```txt
http://127.0.0.1:4000
```

在同一个 HTTP 服务中注册所有 Provider 路由。

示例：

```txt
/v1/chat/completions                                      # OpenAI-compatible 通用入口
/deepseek/v1/chat/completions                            # DeepSeek namespaced 入口
/moonshot/v1/chat/completions                            # Kimi namespaced 入口
/compatible-mode/v1/chat/completions                     # 阿里百炼 OpenAI-compatible
/api/v1/services/aigc/text-generation/generation         # DashScope 原生
/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions    # 百度千帆原生
/hunyuan/v1/chat/completions                             # 腾讯混元 mock 入口
/api/paas/v4/chat/completions                            # 智谱 GLM
/api/v3/chat/completions                                 # 火山方舟 / 豆包
/v1/text/chatcompletion_v2                               # MiniMax
/v1/messages                                             # Anthropic
/v1beta/models/:model:generateContent                    # Gemini
```

### 25.5 Namespaced Provider BaseURL

除厂商原始路径外，还提供统一 namespace baseURL，方便本地调试时避免路径冲突。

```txt
/openai/v1
/deepseek/v1
/moonshot/v1
/zhipu/v1
/aliyun-bailian/compatible-mode/v1
/volcengine-ark/api/v3
/anthropic/v1
/gemini/v1beta
```

这样用户可以选择两种接入方式：

#### 方式一：模拟厂商真实路径

适合验证真实协议路径。

```txt
http://127.0.0.1:4000/api/paas/v4/chat/completions
```

#### 方式二：使用 namespaced 路径

适合本地同时调试多个 Provider。

```txt
http://127.0.0.1:4000/zhipu/api/paas/v4/chat/completions
```

### 25.6 OpenAI-compatible 智能分流

`/v1/chat/completions` 是通用 OpenAI-compatible 入口。

它可以根据 `model` 自动识别 Provider preset：

```txt
gpt-*                 -> openai
deepseek-*            -> deepseek
moonshot-*            -> moonshot
kimi-*                -> moonshot
qwen-*                -> aliyun-bailian
glm-*                 -> zhipu
doubao-*              -> volcengine-ark
abab*                 -> minimax
yi-*                  -> 01-ai
```

示例：

```json
{
  "model": "deepseek-chat",
  "messages": [
    { "role": "user", "content": "hello" }
  ]
}
```

请求 `/v1/chat/completions` 时，内部识别为：

```txt
provider: deepseek
protocol: openai-compatible
```

这样用户可以只配置一个 baseURL：

```ts
baseURL: "http://127.0.0.1:4000/v1"
```

然后通过模型名切换不同厂商 mock。

### 25.7 Provider 冲突处理

多 Provider 同时启用时，可能出现路由或模型名冲突。

处理原则：

1. 明确 namespace 路由优先。
2. 厂商原生路径优先于通用 OpenAI-compatible 路径。
3. scenario 中显式 `provider` 优先于模型名推断。
4. 模型名精确匹配优先于前缀匹配。
5. 如果仍然冲突，返回可操作错误。

冲突错误示例：

```json
{
  "error": {
    "message": "Ambiguous provider for model 'chat-model'. Please set scenario.provider or use a namespaced endpoint.",
    "type": "provider_resolution_error",
    "code": "ambiguous_provider"
  }
}
```

### 25.8 配置方式

#### 默认启用所有 Provider

```yaml
providers:
  enabled: all
```

#### 启用指定 Provider

```yaml
providers:
  enabled:
    - openai
    - deepseek
    - moonshot
    - zhipu
```

#### 启用 Provider Group

```yaml
providers:
  enabled: chinese
```

#### Provider 级配置

```yaml
providers:
  enabled: all
  presets:
    deepseek:
      enabled: true
      basePath: /deepseek/v1
      compatiblePath: /v1
      models:
        - deepseek-chat
        - deepseek-reasoner
    aliyun-bailian:
      enabled: true
      compatiblePath: /compatible-mode/v1
      nativePath: /api/v1/services/aigc
```

### 25.9 一键初始化所有 Provider 配置

提供命令：

```bash
mockmind init --all
```

生成包含所有 Provider 的示例配置：

```txt
mockmind.yaml
```

包含：

- 所有 Provider 默认模型。
- 每个 Provider 一个基础 chat scenario。
- 每个 Provider 一个 stream scenario。
- 每个 Provider 一个 error scenario。
- OpenAI-compatible 通用 fallback scenario。
- Admin API 配置。

也支持生成精简配置：

```bash
mockmind init --all --minimal
```

只生成：

- Provider enabled 配置。
- 默认模型列表。
- 一个全局 fallback scenario。

### 25.10 Fallback Scenario

为了支持一键启动后“任何 Provider 都能立即返回”，需要提供默认 fallback。

```yaml
fallback:
  enabled: true
  response:
    type: text
    content: "This is a default mock response from mockmind."
```

Provider 级 fallback：

```yaml
fallbacks:
  openai:
    content: "This is a mock OpenAI-compatible response."
  deepseek:
    content: "This is a mock DeepSeek response."
    reasoningContent: "This is mock reasoning content."
  aliyun-bailian:
    content: "这是模拟的通义千问响应。"
```

匹配优先级：

1. 精确 scenario。
2. Provider fallback。
3. Global fallback。
4. 返回 404 mock scenario not found。

### 25.11 一键服务的启动模式

#### 开发模式

```bash
mockmind start --all --watch
```

特点：

- 配置热加载。
- 人类可读日志。
- 请求记录开启。
- strict auth 关闭。

#### CI 模式

```bash
mockmind start --all --ci
```

特点：

- 非交互输出。
- deterministic mode 开启。
- JSON 日志。
- 固定 seed。
- 启动失败直接非零退出。

#### Docker 模式

```bash
docker run -p 4000:4000 ghcr.io/<owner>/mockmind:latest
```

默认启动所有 Provider。

挂载配置：

```bash
docker run \
  -p 4000:4000 \
  -v "$PWD/mockmind.yaml:/app/mockmind.yaml" \
  ghcr.io/<owner>/mockmind:latest \
  start --config /app/mockmind.yaml --all
```

### 25.12 Admin API 中的 Provider 管理

新增接口：

```txt
GET  /__admin/providers
GET  /__admin/providers/:provider
POST /__admin/providers/:provider/enable
POST /__admin/providers/:provider/disable
GET  /__admin/routes
```

`GET /__admin/providers` 示例：

```json
{
  "enabled": ["openai", "deepseek", "moonshot", "aliyun-bailian", "zhipu"],
  "disabled": ["anthropic", "gemini"],
  "groups": {
    "chinese": ["deepseek", "moonshot", "aliyun-bailian", "baidu-qianfan", "tencent-hunyuan", "zhipu", "volcengine-ark", "minimax"],
    "international": ["openai", "anthropic", "gemini"]
  }
}
```

### 25.13 一键能力的实现设计

核心概念：Provider Registry。

```ts
type ProviderRegistration = {
  provider: Provider;
  displayName: string;
  groups: ProviderGroup[];
  preset: ProviderPreset;
  registerRoutes: (context: ProviderContext) => Promise<void> | void;
  resolveModel?: (model: string) => boolean;
};
```

启动流程：

1. 加载配置。
2. 解析 `providers.enabled`。
3. 从 Provider Registry 选出需要启用的 Provider。
4. 注册 Provider 原生路由。
5. 注册 namespaced 路由。
6. 注册 OpenAI-compatible 通用入口。
7. 注册 Admin API。
8. 输出启动摘要。

### 25.14 MVP 中的一键支持范围

`v0.1.0` 的“一键所有 Provider”不要求完整实现所有原生协议，但要建立机制。

MVP 必须做到：

- `mockmind start` 默认启用所有已实现 Provider。
- `mockmind start --all` 显式启用所有已实现 Provider。
- `mockmind start --providers openai,deepseek,zhipu` 启用指定 Provider。
- Provider Registry。
- Provider Group。
- OpenAI-compatible 智能模型分流。
- Global fallback。
- Provider fallback。
- `/__admin/providers`。
- 启动时打印 enabled providers。

MVP 可先支持这些 Provider preset：

- OpenAI
- DeepSeek
- Moonshot / Kimi
- 阿里云百炼 OpenAI-compatible
- 智谱 GLM OpenAI-compatible
- 火山方舟 / 豆包 OpenAI-compatible

后续版本逐步补充原生协议。

### 25.15 README 中的一键启动示例

README 首页需要突出：

```bash
npx mockmind start --all
```

或安装后：

```bash
npm install -g mockmind
mockmind start
```

然后立即可用：

```bash
curl http://127.0.0.1:4000/v1/chat/completions \
  -H 'Authorization: Bearer test-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role":"user","content":"hello"}]
  }'
```

预期返回：

```json
{
  "id": "chatcmpl_mock_0001",
  "object": "chat.completion",
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "This is a mock DeepSeek response."
      },
      "finish_reason": "stop"
    }
  ]
}
```

## 26. 第一阶段范围调整：多原生协议 MVP

根据项目目标调整，第一阶段不只做 OpenAI-compatible，还需要同时纳入 Anthropic、Gemini 和 DashScope 原生协议。这样 `v0.1.0` 从一开始就是一个真正的多协议 Mock Server，而不是单一 OpenAI-compatible 服务。

### 26.1 调整后的第一阶段目标

`v0.1.0` 目标：一个命令启动多个主流协议的 Mock 服务。

必须支持：

- OpenAI-compatible API。
- 国产 OpenAI-compatible Provider preset。
- Anthropic Messages API 原生协议。
- Gemini generateContent 原生协议。
- 阿里云 DashScope / 百炼原生协议。
- 一键启动所有已实现 Provider。
- YAML scenario 配置。
- 普通响应和流式响应。
- 错误、延迟、fallback。
- Admin API 和请求记录。

### 26.2 v0.1.0 Provider 范围

#### OpenAI-compatible

路由：

```txt
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings
```

必须支持：

- 非流式 chat completion。
- SSE 流式 chat completion。
- tool calls。
- usage mock。
- error mock。
- latency mock。

#### 国产 OpenAI-compatible Presets

第一阶段通过 OpenAI-compatible 入口支持：

- DeepSeek
- Moonshot / Kimi
- 阿里云百炼 OpenAI-compatible
- 智谱 GLM OpenAI-compatible
- 火山方舟 / 豆包 OpenAI-compatible

必须支持模型名自动分流：

```txt
deepseek-* -> deepseek
moonshot-* / kimi-* -> moonshot
glm-* -> zhipu
qwen-* -> aliyun-bailian
doubao-* -> volcengine-ark
```

#### Anthropic 原生协议

路由：

```txt
POST /v1/messages
POST /anthropic/v1/messages
```

必须支持：

- Messages API 非流式响应。
- Messages API SSE 流式响应。
- content block。
- `stop_reason`。
- usage。
- Anthropic 风格错误响应。

第一阶段可暂缓：

- tool use 深度模拟。
- image content block。
- prompt caching 字段。

#### Gemini 原生协议

路由：

```txt
POST /v1beta/models/:model:generateContent
POST /v1beta/models/:model:streamGenerateContent
POST /gemini/v1beta/models/:model:generateContent
POST /gemini/v1beta/models/:model:streamGenerateContent
```

必须支持：

- `generateContent` 非流式响应。
- `streamGenerateContent` 流式响应。
- `contents[].parts[].text`。
- candidates。
- finishReason。
- usageMetadata。
- Gemini 风格错误响应。

第一阶段可暂缓：

- function calling 深度模拟。
- safety settings 完整行为。
- multimodal parts。

#### DashScope / 阿里云百炼原生协议

路由：

```txt
POST /api/v1/services/aigc/text-generation/generation
POST /dashscope/api/v1/services/aigc/text-generation/generation
```

必须支持：

- 通义千问文本生成非流式响应。
- DashScope 原生 streaming。
- `input.messages`。
- `parameters.result_format = message`。
- `output.choices[].message.content`。
- `usage.input_tokens` / `usage.output_tokens` / `usage.total_tokens`。
- DashScope 风格错误响应。

第一阶段可暂缓：

- 多模态输入。
- async task。
- batch。
- embedding 原生协议。

### 26.3 调整后的 v0.1.0 路由清单

```txt
# Health / Admin
GET  /health
GET  /__admin/config
GET  /__admin/models
GET  /__admin/providers
GET  /__admin/scenarios
GET  /__admin/requests
POST /__admin/reset
POST /__admin/reload

# OpenAI-compatible
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings

# Anthropic native
POST /v1/messages
POST /anthropic/v1/messages

# Gemini native
POST /v1beta/models/:model:generateContent
POST /v1beta/models/:model:streamGenerateContent
POST /gemini/v1beta/models/:model:generateContent
POST /gemini/v1beta/models/:model:streamGenerateContent

# DashScope native
POST /api/v1/services/aigc/text-generation/generation
POST /dashscope/api/v1/services/aigc/text-generation/generation

# Aliyun Bailian OpenAI-compatible
POST /compatible-mode/v1/chat/completions
```

### 26.4 调整后的第一阶段项目结构

```txt
src/
  providers/
    openai/
      routes.ts
      adapter.ts
      stream.ts
      errors.ts
      preset.ts
    openai-compatible/
      resolver.ts
      presets.ts
    deepseek/
      preset.ts
    moonshot/
      preset.ts
    aliyun-bailian/
      compatible.ts
      dashscope.ts
      stream.ts
      errors.ts
      preset.ts
    zhipu/
      preset.ts
    volcengine-ark/
      preset.ts
    anthropic/
      routes.ts
      adapter.ts
      stream.ts
      errors.ts
      preset.ts
    gemini/
      routes.ts
      adapter.ts
      stream.ts
      errors.ts
      preset.ts
```

说明：

- `openai` 实现标准 OpenAI-compatible 响应格式。
- `openai-compatible` 负责模型名到 Provider preset 的分流。
- `aliyun-bailian/compatible.ts` 负责百炼 OpenAI-compatible 路径。
- `aliyun-bailian/dashscope.ts` 负责 DashScope 原生协议。
- `anthropic` 和 `gemini` 在第一阶段直接作为原生协议 Provider 实现。

### 26.5 调整后的第一阶段配置示例

```yaml
server:
  host: 127.0.0.1
  port: 4000

providers:
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
    content: "This is a default mock response from mockmind."

scenarios:
  - id: openai-basic
    provider: openai
    endpoint: /v1/chat/completions
    match:
      model: gpt-4o-mini
    response:
      type: text
      content: "Hello from OpenAI-compatible mock."

  - id: deepseek-reasoning
    provider: deepseek
    endpoint: /v1/chat/completions
    match:
      model: deepseek-reasoner
    response:
      type: text
      reasoningContent: "This is mock reasoning content."
      content: "This is the final DeepSeek mock answer."

  - id: anthropic-basic
    provider: anthropic
    endpoint: /v1/messages
    match:
      model: claude-3-5-sonnet-latest
    response:
      type: text
      content: "Hello from mock Anthropic."

  - id: gemini-basic
    provider: gemini
    endpoint: /v1beta/models/:model:generateContent
    match:
      model: gemini-1.5-pro
    response:
      type: text
      content: "Hello from mock Gemini."

  - id: dashscope-basic
    provider: aliyun-bailian
    endpoint: /api/v1/services/aigc/text-generation/generation
    match:
      model: qwen-plus
    response:
      type: text
      content: "你好，我是模拟的 DashScope 原生响应。"
```

### 26.6 调整后的 MVP 任务清单

1. 初始化 TypeScript + Fastify 项目。
2. 初始化 CLI：`start`、`init`、`validate`。
3. 实现 config loader 和 schema。
4. 实现 Provider Registry。
5. 实现 Provider Group：`all`、`chinese`、`international`、`openai-compatible`。
6. 实现 Scenario Store。
7. 实现 Scenario Matcher。
8. 实现 Renderer：text、json、stream、error、tool_call、embedding。
9. 实现 fallback 机制。
10. 实现 request recorder。
11. 实现 Admin API。
12. 实现 OpenAI `/v1/models`。
13. 实现 OpenAI `/v1/chat/completions` 非流式。
14. 实现 OpenAI `/v1/chat/completions` SSE 流式。
15. 实现 OpenAI `/v1/embeddings` mock。
16. 实现 OpenAI-compatible 模型名智能分流。
17. 实现 DeepSeek reasoning content 响应变体。
18. 实现 Kimi / Moonshot preset。
19. 实现 智谱 GLM preset。
20. 实现 火山方舟 / 豆包 preset。
21. 实现 百炼 OpenAI-compatible 路径。
22. 实现 Anthropic `/v1/messages` 非流式。
23. 实现 Anthropic `/v1/messages` SSE 流式。
24. 实现 Anthropic 错误格式。
25. 实现 Gemini `generateContent` 非流式。
26. 实现 Gemini `streamGenerateContent` 流式。
27. 实现 Gemini 错误格式。
28. 实现 DashScope text-generation 非流式。
29. 实现 DashScope text-generation 流式。
30. 实现 DashScope 错误格式。
31. 实现 `mockmind init --all` 生成多协议示例配置。
32. 实现 `mockmind start --all` 一键启动全部已实现 Provider。
33. 添加 contract fixtures。
34. 添加 unit tests。
35. 添加 integration tests。
36. 添加 README 多协议快速开始。
37. 添加 Dockerfile。
38. 添加 GitHub Actions CI。
39. 准备 `v0.1.0` 发布。

### 26.7 第一阶段验收标准

启动：

```bash
mockmind start --all
```

必须同时可用：

```bash
curl http://127.0.0.1:4000/v1/chat/completions
curl http://127.0.0.1:4000/v1/messages
curl http://127.0.0.1:4000/v1beta/models/gemini-1.5-pro:generateContent
curl http://127.0.0.1:4000/api/v1/services/aigc/text-generation/generation
```

SDK 兼容：

- OpenAI SDK 可调用 OpenAI-compatible mock。
- Anthropic SDK 可调用 Anthropic mock。
- Gemini SDK 可调用 Gemini mock。
- DashScope 原生 HTTP 示例可调用 DashScope mock。

配置能力：

- YAML scenario 可以分别匹配 OpenAI、Anthropic、Gemini、DashScope。
- 每种协议都支持 fallback。
- 每种协议都支持错误模拟。
- 每种协议都支持流式响应。

测试能力：

- 每种协议至少有一个非流式 integration test。
- 每种协议至少有一个流式 integration test。
- 每种协议至少有一个错误响应 contract test。

### 26.8 第一阶段风险与控制

风险：第一阶段协议范围扩大，可能导致 MVP 过重。

控制方式：

- 每个原生协议只实现核心 chat/text generation 路径。
- 不做多模态。
- 不做复杂 tool/function calling。
- 不做真实云厂商签名。
- 不做 async task。
- 不做 Web UI。
- 不做 monorepo 拆分。
- 先保证统一核心和 contract fixtures。

### 26.9 更新后的第一阶段优先顺序

推荐按以下顺序开发：

1. 核心框架、配置、Provider Registry。
2. OpenAI-compatible 非流式和流式。
3. Scenario Engine 和 fallback。
4. Admin API 和 request recorder。
5. Anthropic 非流式和流式。
6. Gemini 非流式和流式。
7. DashScope 非流式和流式。
8. 国产 OpenAI-compatible presets。
9. Contract fixtures 和 integration tests。
10. CLI init、validate、README、Docker、CI。

## 27. GitHub 开源发布就绪计划

本章节用于补齐 MockMind 从“本地可运行项目”到“可以正式在 GitHub 开源”的工程化、文档、治理、发布和社区准备工作。

### 27.1 当前已具备基础

当前项目已经具备开源 MVP 的基础雏形：

- TypeScript + Fastify 项目骨架。
- CLI 基础命令：`start`、`init`、`validate`。
- OpenAI-compatible mock 路由。
- Anthropic、Gemini、DashScope 最小原生协议路由。
- YAML 配置加载和 Zod 校验。
- Scenario Matcher、Renderer、Fallback、Recorder。
- Provider Registry 作为协议目录和 Admin 元数据来源。
- Admin API：配置、模型、Provider、路由、场景、请求记录。
- Programmatic API：`createMockLLMServer`。
- README 初版、Dockerfile、GitHub Actions CI 初版。
- 单元测试和集成测试草稿。

### 27.2 GitHub 开源前必须补齐

#### 仓库基础文件

必须补齐：

- `LICENSE`：建议使用 MIT，降低采用门槛。
- `CONTRIBUTING.md`：说明本地开发、测试、PR 规范、新增 Provider 流程。
- `CODE_OF_CONDUCT.md`：建议采用 Contributor Covenant。
- `SECURITY.md`：说明安全问题报告方式、支持版本、安全边界。
- `CHANGELOG.md`：初始版本记录，可后续交给 changesets 维护。
- `.npmignore` 或 package `files`：确保 npm 包只发布必要内容。
- `.editorconfig`：统一基础编辑器行为。
- `.env.example`：如后续需要环境变量，再提供示例。

#### GitHub 模板

必须补齐：

```txt
.github/
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
    provider_request.md
    documentation.md
  PULL_REQUEST_TEMPLATE.md
```

Provider Request 模板必须要求用户提供：

- Provider 名称。
- 官方文档链接。
- 请求样例。
- 响应样例。
- 是否需要 streaming。
- 是否需要 tool/function calling。
- 是否需要 embeddings。
- SDK 或 curl 复现方式。

#### README 发布级内容

README 首页需要达到“用户 3 分钟上手”的标准。

必须包含：

- 项目一句话介绍。
- 适用场景和不适用场景。
- 安装方式：`npx`、全局安装、本地开发。
- 最短启动命令。
- OpenAI SDK 最小接入示例。
- Anthropic / Gemini / DashScope 最小 curl 示例。
- YAML scenario 最小配置示例。
- 流式响应示例。
- 错误模拟示例。
- Admin API 简介。
- Provider 兼容矩阵。
- Roadmap 链接。
- Contributing 链接。
- License。

README 中需要明确：

- MockMind 不实现真实推理。
- MockMind 不默认代理真实 LLM 请求。
- MockMind 默认监听 `127.0.0.1`。
- 默认启动所有已实现协议。
- `providers.enabled` 当前是 metadata，不是启停开关。

#### 文档目录

开源发布前建议至少补齐：

```txt
docs/
  getting-started.md
  config-reference.md
  scenario-matching.md
  streaming.md
  errors.md
  admin-api.md
  programmatic-api.md
  provider-registry.md
  adding-provider.md
  compatibility-matrix.md
  roadmap.md
```

其中 MVP 必须优先完成：

1. `getting-started.md`
2. `config-reference.md`
3. `compatibility-matrix.md`
4. `adding-provider.md`

### 27.3 工程质量必须补齐

#### 依赖与锁文件

开源发布前必须生成并提交：

- `package-lock.json`。
- 确保 `npm ci` 可稳定安装。
- 避免全部依赖使用 `latest`，发布前固定合理 semver 范围。

建议：

```json
{
  "dependencies": {
    "fastify": "^5.x",
    "zod": "^4.x",
    "yaml": "^2.x",
    "commander": "^14.x"
  }
}
```

具体版本以实际安装验证结果为准。

#### TypeScript 与构建

必须保证：

```bash
npm run typecheck
npm test
npm run build
```

全部通过。

必须检查：

- ESM/CJS 导出是否正确。
- CLI bin 是否有 shebang。
- `dist/cli/index.js` 是否可直接作为 bin 运行。
- `types` 是否正确生成。
- Node.js 20 环境下可运行。

#### Lint 与 Format

建议补齐：

- ESLint。
- Prettier。
- `npm run lint`。
- `npm run format:check`。
- CI 中加入 lint 和 format check。

MVP 可以先不追求复杂规则，但至少保证：

- TypeScript strict。
- 禁止未使用变量。
- 禁止隐式 any。
- 统一格式。

#### 测试覆盖

开源发布前最低测试要求：

- Config loader/schema unit tests。
- Scenario matcher unit tests。
- Provider Registry unit tests。
- OpenAI 非流式 integration test。
- OpenAI 流式 integration test。
- OpenAI error integration test。
- Anthropic 非流式 integration test。
- Gemini 非流式 integration test。
- DashScope 非流式 integration test。
- Admin requests integration test。
- CLI `init` / `validate` smoke tests。

建议增加 contract fixtures：

```txt
test/fixtures/
  openai/
  anthropic/
  gemini/
  dashscope/
```

每个 Provider 至少包含：

- basic request fixture。
- basic response fixture。
- stream events fixture。
- error response fixture。

#### CI

GitHub Actions 必须包含：

```txt
install
lint
typecheck
test
build
```

建议矩阵：

- Node.js 20。
- Node.js 22。

发布前 CI 必须能在 clean checkout 中通过。

### 27.4 npm 发布准备

#### package.json 必须完善

必须补齐：

- `name`。
- `version`。
- `description`。
- `keywords`。
- `homepage`。
- `repository`。
- `bugs`。
- `license`。
- `author` 或 `contributors`。
- `engines`。
- `bin`。
- `files`。
- `exports`。
- `sideEffects`。

建议 keywords：

```txt
llm
mock-server
openai
anthropic
gemini
dashscope
fastify
testing
agent
rag
sdk-testing
```

#### exports 设计

建议：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

#### 发布检查命令

发布前必须执行：

```bash
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

### 27.5 Docker 发布准备

必须补齐：

- `.dockerignore`。
- Dockerfile 多阶段构建验证。
- 镜像默认监听 `0.0.0.0`。
- README Docker 启动示例。
- Docker healthcheck。

建议 Dockerfile 中添加：

```dockerfile
HEALTHCHECK CMD wget -qO- http://127.0.0.1:4000/health || exit 1
```

GitHub Container Registry 后续发布：

```txt
ghcr.io/<owner>/mockmind
```

### 27.6 安全与隐私发布要求

必须明确安全边界：

- 默认只监听 `127.0.0.1`。
- Docker 模式才默认监听 `0.0.0.0`。
- 不内置真实 API key。
- 不默认转发真实 LLM 请求。
- Request Recorder 不应记录 Authorization 明文。
- Debug 模式如允许记录敏感 header，必须显式开启。
- Admin API 默认只适合本地开发和 CI，不建议公网暴露。

需要实现或确认：

- Recorder 对 `authorization`、`x-api-key`、`api-key` 脱敏。
- README / SECURITY 中说明公网暴露风险。
- Docker 文档提醒不要直接公网暴露 Admin API。

### 27.7 API 与配置稳定性

开源发布前需要明确哪些是稳定 API：

- CLI 命令：`start`、`init`、`validate`。
- HTTP API：OpenAI-compatible、Anthropic、Gemini、DashScope 最小路径。
- Admin API：标记为 experimental。
- YAML 配置格式：v0.x 期间允许小幅调整。
- Programmatic API：标记为 experimental。

README 中建议写明：

```txt
MockMind is pre-1.0. Configuration fields and Admin APIs may evolve between minor versions.
```

### 27.8 首批 GitHub Issues 建议

开源时可以预置 Good First Issue：

- Add OpenAI stream contract fixtures。
- Add Anthropic error contract fixtures。
- Improve config validation error messages。
- Add MiniMax OpenAI-compatible preset。
- Add docs for scenario priority。
- Add request header redaction tests。
- Add Docker Compose example。

### 27.9 开源发布前最终 Checklist

#### 必须完成

- [ ] `LICENSE`
- [ ] `CONTRIBUTING.md`
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `SECURITY.md`
- [ ] `CHANGELOG.md`
- [ ] Issue / PR templates
- [ ] README 发布级改写
- [ ] docs 最小文档集
- [ ] package metadata / exports / keywords
- [ ] 固定依赖版本并提交 lockfile
- [ ] `npm run typecheck` 通过
- [ ] `npm test` 通过
- [ ] `npm run build` 通过
- [ ] `npm pack --dry-run` 检查通过
- [ ] Dockerfile 构建通过
- [ ] `.dockerignore`
- [ ] CI clean checkout 通过
- [ ] Recorder 敏感 header 脱敏
- [ ] Admin API 风险说明

#### 强烈建议完成

- [ ] ESLint + Prettier
- [ ] OpenAI stream integration test
- [ ] Provider contract fixtures
- [ ] Docker Compose example
- [ ] `docs/adding-provider.md`
- [ ] `docs/compatibility-matrix.md`
- [ ] release workflow 草稿
- [ ] changesets 初始化

#### 可以 v0.2 后做

- [ ] Web UI
- [ ] Request replay
- [ ] Hot reload
- [ ] 动态新增 scenario
- [ ] 完整 provider plugin 机制
- [ ] 原生百度/腾讯/智谱协议
- [ ] 多模态协议 mock

### 27.10 推荐下一步执行顺序

为了最快达到 GitHub 开源标准，建议按以下顺序推进：

1. 补齐 `LICENSE`、`CONTRIBUTING.md`、`SECURITY.md`、GitHub templates。
2. 完善 `package.json` metadata、exports、keywords。
3. 固定依赖版本，生成 `package-lock.json`。
4. 实现 Recorder 敏感 header 脱敏。
5. 补 OpenAI stream/error、Anthropic/Gemini/DashScope error 的 integration tests。
6. 增加最小 docs：getting started、config reference、compatibility matrix、adding provider。
7. 增加 `.dockerignore` 和 Docker healthcheck。
8. 本地跑通 typecheck/test/build。
9. 改写 README 为发布级首页。
10. 初始化 changesets，准备 v0.1.0 release。
