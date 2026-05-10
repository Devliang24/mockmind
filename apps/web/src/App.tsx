import { useEffect, useMemo, useState } from "react";
import type {
  AdminModelsResponse,
  AdminProvidersResponse,
  AdminRecordedRequest,
  AdminRoute,
  AdminScenario
} from "@mockmind/shared";
import { loadConsoleData, type ConsoleData } from "./api/client";
import { exampleForRoute, type RouteExample } from "./examples";
import { priceLabel } from "./model-pricing";

type ConsoleView = "provider" | "requests";
type ProviderView = AdminProvidersResponse["providers"][number];
type LoadState = "loading" | "ready" | "error";

const providerOrder = ["openai", "anthropic", "gemini", "deepseek", "moonshot", "zhipu", "aliyun-bailian", "minimax"];
const protocolOrder = [
  "openai-compatible",
  "openai-responses",
  "openai-embeddings",
  "anthropic-messages",
  "gemini-generate-content",
  "dashscope-generation",
  "minimax-chat",
  "rerank"
];

export function App() {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string>();
  const [view, setView] = useState<ConsoleView>("provider");
  const [selectedProviderId, setSelectedProviderId] = useState<string>();
  const [selectedProtocol, setSelectedProtocol] = useState<string>();
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>();
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

  const providers = useMemo(() => orderedProviders(data?.providers.providers ?? []), [data?.providers.providers]);
  const selectedProvider = providers.find((provider) => provider.provider === selectedProviderId) ?? providers[0];
  const providerRoutes = useMemo(
    () => (data?.routes ?? []).filter((route) => route.provider === selectedProvider?.provider && isConsoleRouteVisible(route)),
    [data?.routes, selectedProvider?.provider]
  );
  const protocols = useMemo(() => orderedProtocols(unique(providerRoutes.map((route) => route.protocol))), [providerRoutes]);
  const activeProtocol = selectedProtocol && protocols.includes(selectedProtocol) ? selectedProtocol : protocols[0];
  const protocolRoutes = providerRoutes.filter((route) => route.protocol === activeProtocol);
  const selectedRoute =
    protocolRoutes.find((route) => routeKey(route) === selectedRouteKey) ??
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
    const nextRouteKey = selectedRoute ? routeKey(selectedRoute) : undefined;
    if (nextRouteKey && selectedRouteKey !== nextRouteKey) setSelectedRouteKey(nextRouteKey);
  }, [selectedRoute, selectedRouteKey]);

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

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <strong>MockMind</strong>
        </div>
        <div className="provider-menu root-provider-menu">
          <div className="sidebar-title">供应商</div>
          {providers.map((provider) => (
            <button
              className={view === "provider" && provider.provider === selectedProvider.provider ? "provider-link active" : "provider-link"}
              key={provider.provider}
              onClick={() => {
                setView("provider");
                setSelectedProviderId(provider.provider);
                setSelectedProtocol(undefined);
                setSelectedRouteKey(undefined);
                setSelectedModel(undefined);
                setSelectedRequestId(undefined);
              }}
              type="button"
            >
              {menuProviderName(provider)}
            </button>
          ))}
        </div>
        <button className={view === "requests" ? "nav active" : "nav"} data-view="requests" onClick={() => setView("requests")} type="button">
          请求记录
        </button>
      </aside>

      <main className="content">
        <section id="panel" className="panel">
          {view === "requests" ? (
            <RequestsView requests={data.requests} scenarios={data.scenarios} onSelect={setSelectedRequestId} />
          ) : (
            <ProviderView
              activeModel={activeModel}
              activeProtocol={activeProtocol}
              baseUrl={baseUrl}
              copiedKey={copiedKey}
              onCopy={(text, key) => void copy(text, key)}
              onModelSelect={setSelectedModel}
              onProtocolSelect={(protocol) => {
                setSelectedProtocol(protocol);
                setSelectedRouteKey(undefined);
              }}
              onRouteSelect={(route) => setSelectedRouteKey(routeKey(route))}
              provider={selectedProvider}
              providerModels={providerModels}
              providerRoutes={providerRoutes}
              protocols={protocols}
              protocolRoutes={protocolRoutes}
              selectedRoute={selectedRoute}
            />
          )}
        </section>
      </main>

      {view === "requests" && selectedRequest ? (
        <RequestDrawer request={selectedRequest} onClose={() => setSelectedRequestId(undefined)} onCopy={(text, key) => void copy(text, key)} copiedKey={copiedKey} />
      ) : null}
    </div>
  );
}

