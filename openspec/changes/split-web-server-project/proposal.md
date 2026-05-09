## Why

MockMind's console is currently embedded as large HTML/CSS/JavaScript strings inside the server package, which makes UI work, interface documentation, and contract testing harder to maintain as provider coverage grows.

Splitting the server and web console into separate workspace projects will make the frontend easier to evolve while preserving the current one-command server experience and the existing memory/SQLite recorder strategy.

## What Changes

- Introduce a workspace layout with `apps/server`, `apps/web`, and `packages/shared`.
- Move the existing Fastify backend into `apps/server` without changing mock API route behavior.
- Build a standalone web console project that consumes backend Admin API endpoints instead of embedded UI strings.
- Keep `/console` as the production console URL by serving the built web assets from the server.
- Keep the existing request recorder storage model: in-memory by default, SQLite when configured.
- Add human-readable Admin API and Mock API documentation under `docs/api`.
- Add an OpenAPI document for the Admin API contract.
- Add contract tests so Admin API responses stay aligned with the documented frontend-facing interface.

## Capabilities

### New Capabilities

- `split-web-server-project`: Defines the separated server/web/shared project structure, build behavior, and deployment compatibility.
- `admin-api-documentation`: Defines the documented Admin API contract consumed by the web console.
- `mock-api-documentation`: Defines the provider route documentation expectations for MockMind-supported mock APIs.

### Modified Capabilities

- None.

## Impact

- Affected code areas:
  - `package.json`, build scripts, TypeScript configuration, and package publishing configuration.
  - Existing backend code under `src/**`, moved to `apps/server/src/**`.
  - Existing console implementation under `src/ui/**`, replaced by `apps/web`.
  - Shared DTO/type definitions moved or copied into `packages/shared`.
  - Tests under `test/**`, plus new frontend and API contract tests.
- Affected runtime behavior:
  - `/console` remains the console entry point.
  - `mockmind start` continues to start the backend and serve the production console.
  - Existing mock API routes remain compatible.
  - Existing memory/SQLite persistence behavior remains unchanged.
- New documentation:
  - `docs/api/admin-api.md`
  - `docs/api/mock-api.md`
  - `docs/api/openapi.yaml`
