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
- **提供商**：Provider 分组、模型、路由摘要和官方文档链接。
- **路由**：已注册路由，并提供可复制的 cURL 示例。
- **模型**：模型到 Provider 的归属关系。
- **场景**：已加载场景、匹配规则、优先级和响应类型。
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