function ProviderView({
  provider,
  providerRoutes,
  protocols,
  activeProtocol,
  protocolRoutes,
  selectedRoute,
  providerModels,
  activeModel,
  baseUrl,
  copiedKey,
  onProtocolSelect,
  onRouteSelect,
  onModelSelect,
  onCopy
}: {
  provider: ProviderView;
  providerRoutes: AdminRoute[];
  protocols: string[];
  activeProtocol: string;
  protocolRoutes: AdminRoute[];
  selectedRoute: AdminRoute;
  providerModels: string[];
  activeModel: string;
  baseUrl: string;
  copiedKey?: string;
  onProtocolSelect: (protocol: string) => void;
  onRouteSelect: (route: AdminRoute) => void;
  onModelSelect: (model: string) => void;
  onCopy: (text: string, key: string) => void;
}) {
  const example = exampleForRoute(selectedRoute, activeModel, baseUrl);

  return (
    <>
      <div className="page-header">
        <h1>{provider.displayName}</h1>
      </div>
      <ProviderHeader baseUrl={baseUrl} copiedKey={copiedKey} onCopy={onCopy} provider={provider} routes={providerRoutes} docsUrl={example.docsUrl} />
      <h2>协议菜单</h2>
      <div className="protocol-tabs">
        {protocols.map((protocol) => (
          <button className={protocol === activeProtocol ? "protocol-tab active" : "protocol-tab"} data-protocol={protocol} key={protocol} onClick={() => onProtocolSelect(protocol)} type="button">
            {protocolLabel(protocol)}
          </button>
        ))}
      </div>
      <ProtocolModelPanel
        activeModel={activeModel}
        activeProtocol={activeProtocol}
        copiedKey={copiedKey}
        models={providerModels}
        onCopy={onCopy}
        onModelSelect={onModelSelect}
        provider={provider}
      />
      <EndpointDetail activeModel={activeModel} baseUrl={baseUrl} onRouteSelect={onRouteSelect} protocolRoutes={protocolRoutes} selectedRoute={selectedRoute} />
    </>
  );
}

