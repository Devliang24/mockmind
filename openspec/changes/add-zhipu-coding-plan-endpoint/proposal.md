## Why

Zhipu GLM Coding Plan uses a dedicated OpenAI-compatible Coding API base URL instead of the general GLM API base URL. MockMind needs to expose the matching local route so coding-agent tools can validate configuration and request behavior against the documented endpoint.

## What Changes

- Add a Zhipu GLM Coding Plan OpenAI-compatible chat endpoint at `/api/coding/paas/v4/chat/completions`.
- Keep response behavior aligned with the existing OpenAI-compatible protocol handler.
- Add default configuration, documentation, UI examples, and integration tests for the Coding Plan route.
- Accept uppercase `GLM-*` model names for Coding Plan examples while preserving current lowercase GLM model support.

## Capabilities

### New Capabilities

- `zhipu-coding-plan-endpoint`: Covers the Zhipu GLM Coding Plan OpenAI-compatible chat endpoint and its expected MockMind behavior.

### Modified Capabilities

- None.

## Impact

- Provider registry: Zhipu route metadata and model matching.
- Protocol handling: reuse existing OpenAI-compatible chat formatting and validation.
- Examples: `mockmind.yaml`, init template, README, provider docs, Web UI metadata.
- Tests: provider route integration and UI metadata assertions.
