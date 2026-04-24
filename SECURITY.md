# Security Policy

## Supported Versions

MockMind is currently pre-1.0. Security fixes will target the latest published version.

## Reporting a Vulnerability

Please report security issues privately by opening a GitHub security advisory or contacting the repository owner.

Do not disclose vulnerabilities publicly until maintainers have had a reasonable opportunity to investigate and release a fix.

## Security Boundaries

MockMind is a local development and CI mock server.

- It does not perform real LLM inference.
- It does not include real provider API keys.
- It does not proxy real LLM requests by default.
- It defaults to local development usage.
- Admin APIs are intended for local development and CI, not public internet exposure.

Avoid exposing MockMind directly to the public internet unless you understand and control the risk.
