# Contributing to MockMind

Thanks for your interest in contributing to MockMind.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Start the local server:

```bash
npm run dev -- start --config mockmind.yaml
```

## Pull Requests

Please keep PRs focused and include:

- What changed
- Why it changed
- How it was tested
- Any docs or compatibility updates

## Adding a Provider

When adding provider support, include:

- Provider registry entry
- Request adapter
- Response formatter
- Error formatter
- Streaming formatter if supported
- Unit or integration tests
- Documentation and examples

Provider-specific behavior should stay under `src/providers/<provider>`. Shared scenario matching and rendering should stay provider-neutral under `src/core`.

## Commit Style

Conventional Commits are recommended:

```txt
feat(openai): support streaming chunks
fix(config): improve validation error output
docs(readme): add gemini quick start
```

## Before Opening a PR

Run the same checks as CI:

```bash
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

For protocol or provider changes, update the cURL examples in `README.md` and the provider/protocol tables under `docs/`.

## Compatibility Notes

MockMind should prefer protocol-compatible mock shapes over real network calls. Do not add code that proxies requests to real LLM providers by default.
