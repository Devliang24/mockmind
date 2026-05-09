# Admin API

MockMind exposes Admin API endpoints for the web console and local tooling. These endpoints are implementation-owned by MockMind; provider mock routes are documented separately in [mock-api.md](./mock-api.md).

Base URL examples use `http://127.0.0.1:4000`. Admin API endpoints do not require provider API keys.

## `GET /__admin/overview`

Returns server summary data for the console landing state.

Parameters: none.

Response fields:

- `ok`: always `true` for a healthy Admin API response.
- `name`: service name, currently `mockmind`.
- `version`: package version detected at runtime.
- `server`: configured `{ host, port }`.
- `auth`: current auth mode.
- `providers`: provider configuration metadata.
- `providersCount`, `modelsCount`, `scenariosCount`, `requestsCount`: aggregate counts.
- `recentRequests`: up to the last 10 recorded request entries.

Example:

```json
{
  "ok": true,
  "name": "mockmind",
  "version": "0.1.0",
  "server": { "host": "127.0.0.1", "port": 4000 },
  "auth": { "mode": "permissive" },
  "providers": { "enabled": "all" },
  "providersCount": 8,
  "modelsCount": 1,
  "scenariosCount": 1,
  "requestsCount": 0,
  "recentRequests": []
}
```

Error behavior: normal Fastify 5xx error handling if server state cannot be read.

Frontend usage: displays top-level counts and recent request activity.

## `GET /__admin/providers`

Returns provider identity, auth hints, model lists, groups, and route summaries.

Parameters: none.

Response fields:

- `mode`: currently `all`.
- `providers[].provider`: stable provider id.
- `providers[].displayName`: display label for UI navigation.
- `providers[].groups`: grouping tags such as `international`, `chinese`, `native`, and `openai-compatible`.
- `providers[].auth`: auth scheme, label, header names, and query names used in examples.
- `providers[].defaultModels`: default model ids shipped with the provider preset.
- `providers[].latestModels`: preferred model ids for current examples.
- `providers[].configuredModels`: model ids from the active config for this provider.
- `providers[].routes`: human-readable route summaries.
- `groups`: provider ids grouped by provider group.

Example:

```json
{
  "mode": "all",
  "providers": [
    {
      "provider": "openai",
      "displayName": "OpenAI",
      "groups": ["international", "openai-compatible"],
      "auth": {
        "scheme": "authorization-bearer",
        "label": "Authorization: Bearer 123456",
        "headers": ["Authorization"],
        "query": []
      },
      "defaultModels": ["gpt-5.5"],
      "latestModels": ["gpt-5.5"],
      "configuredModels": ["gpt-5.5"],
      "routes": ["POST /v1/chat/completions Chat Completions"]
    }
  ],
  "groups": {
    "chinese": [],
    "international": ["openai"],
    "openai-compatible": ["openai"],
    "native": []
  }
}
```

Error behavior: normal Fastify 5xx error handling if provider metadata cannot be read.

Frontend usage: renders provider navigation, model options, auth examples, and provider metadata tables.

## `GET /__admin/routes`

Returns structured route metadata for all registered mock API routes.

Parameters: none.

Response fields:

- `provider`: stable provider id.
- `displayName`: provider display label.
- `groups`: provider group tags.
- `auth`: auth scheme, label, header names, and query names.
- `method`: HTTP method.
- `path`: route path as registered by MockMind.
- `protocol`: internal protocol adapter id.
- `endpoint`: logical endpoint id.
- `description`: human-readable endpoint description.

Example:

```json
[
  {
    "provider": "openai",
    "displayName": "OpenAI",
    "groups": ["international", "openai-compatible"],
    "auth": {
      "scheme": "authorization-bearer",
      "label": "Authorization: Bearer 123456",
      "headers": ["Authorization"],
      "query": []
    },
    "method": "POST",
    "path": "/v1/chat/completions",
    "protocol": "openai-compatible",
    "endpoint": "chat.completions",
    "description": "Chat Completions"
  }
]
```

Error behavior: normal Fastify 5xx error handling if route metadata cannot be read.

Frontend usage: renders endpoint tables and example request builders.

## `GET /__admin/models`

Returns configured models with provider display labels.

Parameters: none.

Response fields:

- `data[].id`: model id.
- `data[].provider`: provider id.
- `data[].displayName`: provider display label.

Example:

```json
{
  "data": [
    { "id": "gpt-5.5", "provider": "openai", "displayName": "OpenAI" }
  ]
}
```

Error behavior: normal Fastify 5xx error handling if config cannot be read.

Frontend usage: shows configured model chips and model picker defaults.

## `GET /__admin/scenarios`

Returns configured scenarios.

Parameters: none.

Response fields:

- `id`: scenario id.
- `provider`: optional provider id.
- `endpoint`: optional endpoint path.
- `priority`: scenario priority.
- `match`: optional match criteria.
- `response`: configured mock response.

Example:

```json
[
  {
    "id": "hello",
    "provider": "openai",
    "endpoint": "/v1/chat/completions",
    "priority": 0,
    "match": { "messagesContain": "hello" },
    "response": { "type": "text", "content": "hi" }
  }
]
```

Error behavior: normal Fastify 5xx error handling if scenario storage cannot be read.

Frontend usage: correlates request records with configured scenario metadata.

## `GET /__admin/requests`

Returns recorded mock requests from the active recorder. The default recorder is memory-backed; SQLite-backed recording uses the same response shape.

Parameters: none.

Response fields:

- `id`: stable request record id for this recorder instance.
- `provider`: provider id.
- `endpoint`: logical endpoint id or route path.
- `model`: optional model id.
- `matchedScenarioId`: optional matched scenario id.
- `status`: HTTP status returned to the client.
- `durationMs`: handling duration in milliseconds.
- `stream`: whether the request used streaming response behavior.
- `request`: normalized request metadata, including method, headers, query, and raw body.
- `responseBody`: captured response body when available.

Example:

```json
[
  {
    "id": "req_1",
    "provider": "openai",
    "endpoint": "/v1/chat/completions",
    "model": "gpt-5.5",
    "status": 200,
    "durationMs": 2,
    "stream": false,
    "request": {
      "provider": "openai",
      "endpoint": "/v1/chat/completions",
      "method": "POST",
      "model": "gpt-5.5",
      "rawBody": { "model": "gpt-5.5", "messages": [] },
      "headers": { "authorization": "Bearer 123456" },
      "query": {}
    },
    "responseBody": { "id": "chatcmpl_mock_0001" }
  }
]
```

Error behavior: normal Fastify 5xx error handling if recorder storage cannot be read.

Frontend usage: renders request table, request detail drawer, cURL reconstruction, and captured response bodies.

## `POST /__admin/reset`

Clears recorded requests from the active recorder. For SQLite recorders, persisted rows are deleted as well.

Parameters: none.

Response fields:

- `ok`: always `true` after reset succeeds.

Example:

```json
{ "ok": true }
```

Error behavior: normal Fastify 5xx error handling if recorder storage cannot be cleared.

Frontend usage: local tooling can clear request history before a focused test run.
