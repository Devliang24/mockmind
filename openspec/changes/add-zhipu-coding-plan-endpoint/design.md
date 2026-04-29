## Context

MockMind already supports Zhipu GLM through `/api/paas/v4/chat/completions` using the shared OpenAI-compatible protocol handler. Zhipu GLM Coding Plan documents a dedicated OpenAI-compatible base URL, `https://open.bigmodel.cn/api/coding/paas/v4`, intended for coding-agent tools.

## Goals / Non-Goals

**Goals:**

- Expose the local equivalent of the Coding Plan chat completion route.
- Reuse the existing OpenAI-compatible request validation, scenario matching, streaming, usage, error, and response formatting.
- Document the Coding Plan route and provide cURL examples.

**Non-Goals:**

- Implement a separate Coding Plan protocol adapter.
- Enforce subscription-specific eligibility or tool allowlists.
- Add non-chat Coding Plan endpoints not documented by the requested page.

## Decisions

- Add `/api/coding/paas/v4/chat/completions` to the existing Zhipu provider preset.
  - Rationale: the official Coding Plan URL is an OpenAI-compatible base URL, so the complete chat endpoint is base URL plus `/chat/completions`.
  - Alternative considered: create a separate provider id. Rejected because scenario/provider behavior remains Zhipu GLM.
- Reuse `openai-compatible`.
  - Rationale: current handler already supports the request and response shape used by OpenAI-compatible coding tools.
- Accept `GLM-*` model patterns case-insensitively.
  - Rationale: the Coding Plan page explicitly shows Cursor model names like `GLM-5.1`, while existing examples use lowercase `glm-*`.

## Risks / Trade-offs

- Uppercase and lowercase GLM model names may both appear in examples → mitigated by preserving existing lowercase scenarios and adding a Coding Plan-specific uppercase scenario.
- Coding Plan may later document additional paths → this change scopes only the requested documented base URL plus chat completions.
