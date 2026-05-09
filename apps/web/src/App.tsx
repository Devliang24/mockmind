import { useEffect, useMemo, useState } from "react";
import type {
  AdminModelsResponse,
  AdminProvidersResponse,
  AdminRecordedRequest,
  AdminRoute,
  AdminScenario
} from "@mockmind/shared";
import { loadConsoleData, type ConsoleData } from "./api/client";
import { exampleForRoute } from "./examples";
import { priceLabel } from "./model-pricing";

type ProviderView = AdminProvidersResponse["providers"][number];
type LoadState = "loading" | "ready" | "error";

export function App() {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string>();
  const [selectedProviderId, setSelectedProviderId] = useState<string>();
  const [selectedProtocol, setSelectedProtocol] = useState<string>();
  const [selectedRoutePath, setSelectedRoutePath] = useState<string>();
  const [selectedModel, setSelectedModel] = useState<string>();
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [copiedKey, setCopiedKey] = useState<string>();

  async function refresh() {
    try {
      setLoadState("loading");
      const nextData = await loadConsoleData();
      setData(nextData);
      setLoadState("ready");
      setError(undefined);
    } catch (cause) {
      setLoadState("error");
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const providers = data?.providers.providers ?? [];
  const selectedProvider = providers.find((provider) => provider.provider === selectedProviderId) ?? providers[0];
  const providerRoutes = useMemo(
    () => (data?.routes ?? []).filter((route) => route.provider === selectedProvider?.provider),
    [data?.routes, selectedProvider?.provider]
  );
  const protocols = useMemo(() => unique(providerRoutes.map((route) => route.protocol)), [providerRoutes]);
  const activeProtocol = selectedProtocol && protocols.includes(selectedProtocol) ? selectedProtocol : protocols[0];
  const protocolRoutes = providerRoutes.filter((route) => route.protocol === activeProtocol);
  const selectedRoute =
    protocolRoutes.find((route) => route.path === selectedRoutePath) ??
    protocolRoutes[0] ??
    providerRoutes[0];
  const providerModels = useMemo(() => modelsForProvider(selectedProvider, data?.models), [data?.models, selectedProvider]);
  const activeModel = selectedModel && providerModels.includes(selectedModel) ? selectedModel : providerModels[0] ?? "mock-model";
  const selectedRequest = data?.requests.find((request) => request.id === selectedRequestId);

  useEffect(() => {
    if (!selectedProviderId && selectedProvider?.provider) setSelectedProviderId(selectedProvider.provider);
  }, [selectedProvider?.provider, selectedProviderId]);

  useEffect(() => {
    if (activeProtocol && selectedProtocol !== activeProtocol) setSelectedProtocol(activeProtocol);
  }, [activeProtocol, selectedProtocol]);

  useEffect(() => {
    if (selectedRoute?.path && selectedRoutePath !== selectedRoute.path) setSelectedRoutePath(selectedRoute.path);
  }, [selectedRoute?.path, selectedRoutePath]);

  useEffect(() => {
    if (activeModel && selectedModel !== activeModel) setSelectedModel(activeModel);
  }, [activeModel, selectedModel]);

  async function copy(text: string, key: string) {
    await copyText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((current) => (current === key ? undefined : current)), 1200);
  }

  if (loadState === "loading" && !data) {
    return <ShellStatus title="Loading console" detail="Fetching Admin API data..." />;
  }

  if (loadState === "error" && !data) {
    return <ShellStatus title="Console unavailable" detail={error ?? "Unable to load Admin API data."} />;
  }

  if (!data || !selectedProvider || !selectedRoute) {
    return <ShellStatus title="Console unavailable" detail="No provider metadata is available." />;
  }

  const baseUrl = window.location.origin || "http://127.0.0.1:4000";
  const example = exampleForRoute(selectedRoute, activeModel, baseUrl);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <strong>MockMind</strong>
            <span>Console</span>
          </div>
        </div>
        <div className="sidebar-section">
          <span className="sidebar-label">Providers</span>
          <div className="provider-menu">
            {providers.map((provider) => (
              <button
                className={provider.provider === selectedProvider.provider ? "provider-item active" : "provider-item"}
                key={provider.provider}
                onClick={() => {
                  setSelectedProviderId(provider.provider);
                  setSelectedProtocol(undefined);
                  setSelectedRoutePath(undefined);
                  setSelectedModel(undefined);
                }}
                type="button"
              >
                <span>{provider.displayName}</span>
                <small>{provider.groups.join(" / ")}</small>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="console-header">
          <div>
            <p className="eyebrow">Base URL</p>
            <h1>{baseUrl}</h1>
          </div>
          <div className="header-actions">
            <StatusPill ok={data.health.ok} label={data.health.ok ? "Healthy" : "Unhealthy"} />
            <button className="icon-button" onClick={() => void refresh()} title="Refresh Admin API data" type="button">
              Refresh
            </button>
          </div>
        </header>

        <section className="stats-row" aria-label="Server overview">
          <Stat label="Providers" value={data.overview.providersCount} />
          <Stat label="Models" value={data.overview.modelsCount} />
          <Stat label="Scenarios" value={data.overview.scenariosCount} />
          <Stat label="Requests" value={data.overview.requestsCount} />
        </section>

        <section className="workspace">
          <div className="primary-column">
            <ProviderPanel provider={selectedProvider} routes={providerRoutes} />

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Protocols</p>
                  <h2>Endpoints</h2>
                </div>
                <a href={example.docsUrl} target="_blank" rel="noreferrer">
                  Official docs
                </a>
              </div>

              <div className="tabs" role="tablist" aria-label="Protocols">
                {protocols.map((protocol) => (
                  <button
                    className={protocol === activeProtocol ? "tab active" : "tab"}
                    key={protocol}
                    onClick={() => {
                      setSelectedProtocol(protocol);
                      setSelectedRoutePath(undefined);
                    }}
                    type="button"
                  >
                    {protocol}
                  </button>
                ))}
              </div>

              <div className="endpoint-table" role="table" aria-label="Endpoint metadata">
                <div className="endpoint-row endpoint-head" role="row">
                  <span>Method</span>
                  <span>Path</span>
                  <span>Endpoint</span>
                  <span>Description</span>
                </div>
                {protocolRoutes.map((route) => (
                  <button
                    className={route.path === selectedRoute.path ? "endpoint-row active" : "endpoint-row"}
                    key={`${route.method}:${route.path}:${route.endpoint}`}
                    onClick={() => setSelectedRoutePath(route.path)}
                    role="row"
                    type="button"
                  >
                    <span className="method">{route.method}</span>
                    <code>{route.path}</code>
                    <span>{route.endpoint}</span>
                    <span>{route.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Current Example Model</p>
                  <h2>{activeModel}</h2>
                </div>
                <button className="copy-button" onClick={() => void copy(activeModel, "model")} type="button">
                  {copiedKey === "model" ? "Copied" : "Copy model"}
                </button>
              </div>
              <div className="model-grid">
                {providerModels.map((model) => (
                  <button className={model === activeModel ? "model-chip active" : "model-chip"} key={model} onClick={() => setSelectedModel(model)} type="button">
                    <strong>{model}</strong>
                    <span>{priceLabel(model)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="examples-grid">
              <CodeBlock title="Required Fields" value={example.required.length ? example.required.join("\n") : "none"} onCopy={(value) => void copy(value, "required")} copied={copiedKey === "required"} />
              <CodeBlock title="Request Body" value={prettyJson(example.requestBody)} onCopy={(value) => void copy(value, "body")} copied={copiedKey === "body"} />
              <CodeBlock title="Non-stream cURL" value={example.curl} onCopy={(value) => void copy(value, "curl")} copied={copiedKey === "curl"} />
              <CodeBlock title="Response Body" value={prettyJson(example.responseBody)} onCopy={(value) => void copy(value, "response")} copied={copiedKey === "response"} />
              {example.stream ? (
                <>
                  <CodeBlock title="Stream cURL" value={example.stream.curl} onCopy={(value) => void copy(value, "stream-curl")} copied={copiedKey === "stream-curl"} />
                  <CodeBlock title="Stream Response" value={example.stream.responseText} onCopy={(value) => void copy(value, "stream-response")} copied={copiedKey === "stream-response"} />
                </>
              ) : null}
            </section>
          </div>

          <aside className="activity-column">
            <RequestPanel requests={data.requests} scenarios={data.scenarios} onSelect={setSelectedRequestId} selectedRequestId={selectedRequestId} />
          </aside>
        </section>
      </main>

      {selectedRequest ? (
        <RequestDrawer request={selectedRequest} onClose={() => setSelectedRequestId(undefined)} onCopy={(text, key) => void copy(text, key)} copiedKey={copiedKey} />
      ) : null}
    </div>
  );
}

function ProviderPanel({ provider, routes }: { provider: ProviderView; routes: AdminRoute[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Provider</p>
          <h2>{provider.displayName}</h2>
        </div>
        <StatusPill ok label={provider.auth.label} />
      </div>
      <dl className="provider-meta">
        <div>
          <dt>Provider ID</dt>
          <dd>{provider.provider}</dd>
        </div>
        <div>
          <dt>Groups</dt>
          <dd>{provider.groups.join(", ")}</dd>
        </div>
        <div>
          <dt>Auth headers</dt>
          <dd>{provider.auth.headers.join(", ") || "none"}</dd>
        </div>
        <div>
          <dt>Routes</dt>
          <dd>{routes.length}</dd>
        </div>
      </dl>
    </section>
  );
}

function RequestPanel({
  requests,
  scenarios,
  selectedRequestId,
  onSelect
}: {
  requests: AdminRecordedRequest[];
  scenarios: AdminScenario[];
  selectedRequestId?: string;
  onSelect: (id: string) => void;
}) {
  const latest = [...requests].reverse();
  return (
    <section className="panel request-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Request Log</p>
          <h2>{requests.length} records</h2>
        </div>
      </div>
      {latest.length === 0 ? (
        <p className="empty-state">No requests recorded yet.</p>
      ) : (
        <div className="request-list">
          {latest.map((request) => (
            <button className={request.id === selectedRequestId ? "request-row active" : "request-row"} key={request.id} onClick={() => onSelect(request.id)} type="button">
              <span className={request.status < 400 ? "status-code ok" : "status-code error"}>{request.status}</span>
              <span>
                <strong>{request.model ?? request.provider}</strong>
                <small>
                  {request.endpoint} · {request.durationMs}ms
                </small>
              </span>
              <small>{scenarioName(request, scenarios)}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function RequestDrawer({
  request,
  onClose,
  onCopy,
  copiedKey
}: {
  request: AdminRecordedRequest;
  onClose: () => void;
  onCopy: (text: string, key: string) => void;
  copiedKey?: string;
}) {
  const curl = requestCurl(request);
  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="request-drawer" aria-label="Request details" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="eyebrow">Request Details</p>
            <h2>{request.id}</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            Close
          </button>
        </header>
        <dl className="drawer-meta">
          <div>
            <dt>Provider</dt>
            <dd>{request.provider}</dd>
          </div>
          <div>
            <dt>Endpoint</dt>
            <dd>{request.endpoint}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{request.status}</dd>
          </div>
          <div>
            <dt>Stream</dt>
            <dd>{String(request.stream)}</dd>
          </div>
        </dl>
        <CodeBlock title="Full cURL" value={curl} onCopy={(value) => onCopy(value, "request-curl")} copied={copiedKey === "request-curl"} />
        <CodeBlock title="Request Body" value={prettyJson(request.request.rawBody)} onCopy={(value) => onCopy(value, "request-body")} copied={copiedKey === "request-body"} />
        <CodeBlock title="Response Body" value={prettyJson(request.responseBody)} onCopy={(value) => onCopy(value, "request-response")} copied={copiedKey === "request-response"} />
      </aside>
    </div>
  );
}

function CodeBlock({ title, value, copied, onCopy }: { title: string; value: string; copied: boolean; onCopy: (value: string) => void }) {
  return (
    <section className="code-panel">
      <header>
        <h3>{title}</h3>
        <button className="copy-button" onClick={() => onCopy(value)} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <pre>
        <code>{value}</code>
      </pre>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return <span className={ok ? "status-pill ok" : "status-pill error"}>{label}</span>;
}

function ShellStatus({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="shell-status">
      <h1>{title}</h1>
      <p>{detail}</p>
    </main>
  );
}

function modelsForProvider(provider: ProviderView | undefined, models: AdminModelsResponse | undefined): string[] {
  if (!provider) return [];
  return unique([
    ...provider.configuredModels,
    ...(models?.data.filter((model) => model.provider === provider.provider).map((model) => model.id) ?? []),
    ...provider.latestModels,
    ...provider.defaultModels
  ]);
}

function scenarioName(request: AdminRecordedRequest, scenarios: AdminScenario[]): string {
  if (!request.matchedScenarioId) return "fallback";
  return scenarios.find((scenario) => scenario.id === request.matchedScenarioId)?.id ?? request.matchedScenarioId;
}

function requestCurl(request: AdminRecordedRequest): string {
  const headers = Object.entries(request.request.headers)
    .filter(([key]) => ["authorization", "x-api-key", "x-goog-api-key", "anthropic-version", "content-type"].includes(key.toLowerCase()))
    .map(([key, value]) => `  -H '${key}: ${value}'`)
    .join(" \\\n");
  return `curl ${window.location.origin}${request.endpoint} \\\n${headers} \\\n  -d '${JSON.stringify(request.request.rawBody, null, 2)}'`;
}

function prettyJson(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return JSON.stringify(value, null, 2);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const element = document.createElement("textarea");
  element.value = text;
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
}
