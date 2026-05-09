## 1. Preflight

- [x] 1.1 Commit or explicitly set aside current unrelated architecture diagram and UI example changes.
- [ ] 1.2 Run the current test suite and record the clean baseline before moving files.
- [x] 1.3 Confirm the published CLI entry point and package output requirements.

## 2. Workspace Setup

- [x] 2.1 Add npm workspace configuration for `apps/*` and `packages/*`.
- [x] 2.2 Create `apps/server`, `apps/web`, and `packages/shared` package skeletons.
- [x] 2.3 Add root scripts for server dev, web dev, build, typecheck, and tests.
- [x] 2.4 Update TypeScript configuration so workspace packages compile predictably.

## 3. Server Migration

- [x] 3.1 Move existing backend source from `src/**` to `apps/server/src/**`.
- [x] 3.2 Repair imports and build entry points after the move.
- [x] 3.3 Preserve `mockmind start`, `/health`, `/console`, `/__admin/*`, and all provider mock API routes.
- [x] 3.4 Update tests and package references to use the server workspace paths.
- [x] 3.5 Run typecheck and the full backend test suite after the move.

## 4. Shared Contracts

- [x] 4.1 Extract stable DTO/type definitions into `packages/shared`.
- [x] 4.2 Update server Admin API code to use shared contract types where appropriate.
- [x] 4.3 Ensure shared types do not import server implementation modules.
- [x] 4.4 Add build/typecheck coverage for the shared package.

## 5. API Documentation

- [x] 5.1 Add `docs/api/admin-api.md` documenting Admin API endpoints and response fields.
- [x] 5.2 Add `docs/api/openapi.yaml` for Admin API endpoints used by the console.
- [x] 5.3 Add `docs/api/mock-api.md` documenting supported provider mock routes and streaming support.
- [x] 5.4 Link the new API docs from README or provider documentation.
- [x] 5.5 Add validation that `docs/api/openapi.yaml` parses successfully.

## 6. Admin API Contract Tests

- [x] 6.1 Add contract tests for `/__admin/providers`.
- [x] 6.2 Add contract tests for `/__admin/routes`.
- [x] 6.3 Add contract tests for `/__admin/models`, `/__admin/scenarios`, and `/__admin/overview`.
- [x] 6.4 Add contract tests for `/__admin/requests` after recording a mock request.
- [x] 6.5 Ensure contract tests assert documented fields without overfitting incidental ordering.

## 7. Web App Migration

- [ ] 7.1 Scaffold `apps/web` with Vite, React, and TypeScript.
- [ ] 7.2 Implement a typed Admin API client in `apps/web/src/api`.
- [ ] 7.3 Migrate provider navigation and provider metadata views.
- [ ] 7.4 Migrate protocol tabs, endpoint table, and example code blocks.
- [ ] 7.5 Migrate model picker, model prices, and model-specific example refresh.
- [ ] 7.6 Migrate request table and request drawer.
- [ ] 7.7 Preserve copy button behavior and copied feedback states.
- [ ] 7.8 Remove the old embedded UI string implementation after parity is reached.

## 8. Server/Web Integration

- [x] 8.1 Configure web dev proxy for `/health`, `/__admin/*`, and mock API routes.
- [x] 8.2 Build `apps/web` into static assets.
- [x] 8.3 Serve built web assets from `apps/server` at `/console`.
- [x] 8.4 Keep `/__ui` returning 404.
- [x] 8.5 Add a production integration test for `/console` and static assets.

## 9. Packaging and Release Validation

- [x] 9.1 Update package `files`, `bin`, and build outputs so npm publication includes server and web dist assets.
- [ ] 9.2 Verify Docker build still includes the built console.
- [x] 9.3 Run `npm run build`, `npm run typecheck`, and `npm test`.
- [x] 9.4 Start the built CLI locally and manually verify `/console`.
- [x] 9.5 Document any changed development commands.
