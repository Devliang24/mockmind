# Web UI

MockMind includes a lightweight built-in console for local debugging.

## Access

Start the server:

```bash
npm run dev -- start --config mockmind.yaml --port 4000
```

Open:

```txt
http://127.0.0.1:4000/__ui
```

The root path `/` redirects to `/__ui`.

## Pages

- **Overview**: health, version, server settings, counts, and recent requests.
- **Providers**: provider groups, configured models, route summaries, and official docs links.
- **Routes**: registered routes with copyable cURL snippets.
- **Models**: model-to-provider mapping.
- **Scenarios**: loaded scenario IDs, match rules, priorities, and response types.
- **Requests**: recorded requests and raw request details.
- **cURL Examples**: common cURL examples for supported protocols.

## Admin APIs Used

- `GET /health`
- `GET /__admin/overview`
- `GET /__admin/providers`
- `GET /__admin/routes`
- `GET /__admin/models`
- `GET /__admin/scenarios`
- `GET /__admin/requests`
- `POST /__admin/reset`
- `POST /__admin/reload`

The UI is intentionally static and framework-free. It does not edit YAML configuration and does not call real LLM providers.
