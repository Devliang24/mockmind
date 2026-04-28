# Protocols

Protocols live under `src/protocols` and are reusable across providers.

## Current Protocols

- `openai-compatible`
- `openai-embeddings`
- `openai-responses`
- `openai-images`
- `openai-audio`
- `openai-moderations`
- `openai-files`
- `openai-batch`
- `anthropic-messages`
- `gemini-generate-content`
- `dashscope-generation`
- `minimax-chat`
- `rerank`

## Protocol Handler Flow

1. Validate required body fields and protocol headers.
2. Parse provider HTTP request.
3. Build unified `MockRequest`.
4. Match scenario.
5. Render `MockResult`.
6. Fill missing token usage with deterministic local estimates.
7. Format provider-specific response.
8. Record request in recorder.

## Adding a Protocol

Create:

```txt
src/protocols/<protocol>/
  adapter.ts
  stream.ts
  handler.ts
```

Then add the protocol id to `src/protocols/types.ts` and register the handler in `src/protocols/registry.ts`.
