# Architecture

MockMind is organized around three layers:

```txt
Core Scenario Engine
  +
Protocol Adapters
  +
Provider Registry
```

## Core

`src/core` is provider-neutral. It owns:

- Scenario types
- Scenario store
- Scenario matcher
- Renderer
- Recorder
- Auth mock

Core receives a unified `MockRequest` and returns a unified `MockResult`.

## Protocols

`src/protocols` contains protocol-specific formatting and request handling.

Current protocols:

- `openai-compatible`
- `anthropic-messages`
- `gemini-generate-content`
- `dashscope-generation`
- `minimax-chat`

Protocol handlers convert provider HTTP requests into `MockRequest`, invoke the scenario engine, and format `MockResult` back into provider-shaped responses.

## Providers

`src/providers` contains provider metadata and route bindings.

Each provider should expose:

```txt
providers/<provider>/
  index.ts
  preset.ts
  routes.ts
```

Provider responsibilities:

- Provider id
- Display name
- Groups
- Default models
- Model patterns
- Route metadata
- Route registration

Provider code should not duplicate protocol formatting logic. It should bind routes to protocol handlers.

## Registry

`src/providers/registry.ts` imports all provider registrations and exposes:

- `providerRegistry`
- `providerGroups()`
- `resolveProviderByModel()`
- `registerAllProviderRoutes()`

The server registers routes from provider metadata through `registerProviderRoutes()`.
