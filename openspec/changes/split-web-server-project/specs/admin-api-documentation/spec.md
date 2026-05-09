## ADDED Requirements

### Requirement: Admin API Markdown documentation
The system SHALL provide human-readable documentation for Admin API endpoints used by the web console.

#### Scenario: Admin API documentation exists
- **WHEN** the change is implemented
- **THEN** `docs/api/admin-api.md` documents the Admin API endpoints

#### Scenario: Endpoint details are documented
- **WHEN** an Admin API endpoint is documented
- **THEN** the documentation includes purpose, method, path, parameters, response fields, example response, error behavior, and frontend usage notes

### Requirement: Admin API OpenAPI specification
The system SHALL provide a machine-readable OpenAPI specification for the Admin API.

#### Scenario: OpenAPI document exists
- **WHEN** the change is implemented
- **THEN** `docs/api/openapi.yaml` describes the Admin API endpoints used by the console

#### Scenario: OpenAPI document parses
- **WHEN** documentation validation runs
- **THEN** `docs/api/openapi.yaml` parses as a valid OpenAPI document

### Requirement: Admin API contract tests
The system SHALL test the documented Admin API response contracts.

#### Scenario: Provider contract is tested
- **WHEN** Admin API contract tests run
- **THEN** `/__admin/providers` responses include documented provider identity, auth, model, group, and route fields

#### Scenario: Route contract is tested
- **WHEN** Admin API contract tests run
- **THEN** `/__admin/routes` responses include documented method, path, protocol, endpoint, auth, description, and provider fields

#### Scenario: Request record contract is tested
- **WHEN** Admin API contract tests run after a mock request
- **THEN** `/__admin/requests` responses include documented request metadata, raw request body, stream flag, status, duration, and response body fields

### Requirement: Web console consumes Admin API only
The web console SHALL load server state through documented Admin API endpoints.

#### Scenario: Console loads overview data
- **WHEN** the web console starts
- **THEN** it loads overview, provider, route, model, scenario, and request data through Admin API requests

#### Scenario: Console has no direct backend imports
- **WHEN** frontend source is inspected
- **THEN** it imports shared contract types but does not import server implementation modules
