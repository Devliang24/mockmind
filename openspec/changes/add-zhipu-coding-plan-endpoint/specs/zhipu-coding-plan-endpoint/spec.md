## ADDED Requirements

### Requirement: Zhipu Coding Plan chat completions route

MockMind SHALL expose the Zhipu GLM Coding Plan OpenAI-compatible chat completions endpoint at `/api/coding/paas/v4/chat/completions`.

#### Scenario: Coding Plan request succeeds

- **WHEN** a client sends a valid chat completion request to `/api/coding/paas/v4/chat/completions`
- **THEN** MockMind returns an OpenAI-compatible chat completion response through the Zhipu provider.

#### Scenario: Coding Plan scenario can be matched

- **WHEN** a scenario targets provider `zhipu` and endpoint `/api/coding/paas/v4/chat/completions`
- **THEN** requests to the Coding Plan endpoint can match that scenario.

### Requirement: Coding Plan model casing compatibility

MockMind SHALL support uppercase `GLM-*` model identifiers for Zhipu Coding Plan requests while preserving lowercase `glm-*` matching.

#### Scenario: Uppercase GLM model routes to Zhipu

- **WHEN** a Coding Plan request uses a model such as `GLM-5.1`
- **THEN** MockMind treats it as a Zhipu GLM request.

### Requirement: Coding Plan documentation and UI visibility

MockMind SHALL document the Coding Plan endpoint and show it in provider route metadata for the Zhipu provider.

#### Scenario: Provider metadata includes Coding Plan route

- **WHEN** the Admin provider route metadata is requested
- **THEN** it includes `/api/coding/paas/v4/chat/completions` for Zhipu GLM.
