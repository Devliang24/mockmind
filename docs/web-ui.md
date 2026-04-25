# Web UI

MockMind 内置一个轻量 Web 控制台，用于本地调试。

## 访问方式

启动服务：

```bash
npm run dev -- start --config mockmind.yaml --port 4000
```

打开：

```txt
http://127.0.0.1:4000/__ui
```

根路径 `/` 会重定向到 `/__ui`。

## 页面

- **概览**：健康状态、版本、服务配置、统计数量和最近请求。
- **供应商**：按国外优先、国内随后排序展示 Provider；点击供应商后查看协议菜单、端点、必填项、请求 Body、响应 Body 和官方文档。
- **请求记录**：已记录请求和原始请求详情。

## 使用的 Admin API

- `GET /health`
- `GET /__admin/overview`
- `GET /__admin/providers`
- `GET /__admin/routes`
- `GET /__admin/models`
- `GET /__admin/scenarios`
- `GET /__admin/requests`

UI 保持静态、无前端框架，不编辑 YAML 配置，也不会调用真实 LLM Provider。

## 展示范围

Web UI 第一版展示 Chat、Responses、Embeddings、Rerank、Anthropic Messages、Gemini generateContent / streamGenerateContent、DashScope Text Generation 和 MiniMax ChatCompletion v2。OpenAI Images、Audio、Moderations、Files、Batch 后端仍可调用，但 UI 暂不展示。

## 供应商排序

国外优先：OpenAI、Anthropic、Gemini。国内随后：DeepSeek、Moonshot / Kimi、智谱 GLM、DashScope / 阿里百炼、MiniMax。
