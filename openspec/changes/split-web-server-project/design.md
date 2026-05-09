## Context

MockMind currently ships the HTTP mock server, Admin API, and web console from one TypeScript source tree. The console is generated from string constants in `src/ui/assets.ts`, which keeps deployment simple but makes frontend iteration and interface contract documentation brittle.

The existing server already exposes the data the console needs through Admin API endpoints and already supports memory or SQLite request recording. The refactor should preserve that runtime model while making the web console a first-class frontend project.

## Goals / Non-Goals

**Goals:**

- Split the codebase into `apps/server`, `apps/web`, and `packages/shared`.
- Preserve `mockmind start` and `/console` production behavior.
- Preserve all existing mock API routes and provider/protocol behavior.
- Keep using the existing memory/SQLite recorder; do not introduce a new database.
- Define and document the Admin API contract used by the web console.
- Document supported Mock API routes without duplicating full provider-owned API specifications.
- Add tests that detect drift between Admin API implementation and documentation-facing contracts.

**Non-Goals:**

- Add PostgreSQL, MySQL, Redis, or any new persistence system.
- Add login, multi-user authorization, or tenancy.
- Add online scenario editing.
- Add automatic model price synchronization.
- Reimplement provider protocols or change mock API response semantics.
- Fully reproduce third-party official OpenAPI specifications.

## Decisions

### Decision: Use npm workspaces with apps and packages

The repo will use npm workspaces with:

```txt
apps/server
apps/web
packages/shared
```

Rationale: this matches the current Node/npm toolchain, avoids introducing a new package manager, and lets the CLI package continue to build from the server workspace.

Alternative considered: keep a single package and add a `web/` folder. This is less disruptive but does not give a clean dependency boundary between the frontend and backend.

### Decision: Keep the backend as the deployment owner

The web console will build to static assets and the server will serve those assets at `/console` in production.

Rationale: users currently run one command and expect a complete mock server plus console. Preserving that contract avoids deployment churn.

Alternative considered: deploy the frontend separately. That would add operational complexity without current product need.

### Decision: Use the existing recorder storage model

The refactor will keep memory recording by default and SQLite persistence when configured.

Rationale: frontend separation does not require a new database. Admin API already mediates access to request records, models, routes, providers, and scenarios.

Alternative considered: introduce a relational database for frontend state. This is premature until there are requirements for multi-user access, long-term analytics, or distributed deployment.

### Decision: Create a shared contract package

`packages/shared` will hold DTO/type definitions consumed by both server and web code.

Rationale: this lets the web app type Admin API responses without importing server internals. It also creates a stable place for documented contracts.

Alternative considered: duplicate types in the frontend. That is faster initially but invites drift.

### Decision: Document Admin API with Markdown and OpenAPI

Admin API documentation will include human-readable Markdown and a machine-readable OpenAPI file.

Rationale: Markdown is useful for maintainers and OpenAPI enables validation, generated clients later, and contract testing.

Alternative considered: Markdown only. This is simpler but weaker for regression detection.

### Decision: Document Mock API routes at route/capability level

Mock API documentation will list provider routes, auth expectations, required fields, streaming support, and official docs links.

Rationale: providers own the full protocol specs; MockMind should document what it supports and where its behavior is intentionally mock-specific.

Alternative considered: write full OpenAPI documents for every provider protocol. This is high maintenance and likely to become stale.

## Risks / Trade-offs

- **Risk: Large move-only changes obscure behavior regressions** → Keep early steps as mechanical moves and run the full test suite after each phase.
- **Risk: Frontend migration drops existing console features** → Build component parity against current console behavior before deleting `src/ui/assets.ts`.
- **Risk: Build and package output misses web assets** → Add a production test that starts the built server and verifies `/console` and asset URLs.
- **Risk: Admin API types diverge from docs** → Add contract tests and validate `docs/api/openapi.yaml`.
- **Risk: Workspace paths break CLI publishing** → Verify package `bin`, `exports`, `files`, and built artifact layout before release.
- **Risk: Current uncommitted unrelated changes get mixed into the refactor** → Commit architecture/UI example changes separately before implementation.

## Migration Plan

1. Commit or explicitly set aside current unrelated documentation/UI changes.
2. Introduce workspace structure and scripts without moving behavior.
3. Move backend code to `apps/server` and repair imports.
4. Extract shared DTO types to `packages/shared`.
5. Add Admin API and Mock API documentation.
6. Add Admin API contract tests and OpenAPI parse validation.
7. Scaffold `apps/web` and migrate the console feature by feature.
8. Serve built web assets from `apps/server` at `/console`.
9. Remove the old embedded UI string implementation.
10. Run typecheck, full tests, build, and manual `/console` verification.

Rollback strategy: because the current server and embedded UI are self-contained, keep the backend move and frontend migration in discrete commits. If frontend parity fails, revert the web-serving commit while keeping backend route behavior intact.

## Open Questions

- Should frontend tests use React Testing Library only, or should Playwright be added for end-to-end console coverage?
- Should `docs/api/openapi.yaml` be generated from shared schemas later, or maintained manually at first?
- Should `apps/web` use plain CSS modules or a lightweight component library?