function ProviderHeader({
  provider,
  routes,
  baseUrl,
  docsUrl,
  copiedKey,
  onCopy
}: {
  provider: ProviderView;
  routes: AdminRoute[];
  baseUrl: string;
  docsUrl: string;
  copiedKey?: string;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <table className="provider-meta">
      <tbody>
        <tr>
          <th>Provider</th>
          <td>{provider.provider}</td>
        </tr>
        <tr>
          <th>分组</th>
          <td>{provider.groups.join(", ")}</td>
        </tr>
        <tr>
          <th>Base URL</th>
          <td>
            <InlineCopy copied={copiedKey === "base-url"} label="复制 Base URL" value={baseUrl} onCopy={() => onCopy(baseUrl, "base-url")} />
          </td>
        </tr>
        <tr>
          <th>鉴权</th>
          <td>{provider.auth.label}</td>
        </tr>
        <tr>
          <th>路由数</th>
          <td>{routes.length}</td>
        </tr>
        <tr>
          <th>官方文档</th>
          <td>
            <a href={docsUrl} target="_blank" rel="noreferrer">
              {docsUrl}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function ProtocolModelPanel({
  provider,
  activeProtocol,
  models,
  activeModel,
  copiedKey,
  onModelSelect,
  onCopy
}: {
  provider: ProviderView;
  activeProtocol: string;
  models: string[];
  activeModel: string;
  copiedKey?: string;
  onModelSelect: (model: string) => void;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="protocol-model-panel">
      <div className="protocol-model-head">
        <h2>协议模型</h2>
        <div className="protocol-model-current">
          当前协议：<strong>{protocolLabel(activeProtocol)}</strong>
        </div>
      </div>
      <div className="model-picker">
        {models.map((model) => {
          const copyKey = `model:${model}`;
          return (
            <div
              className={model === activeModel ? "model-chip active" : "model-chip"}
              data-model={model}
              data-provider={provider.provider}
              data-protocol={activeProtocol}
              key={model}
              onClick={() => onModelSelect(model)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onModelSelect(model);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <button
                aria-label="复制模型代码"
                className="model-copy-btn"
                data-copied={copiedKey === copyKey ? "true" : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  onCopy(model, copyKey);
                }}
                title="复制模型代码"
                type="button"
              >
                ⧉
              </button>
              <strong>{model}</strong>
              <span className="model-meta">
                <span>{provider.provider}</span>
                <span>{protocolLabel(activeProtocol)}</span>
              </span>
              <span className="model-price">{priceLabel(model)}</span>
            </div>
          );
        })}
      </div>
      <p className="model-note">
        当前模型：<strong>{activeModel}</strong>。示例请求会随模型选择更新。
      </p>
    </div>
  );
}

function EndpointDetail({
  protocolRoutes,
  selectedRoute,
  activeModel,
  baseUrl,
  onRouteSelect
}: {
  protocolRoutes: AdminRoute[];
  selectedRoute: AdminRoute;
  activeModel: string;
  baseUrl: string;
  onRouteSelect: (route: AdminRoute) => void;
}) {
  const selectedExample = exampleForRoute(selectedRoute, activeModel, baseUrl);

  return (
    <>
      <h2>端点列表</h2>
      <table>
        <thead>
          <tr>
            <th>方法</th>
            <th>端点</th>
            <th>说明</th>
            <th>必填 Header</th>
            <th>必填字段</th>
            <th>官方文档</th>
          </tr>
        </thead>
        <tbody>
          {protocolRoutes.map((route) => {
            const example = routeKey(route) === routeKey(selectedRoute) ? selectedExample : exampleForRoute(route, activeModel, baseUrl);
            return (
              <tr className={routeKey(route) === routeKey(selectedRoute) ? "endpoint-row active" : "endpoint-row"} data-endpoint={routeKey(route)} key={routeKey(route)} onClick={() => onRouteSelect(route)}>
                <td>
                  <span className="badge">{route.method}</span>
                </td>
                <td>
                  <code>{route.path}</code>
                </td>
                <td>{route.description || protocolLabel(route.protocol)}</td>
                <td>{route.auth.headers.join(", ") || "-"}</td>
                <td>{example.required.join(", ") || "-"}</td>
                <td>
                  <a href={example.docsUrl} target="_blank" rel="noreferrer">
                    官方文档
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="detail">
        <ExampleSections example={selectedExample} />
      </div>
    </>
  );
}

function ExampleSections({ example }: { example: RouteExample }) {
  return (
    <>
      <div className="grid-2 examples-grid">
        <h2>非流式示例</h2>
        <h2>流式示例</h2>
      </div>
      <div className="grid-2 example-row">
        <CodeBlock title="非流式 cURL" value={example.curl} copyKey="curl" />
        {example.stream ? <CodeBlock title="流式 cURL" value={example.stream.curl} copyKey="stream-curl" /> : <p className="muted">该端点暂无流式示例。</p>}
      </div>
      <div className="grid-2 example-row">
        <CodeBlock title="非流式响应 Body" value={prettyJson(example.responseBody)} copyKey="response" />
        {example.stream ? <CodeBlock title="流式响应示例" value={example.stream.responseText} copyKey="stream-response" /> : <p className="muted">该端点暂无流式示例。</p>}
      </div>
    </>
  );
}

function RequestsView({
  requests,
  scenarios,
  onSelect
}: {
  requests: AdminRecordedRequest[];
  scenarios: AdminScenario[];
  onSelect: (id: string) => void;
}) {
  const latestRequests = [...requests].reverse();

  return (
    <>
      <div className="page-header">
        <h1>请求记录</h1>
      </div>
      {latestRequests.length === 0 ? (
        <div className="requests-empty">暂无请求记录。</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>状态</th>
              <th>提供商</th>
              <th>模型</th>
              <th>场景</th>
              <th>端点</th>
              <th>耗时</th>
            </tr>
          </thead>
          <tbody>
            {latestRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  <button className="request-id" data-request-id={request.id} onClick={() => onSelect(request.id)} type="button">
                    {request.id}
                  </button>
                </td>
                <td>{request.status}</td>
                <td>{request.provider}</td>
                <td>{request.model || "-"}</td>
                <td>{scenarioName(request, scenarios)}</td>
                <td>
                  <code>{request.endpoint}</code>
                </td>
                <td>{request.durationMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
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
      <aside className="request-drawer" aria-label="请求详情" aria-modal="true" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="drawer-head">
          <div>
            <h2>请求详情 {request.id}</h2>
            <p>
              {request.provider} · {request.endpoint} · {request.status}
            </p>
          </div>
          <button className="drawer-close" onClick={onClose} title="关闭" type="button">
            ×
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-section">
            <h3>摘要</h3>
            <table>
              <tbody>
                <tr>
                  <th>ID</th>
                  <td>{request.id}</td>
                </tr>
                <tr>
                  <th>状态</th>
                  <td>{request.status}</td>
                </tr>
                <tr>
                  <th>提供商</th>
                  <td>{request.provider}</td>
                </tr>
                <tr>
                  <th>模型</th>
                  <td>{request.model || "-"}</td>
                </tr>
                <tr>
                  <th>端点</th>
                  <td>{request.endpoint}</td>
                </tr>
                <tr>
                  <th>流式</th>
                  <td>{request.stream ? "是" : "否"}</td>
                </tr>
                <tr>
                  <th>耗时</th>
                  <td>{request.durationMs}ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="drawer-section">
            <CodeBlock copied={copiedKey === "request-curl"} onCopy={(value) => onCopy(value, "request-curl")} title="完整 cURL" value={curl} />
          </div>
          <div className="drawer-section">
            <CodeBlock copied={copiedKey === "request-body"} onCopy={(value) => onCopy(value, "request-body")} title="请求体" value={prettyJson(request.request.rawBody)} />
          </div>
          <div className="drawer-section">
            <CodeBlock copied={copiedKey === "request-response"} onCopy={(value) => onCopy(value, "request-response")} title="响应体" value={prettyJson(request.responseBody ?? { note: "Response body was not recorded for this request." })} />
          </div>
          <div className="drawer-section">
            <CodeBlock copied={copiedKey === "request-log"} onCopy={(value) => onCopy(value, "request-log")} title="完整日志" value={prettyJson(request)} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function CodeBlock({
  title,
  value,
  copyKey,
  copied,
  onCopy
}: {
  title: string;
  value: string;
  copyKey?: string;
  copied?: boolean;
  onCopy?: (value: string) => void;
}) {
  const [localCopied, setLocalCopied] = useState(false);
  const isCopied = copied ?? localCopied;

  async function copyCode() {
    if (onCopy) {
      onCopy(value);
      return;
    }
    await copyText(value);
    setLocalCopied(true);
    window.setTimeout(() => setLocalCopied(false), 1200);
  }

  return (
    <div className="code-block" data-copy-key={copyKey}>
      <h3>{title}</h3>
      <div className="code-surface">
        <button aria-label="复制" className="copy-btn" data-copied={isCopied ? "true" : undefined} onClick={() => void copyCode()} title="复制" type="button">
          ⧉
        </button>
        <pre>{value}</pre>
      </div>
    </div>
  );
}

function InlineCopy({ value, label, copied, onCopy }: { value: string; label: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="inline-copy">
      <code>{value}</code>
      <button aria-label={label} className="inline-copy-btn" data-copied={copied ? "true" : undefined} onClick={onCopy} title={label} type="button">
        ⧉
      </button>
    </div>
  );
}

function ShellStatus({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="shell-status">
      <h1>{title}</h1>
      <p>{detail}</p>
    </main>
  );
}

function orderedProviders(providers: ProviderView[]): ProviderView[] {
  return [...providers].sort((left, right) => providerSortIndex(left.provider) - providerSortIndex(right.provider));
}

function providerSortIndex(provider: string): number {
  const index = providerOrder.indexOf(provider);
  return index === -1 ? providerOrder.length : index;
}

function orderedProtocols(protocols: string[]): string[] {
  return [...protocols].sort((left, right) => protocolSortIndex(left) - protocolSortIndex(right));
}

function protocolSortIndex(protocol: string): number {
  const index = protocolOrder.indexOf(protocol);
  return index === -1 ? protocolOrder.length : index;
}

function shortProviderName(provider: ProviderView | undefined): string {
  return provider?.displayName?.replace("OpenAI Compatible", "OpenAI").replace("Google Gemini", "Gemini").replace("Alibaba Bailian / DashScope", "DashScope / 阿里百炼") ?? "";
}

function menuProviderName(provider: ProviderView): string {
  const name = shortProviderName(provider);
  return name.includes(" / ") ? name.split(" / ").pop() ?? name : name;
}

function protocolLabel(protocol: string): string {
  return (
    {
      "openai-compatible": "Chat Completions",
      "openai-responses": "Responses",
      "openai-embeddings": "Embeddings",
      "anthropic-messages": "Messages",
      "gemini-generate-content": "generateContent",
      "dashscope-generation": "Native Text Generation",
      "minimax-chat": "ChatCompletion v2",
      rerank: "Rerank"
    }[protocol] ?? protocol
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

function routeKey(route: AdminRoute): string {
  return `${route.method} ${route.path}`;
}

function isConsoleRouteVisible(route: AdminRoute): boolean {
  return !(route.method === "GET" && route.path === "/v1/models");
}

function requestCurl(request: AdminRecordedRequest): string {
  const method = request.request.method || "POST";
  const headers = Object.entries(request.request.headers)
    .filter(([key]) => ["authorization", "x-api-key", "x-goog-api-key", "anthropic-version", "content-type"].includes(key.toLowerCase()))
    .map(([key, value]) => `  -H '${key}: ${String(value).replace(/'/g, "'\\''")}'`)
    .join(" \\\n");
  const methodPart = method === "GET" ? "" : ` -X ${method}`;
  const body = method === "GET" ? "" : ` \\\n  -d '${prettyJson(request.request.rawBody).replace(/'/g, "'\\''")}'`;
  return `curl${methodPart} ${window.location.origin}${request.endpoint}${headers ? ` \\\n${headers}` : ""}${body}`;
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
