import { useEffect, useMemo, useState } from "react";
import type {
  AdminModelsResponse,
  AdminProvidersResponse,
  AdminRecordedRequest,
  AdminRoute,
  AdminScenario
} from "@mockmind/shared";
import { loadConsoleData, saveSettings, toggleModel, type ConsoleData } from "./api/client";
import { exampleForRoute, type RouteExample } from "./examples";
import { priceLabel } from "./model-pricing";
import { embeddingModelForProvider, rerankModelsForProvider } from "./provider-models";

type ConsoleView = "provider" | "requests" | "settings";
type ProviderView = AdminProvidersResponse["providers"][number];
type LoadState = "loading" | "ready" | "error";

const providerOrder = ["openai", "azure", "anthropic", "gemini", "deepseek", "moonshot", "zhipu", "aliyun-bailian", "minimax"];
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
const hiddenConsoleProtocols = new Set(["openai-images", "openai-audio", "openai-moderations", "openai-files", "openai-batch"]);

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
  const [disabledModelStatusCodeDraft, setDisabledModelStatusCodeDraft] = useState<number>(403);
  const [latencyMsDraft, setLatencyMsDraft] = useState<number>(0);
  const [providerLatencyMsDraft, setProviderLatencyMsDraft] = useState<Record<string, number>>({});
  const [modelLatencyMsDraft, setModelLatencyMsDraft] = useState<Record<string, number>>({});

  async function refresh() {
    try {
      setLoadState("loading");
      const nextData = await loadConsoleData();
      setData(nextData);
      setDisabledModelStatusCodeDraft(nextData.settings.disabledModelStatusCode);
      setLatencyMsDraft(nextData.settings.latencyMs);
      setProviderLatencyMsDraft({ ...nextData.settings.providerLatencyMs });
      setModelLatencyMsDraft({ ...nextData.settings.modelLatencyMs });
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
  const providerModels = useMemo(() => modelsForProviderProtocol(selectedProvider, data?.models, activeProtocol), [activeProtocol, data?.models, selectedProvider]);
  const disabledModelIds = useMemo(() => new Set((data?.models.data ?? []).filter((m) => m.disabled).map((m) => m.id)), [data?.models.data]);
  const activeModel = selectedModel && providerModels.includes(selectedModel) ? selectedModel : providerModels[0] ?? "mock-model";
  const selectedRequest = data?.requests.find((request) => request.id === selectedRequestId);

  async function handleToggleModel(modelId: string, disabled: boolean) {
    await toggleModel(modelId, disabled);
    await refresh();
  }

  async function handleSaveSettings() {
    try {
      await saveSettings({
        disabledModelStatusCode: disabledModelStatusCodeDraft,
        latencyMs: latencyMsDraft,
        providerLatencyMs: filterPositive(providerLatencyMsDraft),
        modelLatencyMs: filterPositive(modelLatencyMsDraft)
      });
      await refresh();
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : String(cause));
    }
  }

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
        <button className={view === "settings" ? "nav active" : "nav"} data-view="settings" onClick={() => setView("settings")} type="button">
          系统设置
        </button>
      </aside>

      <main className="content">
        <section id="panel" className="panel">
          {view === "requests" ? (
            <RequestsView requests={data.requests} scenarios={data.scenarios} onSelect={setSelectedRequestId} />
          ) : view === "settings" ? (
            <SettingsView
              disabledModelStatusCode={disabledModelStatusCodeDraft}
              latencyMs={latencyMsDraft}
              providerLatencyMs={providerLatencyMsDraft}
              modelLatencyMs={modelLatencyMsDraft}
              providers={data?.providers.providers ?? []}
              models={data?.models.data ?? []}
              onChangeDisabledModelStatusCode={setDisabledModelStatusCodeDraft}
              onChangeLatencyMs={setLatencyMsDraft}
              onUpdateProviderLatencyMs={setProviderLatencyMsDraft}
              onUpdateModelLatencyMs={setModelLatencyMsDraft}
              onSave={handleSaveSettings}
            />
          ) : (
            <ProviderView
              activeModel={activeModel}
              activeProtocol={activeProtocol}
              baseUrl={baseUrl}
              copiedKey={copiedKey}
              disabledModelIds={disabledModelIds}
              onCopy={(text, key) => void copy(text, key)}
              onModelSelect={setSelectedModel}
              onProtocolSelect={(protocol) => {
                setSelectedProtocol(protocol);
                setSelectedRouteKey(undefined);
              }}
              onRouteSelect={(route) => setSelectedRouteKey(routeKey(route))}
              onToggleModel={(modelId, disabled) => void handleToggleModel(modelId, disabled)}
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
  disabledModelIds,
  baseUrl,
  copiedKey,
  onProtocolSelect,
  onRouteSelect,
  onModelSelect,
  onToggleModel,
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
  disabledModelIds: Set<string>;
  baseUrl: string;
  copiedKey?: string;
  onProtocolSelect: (protocol: string) => void;
  onRouteSelect: (route: AdminRoute) => void;
  onModelSelect: (model: string) => void;
  onToggleModel: (modelId: string, disabled: boolean) => void;
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
        disabledModelIds={disabledModelIds}
        models={providerModels}
        onCopy={onCopy}
        onModelSelect={onModelSelect}
        onToggleModel={onToggleModel}
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
  disabledModelIds,
  copiedKey,
  onModelSelect,
  onToggleModel,
  onCopy
}: {
  provider: ProviderView;
  activeProtocol: string;
  models: string[];
  activeModel: string;
  disabledModelIds: Set<string>;
  copiedKey?: string;
  onModelSelect: (model: string) => void;
  onToggleModel: (modelId: string, disabled: boolean) => void;
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
          const isDisabled = disabledModelIds.has(model);
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
                {provider.modelVersions?.[model] ? <span>Azure version {provider.modelVersions[model]}</span> : null}
              </span>
              <span className="model-price">{priceLabel(model, provider.provider, provider.modelVersions?.[model])}</span>
              <label className="model-toggle" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={!isDisabled}
                  onChange={() => onToggleModel(model, !isDisabled)}
                  title={isDisabled ? "启用该模型" : "禁用该模型"}
                />
                <span className="toggle-label">{isDisabled ? "已禁用" : "启用"}</span>
              </label>
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

function SettingsView({
  disabledModelStatusCode,
  latencyMs,
  providerLatencyMs,
  modelLatencyMs,
  providers,
  models,
  onChangeDisabledModelStatusCode,
  onChangeLatencyMs,
  onUpdateProviderLatencyMs,
  onUpdateModelLatencyMs,
  onSave
}: {
  disabledModelStatusCode: number;
  latencyMs: number;
  providerLatencyMs: Record<string, number>;
  modelLatencyMs: Record<string, number>;
  providers: { provider: string; displayName: string }[];
  models: { id: string; provider: string }[];
  onChangeDisabledModelStatusCode: (value: number) => void;
  onChangeLatencyMs: (value: number) => void;
  onUpdateProviderLatencyMs: (map: Record<string, number>) => void;
  onUpdateModelLatencyMs: (map: Record<string, number>) => void;
  onSave: () => void;
}) {
  const [ruleType, setRuleType] = useState<"provider" | "model">("provider");
  const [ruleTarget, setRuleTarget] = useState<string>("");
  const [ruleValue, setRuleValue] = useState<number>(0);

  const providerTargets = providers.filter((p) => !(p.provider in providerLatencyMs));
  const modelTargets = models.filter((m) => !(m.id in modelLatencyMs));
  const targets = ruleType === "provider" ? providerTargets.map((p) => ({ key: p.provider, label: p.displayName })) : modelTargets.map((m) => ({ key: m.id, label: `${m.id}（${m.provider}）` }));

  function addRule() {
    if (!ruleTarget || ruleValue <= 0) return;
    if (ruleType === "provider") {
      onUpdateProviderLatencyMs({ ...providerLatencyMs, [ruleTarget]: ruleValue });
    } else {
      onUpdateModelLatencyMs({ ...modelLatencyMs, [ruleTarget]: ruleValue });
    }
    setRuleTarget("");
    setRuleValue(0);
  }

  return (
    <>
      <div className="page-header">
        <h1>系统设置</h1>
      </div>
      <div className="settings-form">
        <label className="settings-field">
          <span>禁用模型返回状态码</span>
          <input type="number" value={disabledModelStatusCode} onChange={(event) => onChangeDisabledModelStatusCode(Number(event.target.value))} />
        </label>

        <div className="settings-section">
          <h2>模型响应延时</h2>
          <p className="settings-hint">优先级：单模型 &gt; 供应商 &gt; 全局。</p>

          <label className="settings-field">
            <span>全局延时（ms）</span>
            <input type="number" value={latencyMs} onChange={(event) => onChangeLatencyMs(Number(event.target.value))} />
          </label>

          {Object.keys(providerLatencyMs).length > 0 && (
            <>
              <h3>供应商延时</h3>
              {Object.entries(providerLatencyMs).map(([p, ms]) => (
                <div className="settings-rule-row" key={p}>
                  <span className="settings-rule-label">{providers.find((x) => x.provider === p)?.displayName ?? p}</span>
                  <span className="settings-rule-value">{ms}ms</span>
                  <button className="settings-rule-del" onClick={() => { const next = { ...providerLatencyMs }; delete next[p]; onUpdateProviderLatencyMs(next); }} type="button">删除</button>
                </div>
              ))}
            </>
          )}

          {Object.keys(modelLatencyMs).length > 0 && (
            <>
              <h3>单模型延时</h3>
              {Object.entries(modelLatencyMs).map(([m, ms]) => (
                <div className="settings-rule-row" key={m}>
                  <span className="settings-rule-label">{m}</span>
                  <span className="settings-rule-value">{ms}ms</span>
                  <button className="settings-rule-del" onClick={() => { const next = { ...modelLatencyMs }; delete next[m]; onUpdateModelLatencyMs(next); }} type="button">删除</button>
                </div>
              ))}
            </>
          )}

          <div className="settings-rule-add">
            <select value={ruleType} onChange={(e) => { setRuleType(e.target.value as "provider" | "model"); setRuleTarget(""); }}>
              <option value="provider">供应商</option>
              <option value="model">模型</option>
            </select>
            <select value={ruleTarget} onChange={(e) => setRuleTarget(e.target.value)}>
              <option value="">-- 选择 --</option>
              {targets.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            <input type="number" value={ruleValue || ""} placeholder="ms" onChange={(e) => setRuleValue(Number(e.target.value) || 0)} />
            <button onClick={addRule} type="button" disabled={!ruleTarget || ruleValue <= 0}>添加</button>
          </div>
        </div>

        <button className="settings-save" onClick={onSave} type="button">
          保存
        </button>
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

function modelsForProviderProtocol(provider: ProviderView | undefined, models: AdminModelsResponse | undefined, protocol: string): string[] {
  if (!provider) return [];
  const providerModels = modelsForProvider(provider, models);
  const rerankModels = rerankModelsForProvider(provider.provider);
  const embeddingModel = embeddingModelForProvider(provider.provider);

  if (protocol === "rerank") return unique([...providerModels.filter((model) => rerankModels.includes(model)), ...rerankModels]);
  if (protocol === "openai-embeddings") return unique([...providerModels.filter((model) => model === embeddingModel), embeddingModel].filter(Boolean));

  const nonChatModels = new Set([...rerankModels, embeddingModel].filter(Boolean));
  return providerModels.filter((model) => !nonChatModels.has(model));
}

function scenarioName(request: AdminRecordedRequest, scenarios: AdminScenario[]): string {
  if (!request.matchedScenarioId) return "fallback";
  return scenarios.find((scenario) => scenario.id === request.matchedScenarioId)?.id ?? request.matchedScenarioId;
}

function routeKey(route: AdminRoute): string {
  return `${route.method} ${route.path}`;
}

function isConsoleRouteVisible(route: AdminRoute): boolean {
  return !(route.method === "GET" && route.path === "/v1/models") && !hiddenConsoleProtocols.has(route.protocol);
}

function requestCurl(request: AdminRecordedRequest): string {
  const method = request.request.method || "POST";
  const headers = Object.entries(request.request.headers)
    .filter(([key]) => ["authorization", "api-key", "x-api-key", "x-goog-api-key", "anthropic-version", "content-type"].includes(key.toLowerCase()))
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

function filterPositive(map: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(map)) {
    if (value > 0) result[key] = value;
  }
  return result;
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
