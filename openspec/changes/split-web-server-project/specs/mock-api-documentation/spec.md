## ADDED Requirements

### Requirement: Mock API route documentation
The system SHALL document the MockMind-supported mock API routes at provider and protocol level.

#### Scenario: Mock API documentation exists
- **WHEN** the change is implemented
- **THEN** `docs/api/mock-api.md` documents supported provider routes

#### Scenario: Provider route fields are documented
- **WHEN** a provider route is documented
- **THEN** the documentation includes provider, protocol, route, auth header expectations, required fields, streaming support, official documentation link, and MockMind-specific notes

### Requirement: Official provider docs are referenced
The system SHALL reference official provider documentation rather than duplicating complete third-party API specifications.

#### Scenario: Provider has official docs link
- **WHEN** a supported provider route is listed
- **THEN** the route documentation includes a link to the provider's official API documentation where available

#### Scenario: MockMind-specific differences are documented
- **WHEN** MockMind behavior differs from or narrows official provider behavior
- **THEN** the documentation explains the MockMind-specific behavior

### Requirement: Streaming support is documented
The system SHALL document whether a supported mock route has a streaming example.

#### Scenario: Streaming route is documented
- **WHEN** a route supports streaming examples in the console
- **THEN** `docs/api/mock-api.md` identifies the streaming trigger and response format

#### Scenario: Non-streaming route is documented
- **WHEN** a route does not support streaming examples
- **THEN** `docs/api/mock-api.md` identifies it as non-streaming or endpoint-selected streaming where applicable

### Requirement: Documentation stays aligned with provider registry
The system SHALL keep Mock API documentation aligned with provider route metadata.

#### Scenario: Provider registry changes
- **WHEN** a provider route is added, removed, or renamed
- **THEN** `docs/api/mock-api.md` is updated in the same change
