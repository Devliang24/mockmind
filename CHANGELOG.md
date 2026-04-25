# Changelog

## Unreleased

- Expand OpenAI protocol surface with Responses, Images, Audio, Moderations, Files, and Batch mock endpoints.
- Add protocol-level request validation and provider-style error responses.
- Add provider embedding endpoints and generic rerank mocks for Zhipu and DashScope.
- Add official API reference links to README and provider documentation.
- Add Docker Compose and npm publishing documentation.

## 0.1.0

Initial development version.

- Add TypeScript + Fastify project scaffold.
- Add CLI commands: `start`, `init`, `validate`.
- Add OpenAI-compatible mock endpoints.
- Add minimal Anthropic, Gemini, and DashScope native endpoints.
- Add YAML scenario config, fallback, recorder, Admin API, and Provider Registry.
