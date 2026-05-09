## ADDED Requirements

### Requirement: Workspace project layout
The repository SHALL separate backend, frontend, and shared contract code into workspace packages.

#### Scenario: Workspace folders exist
- **WHEN** the split is implemented
- **THEN** the repository contains `apps/server`, `apps/web`, and `packages/shared`

#### Scenario: Backend code is isolated
- **WHEN** server code is moved into the workspace layout
- **THEN** Fastify server, CLI, config, providers, protocols, core engine, and recorder code live under `apps/server`

#### Scenario: Frontend code is isolated
- **WHEN** the web console is migrated
- **THEN** console application code lives under `apps/web` instead of being maintained as embedded JavaScript strings in the server source

### Requirement: One-command production runtime compatibility
The system SHALL preserve the current one-command production experience.

#### Scenario: CLI starts server and console
- **WHEN** a user runs `mockmind start`
- **THEN** the server starts mock APIs, Admin API endpoints, health endpoint, and the console route

#### Scenario: Console route remains stable
- **WHEN** a user opens `/console`
- **THEN** the server returns the production web console

#### Scenario: Legacy UI path remains unsupported
- **WHEN** a user opens `/__ui`
- **THEN** the server returns 404

### Requirement: Existing storage behavior is retained
The system SHALL continue using the existing recorder storage options and SHALL NOT require a new database for the split frontend.

#### Scenario: Memory recorder remains supported
- **WHEN** persistence is not configured
- **THEN** request records are stored in memory as before

#### Scenario: SQLite recorder remains supported
- **WHEN** SQLite persistence is configured
- **THEN** request records are persisted through the existing SQLite recorder

#### Scenario: Frontend does not access storage directly
- **WHEN** the web console needs request data
- **THEN** it retrieves request records through Admin API endpoints rather than accessing memory or SQLite directly

### Requirement: Build and package workflow
The system SHALL build shared, web, and server workspaces into deployable artifacts.

#### Scenario: Full build succeeds
- **WHEN** a maintainer runs the repository build command
- **THEN** shared types, the web console, and the server package are built successfully

#### Scenario: Published package includes console assets
- **WHEN** the package is built for distribution
- **THEN** the production console assets are included with the server package

### Requirement: Mock API compatibility
The refactor SHALL preserve existing mock API route behavior.

#### Scenario: Existing provider route works after split
- **WHEN** a client sends a request to an existing provider route such as `/v1/chat/completions`
- **THEN** the request is handled with the same validation, matching, rendering, recording, and response formatting behavior as before

#### Scenario: Streaming route works after split
- **WHEN** a client sends a supported streaming request
- **THEN** the server returns the same provider-shaped `text/event-stream` response format as before
