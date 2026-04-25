# Protocols

Protocols live under `src/protocols` and are reusable across providers.

## Current Protocols

- `openai-compatible`
- `openai-embeddings`
- `anthropic-messages`
- `gemini-generate-content`
- `dashscope-generation`
- `minimax-chat`

## Protocol Handler Flow

1. Parse provider HTTP request.
2. Build unified `MockRequest`.
3. Match scenario.
4. Render `MockResult`.
5. Format provider-specific response.
6. Record request in recorder.

## Adding a Protocol

Create:

```txt
src/protocols/<protocol>/
  adapter.ts
  stream.ts
  handler.ts
```

Then add the protocol id to `src/protocols/types.ts` and register the handler in `src/protocols/registry.ts`.
