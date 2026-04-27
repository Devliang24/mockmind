export const uiHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MockMind Console</title>
    <link rel="stylesheet" href="/console/style.css" />
  </head>
  <body>
    <div id="app">
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-brand">
            <strong>MockMind</strong>
          </div>
          <div id="provider-menu" class="provider-menu root-provider-menu"></div>
          <button data-view="requests" class="nav">请求记录</button>
        </aside>
        <main class="content">
          <section id="panel" class="panel">Loading...</section>
        </main>
      </div>
    </div>
    <script src="/console/app.js"></script>
  </body>
</html>`;

export const uiCss = `:root {
  color-scheme: light;
  --bg: #f6f8fa;
  --sidebar: #ffffff;
  --panel: #ffffff;
  --panel-2: #f6f8fa;
  --text: #24292f;
  --muted: #57606a;
  --border: #d0d7de;
  --accent: #0969da;
  --accent-soft: #ddf4ff;
  --good: #1a7f37;
  --code-bg: #f6f8fa;
}
* { box-sizing: border-box; }
html, body, #app { height: 100%; }
body { margin: 0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); font-size: 14px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.muted { color: var(--muted); margin-left: 8px; font-size: 13px; }
.layout { display: grid; grid-template-columns: 248px minmax(0, 1fr); height: 100vh; min-height: 0; }
.sidebar { height: 100vh; overflow-y: auto; padding: 16px; border-right: 1px solid var(--border); background: var(--sidebar); }
.sidebar-brand { padding: 4px 10px 16px; margin-bottom: 12px; border-bottom: 1px solid var(--border); }
.sidebar-brand strong { display: block; font-size: 18px; line-height: 1.25; font-weight: 600; color: var(--text); }
.sidebar-brand span { display: block; margin-top: 4px; color: var(--muted); font-size: 13px; }
.nav, .provider-link { width: 100%; text-align: left; color: var(--text); background: transparent; border: 1px solid transparent; padding: 8px 10px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; font-weight: 500; }
.nav:hover, .provider-link:hover { background: var(--panel-2); }
.nav.active, .provider-link.active { color: var(--accent); background: var(--accent-soft); border-color: #b6e3ff; }
.provider-menu { margin: 0 0 16px; padding-left: 0; border-left: 0; }
.provider-link { color: var(--muted); font-size: 14px; font-weight: 500; }
.content { min-width: 0; min-height: 0; padding: 0; overflow: auto; }
.sidebar-title { color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin: 4px 0 8px; }
h1 { margin: 0; font-size: 26px; line-height: 1.25; font-weight: 600; }
h2 { margin: 20px 0 10px; font-size: 18px; font-weight: 600; }
.panel > h2:first-child { margin-top: 0; }
h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--text); }
input { background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; min-width: 320px; outline: none; }
input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.12); }
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 16px; min-height: 320px; box-shadow: 0 1px 0 rgba(27,31,36,0.04); }
.cards { display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 12px; margin-bottom: 18px; }
.card { background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 14px; }
.card strong { display: block; font-size: 24px; margin-top: 6px; font-weight: 600; }
table { width: 100%; border-collapse: collapse; font-size: 14px; background: var(--panel); }
th, td { border-bottom: 1px solid var(--border); padding: 9px 10px; text-align: left; vertical-align: top; }
th { color: var(--muted); font-weight: 600; background: var(--panel-2); }
td { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
.provider-meta { table-layout: fixed; margin-bottom: 16px; }
.provider-meta th { width: 220px; }
.provider-meta td { width: calc(100% - 220px); }
.provider-meta .inline-copy code { max-width: 100%; overflow-wrap: anywhere; }
tr.endpoint-row { cursor: pointer; }
tr.endpoint-row:hover { background: var(--panel-2); }
tr.endpoint-row.active { background: var(--accent-soft); }
.badge { display: inline-block; background: var(--panel-2); border: 1px solid var(--border); border-radius: 999px; padding: 2px 7px; margin: 2px; color: var(--muted); font-size: 12px; }
.model-picker { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; }
.model-chip { position: relative; display: flex; flex: 0 0 228px; flex-direction: column; justify-content: flex-start; gap: 6px; align-items: flex-start; max-width: 228px; min-height: 80px; color: var(--text); background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; cursor: pointer; }
.model-chip:hover { background: var(--panel-2); }
.model-chip.active { color: var(--accent); background: var(--accent-soft); border-color: #b6e3ff; }
.model-chip strong { display: block; padding-right: 28px; font-size: 13px; line-height: 1.25; overflow-wrap: anywhere; word-break: break-word; }
.model-code { display: block; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size: 11px; line-height: 1.35; overflow-wrap: anywhere; word-break: break-word; }
.model-copy-btn { position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; color: var(--muted); background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0; cursor: pointer; }
.model-copy-btn:hover { color: var(--accent); background: var(--panel-2); }
.model-copy-btn[data-copied="true"] { color: var(--good); border-color: rgba(26, 127, 55, 0.4); }
.model-meta { display: flex; gap: 4px; flex-wrap: wrap; }
.model-meta span { color: var(--muted); background: var(--panel-2); border: 1px solid var(--border); border-radius: 999px; padding: 1px 6px; font-size: 11px; }
.model-note { color: var(--muted); line-height: 1.6; }
.model-note strong { color: var(--text); font-weight: 600; }
.protocol-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 16px; }
.protocol-tab { color: var(--text); background: var(--panel); border: 1px solid var(--border); padding: 7px 10px; border-radius: 999px; cursor: pointer; }
.protocol-tab:hover { background: var(--panel-2); }
.protocol-tab.active { color: var(--accent); background: var(--accent-soft); border-color: #b6e3ff; }
.protocol-model-panel { margin: 0 0 16px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 6px; background: var(--panel); }
.protocol-model-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.protocol-model-head h2 { margin: 0; font-size: 18px; }
.protocol-model-current { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: 13px; }
.protocol-model-current strong { color: var(--text); font-weight: 600; }
.protocol-model-panel .model-note { margin-top: 12px; }
.grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.grid-2 > * { min-width: 0; }
.examples-grid { align-items: stretch; }
.example-row { margin-bottom: 14px; align-items: stretch; }
.code-block { display: flex; flex-direction: column; min-width: 0; height: 100%; }
.code-surface { position: relative; min-width: 0; max-width: 100%; }
.code-block .code-surface { flex: 1; }
pre { width: 100%; max-width: 100%; height: 100%; margin: 0; overflow-x: auto; overflow-y: auto; background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px 48px 12px 12px; color: var(--text); font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size: 12px; line-height: 1.45; }
.detail { margin-top: 16px; }
button { font: inherit; }
.linkish { color: var(--accent); background: transparent; border: 0; padding: 0; cursor: pointer; font-weight: 600; }
.linkish:hover { text-decoration: underline; }
.copy-btn { position: absolute; right: 10px; top: 10px; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; color: var(--muted); background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0; cursor: pointer; box-shadow: 0 1px 2px rgba(31, 35, 40, 0.06); }
.copy-btn:hover { color: var(--accent); background: var(--panel-2); }
.copy-btn[data-copied="true"], .inline-copy-btn[data-copied="true"] { color: var(--good); border-color: rgba(26, 127, 55, 0.4); }
.copy-btn[data-copied="true"]::after, .model-copy-btn[data-copied="true"]::after, .inline-copy-btn[data-copied="true"]::after { content: '已复制'; position: absolute; top: calc(100% + 6px); right: 0; color: #fff; background: var(--text); border-radius: 6px; padding: 4px 6px; font-size: 11px; line-height: 1; white-space: nowrap; pointer-events: none; z-index: 2; }
.inline-copy { display: inline-flex; align-items: center; gap: 8px; }
.inline-copy-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; color: var(--muted); background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0; cursor: pointer; }
.inline-copy-btn:hover { color: var(--accent); background: var(--panel-2); }
@media (max-width: 900px) { body { overflow: auto; } .layout { grid-template-columns: 1fr; height: auto; } .sidebar { height: auto; overflow: visible; border-right: 0; border-bottom: 1px solid var(--border); } .content { overflow: visible; } .cards, .grid-2 { grid-template-columns: 1fr; } .model-chip { flex-basis: 100%; max-width: none; } input { min-width: 0; width: 100%; } .code-block { height: auto; } }
`;

export const uiJs = `const state = { view: 'provider', search: '', selectedProvider: 'openai', selectedProtocol: '', selectedEndpoint: '', selectedModels: {}, data: {} };
const panel = document.getElementById('panel');
const providerMenu = document.getElementById('provider-menu');

const providerOrder = ['openai', 'anthropic', 'gemini', 'deepseek', 'moonshot', 'zhipu', 'aliyun-bailian', 'minimax'];
const protocolOrder = ['openai-compatible', 'openai-responses', 'anthropic-messages', 'gemini-generate', 'dashscope-generation', 'dashscope-openai-chat', 'minimax-chat', 'openai-embeddings', 'rerank', 'openai-models'];
const hiddenOpenAIProtocols = new Set(['images', 'audio', 'moderations', 'files', 'batch'].map((name) => 'openai-' + name));
const providersDocs = {
  openai: 'https://platform.openai.com/docs/api-reference',
  anthropic: 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages',
  gemini: 'https://ai.google.dev/api',
  deepseek: 'https://api-docs.deepseek.com/api/create-chat-completion',
  moonshot: 'https://platform.kimi.ai/docs/api/overview',
  zhipu: 'https://docs.bigmodel.cn/api-reference',
  'aliyun-bailian': 'https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope',
  minimax: 'https://platform.minimax.io/docs/api-reference/text-post'
};
const modelCapabilities = {
  'gpt-5.5': ['深度思考', '工具'],
  'gpt-5.4': ['思考', '工具'],
  'gpt-5.4-mini': ['快速', '工具'],
  'gpt-5.4-nano': ['低成本'],
  'claude-opus-4-7': ['自适应思考', '工具'],
  'claude-sonnet-4-6': ['扩展思考', '工具'],
  'claude-haiku-4-5-20251001': ['扩展思考', '快速'],
  'gemini-3.1-pro-preview': ['思考', '工具'],
  'gemini-3-flash-preview': ['思考', '快速'],
  'gemini-3.1-flash-lite-preview': ['快速'],
  'gemini-2.5-pro': ['思考', '工具'],
  'gemini-2.5-flash': ['思考', '快速'],
  'gemini-2.5-flash-lite': ['快速'],
  'deepseek-v4-pro': ['思考'],
  'deepseek-v4-flash': ['快速'],
  'deepseek-reasoner': ['思考'],
  'kimi-k2.6': ['思考', '工具'],
  'kimi-k2.5': ['工具'],
  'kimi-k2-thinking': ['思考'],
  'glm-5.1': ['思考'],
  'qwen3-max': ['思考'],
  'qwen3.5-plus': ['思考'],
  'qwen3.5-flash': ['快速'],
  'MiniMax-M2.7': ['思考'],
  'MiniMax-M2.7-highspeed': ['快速'],
  'text-embedding-3-small': ['向量'],
  'text-embedding-v3': ['向量'],
  'embedding-3': ['向量'],
  'gte-rerank-v2': ['重排'],
  'rerank-mock': ['重排']
};
const modelCodeMap = {
};
const modelCodeReverseMap = Object.fromEntries(Object.entries(modelCodeMap).map(([key, value]) => [value, key]));

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error(path + ' failed: ' + response.status);
  return response.json();
}

async function load() {
  const [health, overview, providers, routes, models, scenarios, requests] = await Promise.all([
    api('/health'), api('/__admin/overview'), api('/__admin/providers'), api('/__admin/routes'), api('/__admin/models'), api('/__admin/scenarios'), api('/__admin/requests')
  ]);
  state.data = { health, overview, providers, routes, models, scenarios, requests };
  renderProviderMenu();
  render();
}

function renderProviderMenu() {
  const providers = orderedProviders();
  providerMenu.innerHTML = '<div class="sidebar-title">供应商</div>' + providers.map((provider) => '<button class="provider-link ' + (provider.provider === state.selectedProvider && state.view === 'provider' ? 'active' : '') + '" data-provider="' + esc(provider.provider) + '">' + esc(shortProviderName(provider)) + '</button>').join('');
  providerMenu.querySelectorAll('.provider-link').forEach((button) => button.addEventListener('click', () => {
    state.view = 'provider';
    state.selectedProvider = button.dataset.provider;
    state.selectedProtocol = '';
    state.selectedEndpoint = '';
    setActiveNav('');
    renderProviderMenu();
    render();
  }));
}

function orderedProviders() {
  const providers = state.data.providers?.providers ?? [];
  return providers.slice().sort((left, right) => providerOrder.indexOf(left.provider) - providerOrder.indexOf(right.provider));
}

function providerModels(provider) {
  const models = provider?.latestModels?.length ? provider.latestModels : provider?.configuredModels ?? [];
  return models.slice(0, 4);
}

function modelStateKey(provider, protocolKey) {
  return (provider?.provider ?? provider ?? '') + '::' + (protocolKey ?? '');
}

function rerankModels(providerId) {
  if (providerId === 'aliyun-bailian') return ['gte-rerank-v2'];
  if (providerId === 'zhipu') return ['rerank-mock'];
  return [];
}

function protocolModels(provider, protocolKey) {
  if (!provider || !protocolKey) return [];
  if (protocolKey === 'openai-embeddings') return [embeddingModel(provider.provider)];
  if (protocolKey === 'rerank') return rerankModels(provider.provider);
  if (protocolKey === 'openai-models') return [];
  return providerModels(provider);
}

function selectedModelFor(provider, protocolKey) {
  const models = protocolModels(provider, protocolKey);
  const selected = state.selectedModels[modelStateKey(provider, protocolKey)];
  return models.includes(selected) ? selected : models[0];
}

function canonicalModelKey(model) {
  return modelCodeReverseMap[model] ?? model;
}

function modelCapabilityLabels(model) {
  return modelCapabilities[canonicalModelKey(model)] ?? [];
}

function isThinkingModel(model) {
  return modelCapabilityLabels(model).some((label) => label.includes('思考'));
}

function modelCode(model) {
  const key = canonicalModelKey(model);
  return modelCodeMap[key] ?? model;
}

function modelPicker(provider, protocolKey) {
  const models = protocolModels(provider, protocolKey);
  if (!models.length) return '<span class="muted">当前协议不需要选择模型。</span>';
  const selected = selectedModelFor(provider, protocolKey);
  return '<div class="model-picker">' + models.map((model) => '<div class="model-chip ' + (model === selected ? 'active' : '') + '" data-provider="' + esc(provider.provider) + '" data-protocol="' + esc(protocolKey) + '" data-model="' + esc(model) + '"><button class="model-copy-btn" type="button" title="复制模型代码" aria-label="复制模型代码" data-copy="' + esc(modelCode(model)) + '"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M0 6.75C0 5.78.78 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .78 5.78 0 6.75 0h7.5C15.22 0 16 .78 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg></button><strong>' + esc(modelCode(model)) + '</strong><span class="model-meta">' + modelMeta(model) + '</span></div>').join('') + '</div>';
}

function modelMeta(model) {
  const labels = modelCapabilityLabels(model);
  return labels.length ? labels.map((label) => '<span>' + esc(label) + '</span>').join('') : '<span>通用</span>';
}

function selectedModelSummary(provider, protocol) {
  const protocolKey = protocol?.key ?? '';
  const model = selectedModelFor(provider, protocolKey);
  if (!model) {
    if (protocolKey === 'openai-models') return '<div class="model-note">当前协议用于列出该提供商的可用模型，不需要传入模型参数。</div>';
    return '<div class="model-note">当前协议使用固定资源类型，不需要切换模型。</div>';
  }
  const labels = modelCapabilityLabels(model);
  const fields = isThinkingModel(model) ? '响应示例会展示 reasoning_content / thinking / thought 等思考字段。' : '响应示例按普通文本模型展示。';
  return '<div class="model-note">当前示例模型：<strong>' + esc(modelCode(model)) + '</strong>' + (labels.length ? ' · ' + esc(labels.join(' / ')) : '') + '<br>切换模型后，cURL、非流式响应、流式响应会同步刷新；' + fields + '</div>';
}

function visibleRoutes(providerId) {
  return (state.data.routes ?? []).filter((route) => route.provider === providerId && !hiddenOpenAIProtocols.has(route.protocol) && !route.description?.startsWith('via model'));
}

function groupedProtocols(providerId) {
  const groups = new Map();
  for (const route of visibleRoutes(providerId)) {
    const key = protocolMenuKey(route);
    if (!groups.has(key)) groups.set(key, { key, label: protocolLabel(route), routes: [] });
    groups.get(key).routes.push(route);
  }
  return Array.from(groups.values()).sort((left, right) => protocolSortIndex(left.key) - protocolSortIndex(right.key));
}

function render() {
  panel.innerHTML = renderers[state.view]();
  attachDynamicHandlers();
}

function viewTitle() {
  if (state.view === 'provider') return shortProviderName(currentProvider());
  return { provider: shortProviderName(currentProvider()), requests: '请求记录' }[state.view] ?? shortProviderName(currentProvider());
}

const renderers = {
  overview() {
    const o = state.data.overview;
    return '<div class="cards">' +
      card('提供商', o.providersCount) + card('模型', o.modelsCount) + card('场景', o.scenariosCount) + card('请求', o.requestsCount) +
      '</div><h2>服务信息</h2>' + table([['主机', o.server.host], ['端口', o.server.port], ['认证模式', o.auth.mode], ['提供商模式', JSON.stringify(o.providers.enabled)]]) +
      '<h2>最近请求</h2>' + requestsTable(o.recentRequests || []);
  },
  providers() {
    const providers = filtered(orderedProviders(), [p => p.provider, p => p.displayName, p => p.groups.join(','), p => p.routes.join(' '), p => providerModels(p).join(',')]);
    return '<table><thead><tr><th>排序</th><th>供应商</th><th>区域</th><th>模型</th><th>协议数</th><th>文档</th></tr></thead><tbody>' + providers.map((p, index) => {
      const protocols = groupedProtocols(p.provider);
      return '<tr><td>' + (index + 1) + '</td><td><button class="linkish provider-open" data-provider="' + esc(p.provider) + '">' + esc(p.displayName) + '</button><br><span class="muted">' + esc(p.provider) + '</span></td><td>' + badges(p.groups) + '</td><td>' + badges(providerModels(p)) + '</td><td>' + protocols.length + '</td><td><a href="' + providersDocs[p.provider] + '" target="_blank">官方文档</a></td></tr>';
    }).join('') + '</tbody></table>';
  },
  provider() {
    const provider = currentProvider();
    if (!provider) return '<p>未找到供应商。</p>';
    const protocols = groupedProtocols(provider.provider);
    if (!state.selectedProtocol && protocols[0]) state.selectedProtocol = protocols[0].key;
    const protocol = protocols.find((item) => item.key === state.selectedProtocol) ?? protocols[0];
    if (!state.selectedEndpoint && protocol?.routes[0]) state.selectedEndpoint = routeId(protocol.routes[0]);
    const selectedRoute = protocol?.routes.find((route) => routeId(route) === state.selectedEndpoint) ?? protocol?.routes[0];
    return providerHeader(provider, selectedRoute) + protocolTabs(protocols) + protocolModelSection(provider, protocol) + (selectedRoute ? endpointDetail(selectedRoute, protocol) : '<p>该供应商暂无可展示端点。</p>');
  },
  requests() {
    const requests = filtered(state.data.requests, [r => r.id, r => r.provider, r => r.endpoint, r => r.model, r => r.matchedScenarioId, r => r.status]);
    return requestsTable(requests) + '<div class="detail"><h2>原始请求</h2><pre>' + esc(JSON.stringify(requests, null, 2)) + '</pre></div>';
  }
};

function providerHeader(provider, selectedRoute) {
  return '<h2>' + esc(provider.displayName) + '</h2>' + table([['Provider', provider.provider], ['分组', provider.groups.join(', ')], ['Base URL', protocolBaseUrl()], ['官方文档', '<a href="' + providersDocs[provider.provider] + '" target="_blank">' + providersDocs[provider.provider] + '</a>']], 'provider-meta');
}

function protocolTabs(protocols) {
  return '<h2>协议菜单</h2><div class="protocol-tabs">' + protocols.map((protocol) => '<button class="protocol-tab ' + (protocol.key === state.selectedProtocol ? 'active' : '') + '" data-protocol="' + esc(protocol.key) + '">' + esc(protocol.label) + '</button>').join('') + '</div>';
}

function protocolModelSection(provider, protocol) {
  if (!protocol) return '';
  return '<div class="protocol-model-panel"><div class="protocol-model-head"><h2>协议模型</h2><div class="protocol-model-current">当前协议：<strong>' + esc(protocol.label) + '</strong></div></div>' + modelPicker(provider, protocol.key) + selectedModelSummary(provider, protocol) + '</div>';
}

function protocolBaseUrl() {
  const value = currentBaseUrl();
  return '<div class="inline-copy"><code>' + esc(value) + '</code><button class="inline-copy-btn" type="button" title="复制 Base URL" aria-label="复制 Base URL" data-copy="' + esc(value) + '"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M0 6.75C0 5.78.78 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .78 5.78 0 6.75 0h7.5C15.22 0 16 .78 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg></button></div>';
}

function currentBaseUrl() {
  return location.origin || 'http://127.0.0.1:4000';
}

function endpointDetail(route, protocol) {
  const example = exampleFor(route);
  return '<h2>端点列表</h2>' + endpointSummaryTable(protocol, route, example) + '<div class="detail">' + exampleSections(example) + '</div>';
}

function endpointSummaryTable(protocol, selectedRoute, selectedExample) {
  if (!protocol) return '';
  return '<table><thead><tr><th>方法</th><th>端点</th><th>说明</th><th>必填 Header</th><th>必填字段</th><th>官方文档</th></tr></thead><tbody>' + protocol.routes.map((route) => {
    const example = routeId(route) === routeId(selectedRoute) ? selectedExample : exampleFor(route);
    return '<tr class="endpoint-row ' + (routeId(route) === state.selectedEndpoint ? 'active' : '') + '" data-endpoint="' + esc(routeId(route)) + '"><td><span class="badge">' + esc(route.method) + '</span></td><td><code>' + esc(route.path) + '</code></td><td>' + esc(route.description || protocol.label) + '</td><td>' + esc(example.headers.join(', ') || '-') + '</td><td>' + esc(example.required.join(', ') || '-') + '</td><td><a href="' + esc(example.docsUrl) + '" target="_blank">官方文档</a></td></tr>';
  }).join('') + '</tbody></table>';
}

function exampleSections(example) {
  const stream = example.stream;
  const streamCurl = stream ? codeBlock('流式 cURL', stream.curl) : '<p class="muted">该端点暂无流式示例。</p>';
  const streamResponse = stream ? codeBlock('流式响应示例', stream.responseText) : '<p class="muted">该端点暂无流式示例。</p>';
  return '<div class="grid-2 examples-grid"><h2>非流式示例</h2><h2>流式示例</h2></div>' +
    '<div class="grid-2 example-row">' + codeBlock('非流式 cURL', example.curl) + streamCurl + '</div>' +
    '<div class="grid-2 example-row">' + codeBlock('非流式响应 Body', JSON.stringify(example.responseBody, null, 2)) + streamResponse + '</div>';
}

function streamExampleFor(route, body, responseText) {
  if (route.method === 'GET') return undefined;
  return {
    curl: curl(route.path, { ...body, stream: true }, undefined, route.method),
    responseText
  };
}

function exampleFor(route) {
  const model = defaultModel(route.provider, route.protocol, protocolMenuKey(route));
  const docsUrl = providersDocs[route.provider] ?? providersDocs.openai;
  const nl = String.fromCharCode(10);
  if (route.protocol === 'openai-responses') return { ...openAIExample(route, docsUrl, { model, input: 'hello' }, openAIResponsesResponse(model, route), ['model', 'input']), stream: streamExampleFor(route, { model, input: 'hello' }, openAIResponsesStream(model, route, nl)) };
  if (route.protocol === 'openai-embeddings') return openAIExample(route, docsUrl, { model: embeddingModel(route.provider), input: 'hello' }, openAIEmbeddingResponse(embeddingModel(route.provider), route), ['model', 'input']);
  if (route.protocol === 'anthropic-messages') {
    const body = { model, max_tokens: 128, messages: [{ role: 'user', content: 'hello' }] };
    return { docsUrl, headers: ['x-api-key', 'anthropic-version', 'Content-Type'], required: ['model', 'max_tokens', 'messages'], requestBody: body, responseBody: anthropicMessageResponse(model, route), curl: curl(route.path, body, ['x-api-key: test-key', 'anthropic-version: 2023-06-01', 'Content-Type: application/json']), stream: { curl: curl(route.path, { ...body, stream: true }, ['x-api-key: test-key', 'anthropic-version: 2023-06-01', 'Content-Type: application/json']), responseText: anthropicMessageStream(model, route, nl) } };
  }
  if (route.protocol === 'gemini-generate-content') {
    const body = { contents: [{ role: 'user', parts: [{ text: 'hello' }] }] };
    return { docsUrl, headers: ['Content-Type'], required: ['contents'], requestBody: body, responseBody: geminiContentResponse(route, model), curl: curl(route.path.replace(':modelAndMethod', model + ':generateContent'), body, ['Content-Type: application/json']), stream: { curl: curl(route.path.replace(':modelAndMethod', model + ':streamGenerateContent'), body, ['Content-Type: application/json']), responseText: prettyJson(geminiStreamResponse(route, model)) } };
  }
  if (route.protocol === 'dashscope-generation') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'input.messages'], requestBody: { model, input: { messages: [{ role: 'user', content: 'hello' }] }, parameters: { result_format: 'message' } }, responseBody: dashScopeGenerationResponse(route, model), curl: curl(route.path, { model, input: { messages: [{ role: 'user', content: 'hello' }] }, parameters: { result_format: 'message' } }), stream: streamExampleFor(route, { model, input: { messages: [{ role: 'user', content: 'hello' }] }, parameters: { incremental_output: true } }, dashScopeGenerationStream(route, model, nl)) };
  if (route.protocol === 'minimax-chat') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'messages'], requestBody: { model, messages: [{ role: 'user', content: 'hello' }] }, responseBody: miniMaxChatResponse(model, route), curl: curl(route.path, { model, messages: [{ role: 'user', content: 'hello' }] }), stream: streamExampleFor(route, { model, messages: [{ role: 'user', content: 'hello' }] }, miniMaxChatStream(model, route, nl)) };
  if (route.protocol === 'rerank') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'query', 'documents'], requestBody: { model, query: 'hello', documents: ['hello world', 'other'] }, responseBody: rerankResponse(route), curl: curl(route.path, { model, query: 'hello', documents: ['hello world', 'other'] }) };
  if (route.method === 'GET') return { docsUrl, headers: [], required: [], requestBody: {}, responseBody: modelsResponse(route.provider), curl: curl(route.path, {}, [], 'GET') };
  return { ...openAIExample(route, docsUrl, { model, messages: [{ role: 'user', content: 'hello' }] }, openAIChatResponse(model, route), ['model', 'messages']), stream: streamExampleFor(route, { model, messages: [{ role: 'user', content: 'hello' }] }, openAIChatStream(model, route, nl)) };
}

function usage() { return { prompt_tokens: 8, completion_tokens: 7, total_tokens: 15 }; }
function tokenUsage() { return { input_tokens: 8, output_tokens: 7, total_tokens: 15 }; }
function createdAt() { return 1777103905; }
function sseData(payload) { return 'data: ' + JSON.stringify(payload); }
function sseEvent(name, payload, nl) { return 'event: ' + name + nl + 'data: ' + JSON.stringify({ type: name, ...payload }); }
function thinkingText(model, route) { return 'Reasoning trace for ' + model + ' on ' + route.path + '.'; }
function endpointKey(route) { return route.path.replace(/^\\/+/, '').replace(':modelAndMethod', 'model').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase(); }
function endpointText(route) { return providerDisplayName(route.provider) + ' ' + route.path; }
function providerDisplayName(providerId) { return shortProviderName(orderedProviders().find((provider) => provider.provider === providerId)) || providerId; }
function openAIChatResponse(model, route) { const message = { role: 'assistant', ...(isThinkingModel(model) ? { reasoning_content: thinkingText(model, route) } : {}), content: 'Hello from ' + endpointText(route) + '.' }; return { id: 'chatcmpl_mock_' + endpointKey(route), object: 'chat.completion', created: createdAt(), model, choices: [{ index: 0, message, finish_reason: 'stop' }], usage: usage() }; }
function openAIChatChunk(model, route, delta, finishReason = null, extra = {}) { return { id: 'chatcmpl_mock_' + endpointKey(route), object: 'chat.completion.chunk', created: createdAt(), model, choices: [{ index: 0, delta, finish_reason: finishReason }], ...extra }; }
function openAIChatStream(model, route, nl) { const chunks = [sseData(openAIChatChunk(model, route, { role: 'assistant' }))]; if (isThinkingModel(model)) chunks.push(sseData(openAIChatChunk(model, route, { reasoning_content: thinkingText(model, route) }))); chunks.push(sseData(openAIChatChunk(model, route, { content: 'Hello' })), sseData(openAIChatChunk(model, route, { content: ' from ' + endpointText(route) + '.' })), sseData(openAIChatChunk(model, route, {}, 'stop')), sseData(openAIChatChunk(model, route, {}, null, { usage: usage() })), 'data: [DONE]'); return chunks.join(nl + nl); }
function openAIResponsesResponse(model, route) { const text = 'This is a mock response from ' + endpointText(route) + '.'; const output = [{ id: 'msg_mock_' + endpointKey(route), type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] }]; if (isThinkingModel(model)) output.unshift({ id: 'rs_mock_' + endpointKey(route), type: 'reasoning', summary: [{ type: 'summary_text', text: thinkingText(model, route) }] }); return { id: 'resp_mock_' + endpointKey(route), object: 'response', created_at: createdAt(), status: 'completed', model, output, output_text: text, usage: usage() }; }
function openAIResponsesStream(model, route, nl) { const text = 'This is a mock response from ' + endpointText(route) + '.'; const events = [sseEvent('response.created', { response: { id: 'resp_mock_' + endpointKey(route), object: 'response', status: 'in_progress', model } }, nl)]; if (isThinkingModel(model)) events.push(sseEvent('response.reasoning_summary.delta', { delta: thinkingText(model, route) }, nl)); events.push(sseEvent('response.output_text.delta', { delta: text.slice(0, 24) }, nl), sseEvent('response.output_text.delta', { delta: text.slice(24) }, nl), sseEvent('response.output_text.done', { text }, nl), sseEvent('response.completed', { response: { id: 'resp_mock_' + endpointKey(route), object: 'response', status: 'completed', model, usage: usage() } }, nl), 'data: [DONE]'); return events.join(nl + nl); }
function openAIEmbeddingResponse(model, route) { return { object: 'list', data: [{ object: 'embedding', index: 0, embedding: [0.0123, -0.0456, 0.0789], endpoint: route.path }], model, usage: { prompt_tokens: 1, total_tokens: 1 } }; }
function anthropicMessageResponse(model, route) { const content = isThinkingModel(model) ? [{ type: 'thinking', thinking: thinkingText(model, route), signature: 'mock_signature' }, { type: 'text', text: 'Hello from ' + endpointText(route) + '.' }] : [{ type: 'text', text: 'Hello from ' + endpointText(route) + '.' }]; return { id: 'msg_mock_' + endpointKey(route), type: 'message', role: 'assistant', model, content, stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 8, output_tokens: 7 } }; }
function anthropicMessageStream(model, route, nl) { const events = [sseEvent('message_start', { message: { id: 'msg_mock_' + endpointKey(route), type: 'message', role: 'assistant', model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 8, output_tokens: 0 } } }, nl)]; let textIndex = 0; if (isThinkingModel(model)) { events.push(sseEvent('content_block_start', { index: 0, content_block: { type: 'thinking', thinking: '' } }, nl), sseEvent('content_block_delta', { index: 0, delta: { type: 'thinking_delta', thinking: thinkingText(model, route) } }, nl), sseEvent('content_block_stop', { index: 0 }, nl)); textIndex = 1; } events.push(sseEvent('content_block_start', { index: textIndex, content_block: { type: 'text', text: '' } }, nl), sseEvent('content_block_delta', { index: textIndex, delta: { type: 'text_delta', text: 'Hello' } }, nl), sseEvent('content_block_delta', { index: textIndex, delta: { type: 'text_delta', text: ' from ' + endpointText(route) + '.' } }, nl), sseEvent('content_block_stop', { index: textIndex }, nl), sseEvent('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 7 } }, nl), sseEvent('message_stop', {}, nl)); return events.join(nl + nl); }
function geminiContentResponse(route, model) { const parts = isThinkingModel(model) ? [{ thought: true, text: thinkingText(model, route) }, { text: 'Hello from ' + endpointText(route) + '.' }] : [{ text: 'Hello from ' + endpointText(route) + '.' }]; return { candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP', index: 0, safetyRatings: [] }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 7, totalTokenCount: 15 } }; }
function geminiStreamResponse(route, model) { const items = []; if (isThinkingModel(model)) items.push({ candidates: [{ content: { role: 'model', parts: [{ thought: true, text: thinkingText(model, route) }] }, index: 0, safetyRatings: [] }] }); items.push({ candidates: [{ content: { role: 'model', parts: [{ text: 'Hello' }] }, index: 0, safetyRatings: [] }] }, { candidates: [{ content: { role: 'model', parts: [{ text: ' from ' + endpointText(route) + '.' }] }, finishReason: 'STOP', index: 0, safetyRatings: [] }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 7, totalTokenCount: 15 } }); return items; }
function dashScopeGenerationResponse(route, model) { const message = { role: 'assistant', ...(isThinkingModel(model) ? { reasoning_content: thinkingText(model, route) } : {}), content: '你好，我是 ' + endpointText(route) + ' 的模拟响应。' }; return { request_id: 'req_mock_' + endpointKey(route), output: { choices: [{ finish_reason: 'stop', message }] }, usage: tokenUsage() }; }
function dashScopeGenerationStream(route, model, nl) { const events = []; if (isThinkingModel(model)) events.push(sseEvent('result', { request_id: 'req_mock_' + endpointKey(route), output: { choices: [{ finish_reason: null, message: { role: 'assistant', reasoning_content: thinkingText(model, route), content: '' } }] } }, nl)); events.push(sseEvent('result', { request_id: 'req_mock_' + endpointKey(route), output: { choices: [{ finish_reason: null, message: { role: 'assistant', content: '你好，' } }] } }, nl), sseEvent('result', { request_id: 'req_mock_' + endpointKey(route), output: { choices: [{ finish_reason: null, message: { role: 'assistant', content: '我是 ' + endpointText(route) + ' 的模拟响应。' } }] } }, nl), sseEvent('result', { request_id: 'req_mock_' + endpointKey(route), output: { choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: '' } }] }, usage: tokenUsage() }, nl)); return events.join(nl + nl); }
function miniMaxChatResponse(model, route) { const message = { role: 'assistant', ...(isThinkingModel(model) ? { reasoning_content: thinkingText(model, route) } : {}), content: '你好，我是 ' + endpointText(route) + ' 的模拟响应。' }; return { id: 'minimax-mock-' + endpointKey(route), choices: [{ index: 0, message, finish_reason: 'stop' }], created: createdAt(), model, usage: { total_tokens: 15 }, base_resp: { status_code: 0, status_msg: 'success' } }; }
function miniMaxChatStream(model, route, nl) { const events = []; if (isThinkingModel(model)) events.push(sseData({ id: 'minimax-mock-' + endpointKey(route), created: createdAt(), model, choices: [{ index: 0, delta: { reasoning_content: thinkingText(model, route) }, finish_reason: null }] })); events.push(sseData({ id: 'minimax-mock-' + endpointKey(route), created: createdAt(), model, choices: [{ index: 0, delta: { content: '你好，' }, finish_reason: null }] }), sseData({ id: 'minimax-mock-' + endpointKey(route), created: createdAt(), model, choices: [{ index: 0, delta: { content: '我是 ' + endpointText(route) + ' 的模拟响应。' }, finish_reason: null }] }), sseData({ id: 'minimax-mock-' + endpointKey(route), created: createdAt(), model, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage: { total_tokens: 15 }, base_resp: { status_code: 0, status_msg: 'success' } }), 'data: [DONE]'); return events.join(nl + nl); }
function rerankResponse(route) { return { id: 'rerank_mock_' + endpointKey(route), object: 'rerank', results: [{ index: 0, relevance_score: 1, document: 'hello world', endpoint: route.path }, { index: 1, relevance_score: 0.12, document: 'other', endpoint: route.path }], usage: { total_tokens: 2 } }; }
function modelsResponse(providerId) { const provider = orderedProviders().find((item) => item.provider === providerId); return { object: 'list', data: providerModels(provider).map((id) => ({ id, object: 'model', owned_by: 'mockmind' })) }; }

function openAIExample(route, docsUrl, requestBody, responseBody, required) {
  return { docsUrl, headers: ['Authorization', 'Content-Type'], required, requestBody, responseBody, curl: curl(route.path, requestBody, undefined, route.method) };
}
function curl(path, body, headers = ['Authorization: Bearer test-key', 'Content-Type: application/json'], method = 'POST') {
  const normalizedPath = path.replace(':modelAndMethod', 'gemini-3-flash-preview:generateContent');
  const baseUrl = currentBaseUrl();
  if (method === 'GET') return 'curl ' + baseUrl + normalizedPath;
  const slash = String.fromCharCode(92);
  const nl = String.fromCharCode(10);
  const headerLines = headers.map((header) => "  -H '" + header + "' " + slash).join(nl);
  return 'curl ' + baseUrl + normalizedPath + ' ' + slash + nl + headerLines + nl + "  -d '" + prettyJson(body) + "'";
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function markCopied(button) {
  if (!button) return;
  if (button._copyTimer) clearTimeout(button._copyTimer);
  button.dataset.copied = 'true';
  button._copyTimer = setTimeout(() => { delete button.dataset.copied; }, 1200);
}

function attachDynamicHandlers() {
  panel.querySelectorAll('.provider-open').forEach((button) => button.addEventListener('click', () => { state.view = 'provider'; state.selectedProvider = button.dataset.provider; state.selectedProtocol = ''; state.selectedEndpoint = ''; setActiveNav(''); renderProviderMenu(); render(); }));
  panel.querySelectorAll('.protocol-tab').forEach((button) => button.addEventListener('click', () => { state.selectedProtocol = button.dataset.protocol; state.selectedEndpoint = ''; render(); }));
  panel.querySelectorAll('.endpoint-row').forEach((row) => row.addEventListener('click', () => { state.selectedEndpoint = row.dataset.endpoint; render(); }));
  panel.querySelectorAll('.model-chip').forEach((button) => button.addEventListener('click', () => { state.selectedModels[modelStateKey(button.dataset.provider, button.dataset.protocol)] = button.dataset.model; render(); }));
  panel.querySelectorAll('.model-copy-btn').forEach((button) => button.addEventListener('click', async (event) => { event.stopPropagation(); if (await copyText(button.dataset.copy || '')) markCopied(button); }));
  panel.querySelectorAll('.inline-copy-btn').forEach((button) => button.addEventListener('click', async () => { if (await copyText(button.dataset.copy || '')) markCopied(button); }));
  panel.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', async () => { if (await copyText(button.parentElement?.querySelector('pre')?.textContent || '')) markCopied(button); }));
}
function codeBlock(title, content) { return '<div class="code-block"><h3>' + esc(title) + '</h3><div class="code-surface"><button class="copy-btn" title="复制" aria-label="复制"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M0 6.75C0 5.78.78 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .78 5.78 0 6.75 0h7.5C15.22 0 16 .78 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .14.11.25.25.25h7.5c.14 0 .25-.11.25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg></button><pre>' + esc(content) + '</pre></div></div>'; }
function routeId(route) { return route.method + ' ' + route.path; }
function currentProvider() { return orderedProviders().find((provider) => provider.provider === state.selectedProvider) ?? orderedProviders()[0]; }
function shortProviderName(provider) { return provider?.displayName?.replace('OpenAI Compatible', 'OpenAI').replace('Google Gemini', 'Gemini').replace('Alibaba Bailian / DashScope', 'DashScope / 阿里百炼') ?? ''; }
function protocolMenuKey(route) { if (route.protocol === 'openai-compatible' && route.path.includes('/models')) return 'openai-models'; if (route.protocol === 'gemini-generate-content') return route.path.includes('streamGenerateContent') ? 'gemini-stream' : 'gemini-generate'; if (route.protocol === 'openai-compatible' && route.path.includes('compatible-mode')) return 'dashscope-openai-chat'; return route.protocol; }
function protocolLabel(route) { const key = protocolMenuKey(route); return ({ 'openai-compatible': 'Chat Completions', 'openai-models': 'Models', 'openai-responses': 'Responses', 'openai-embeddings': 'Embeddings', 'anthropic-messages': 'Messages', 'gemini-generate': 'generateContent', 'gemini-stream': 'streamGenerateContent', 'dashscope-generation': 'Native Text Generation', 'dashscope-openai-chat': 'OpenAI Compatible Chat', 'minimax-chat': 'ChatCompletion v2', rerank: 'Rerank' })[key] ?? route.protocol; }
function protocolSortIndex(key) { const index = protocolOrder.indexOf(key); return index === -1 ? protocolOrder.length : index; }
function defaultModel(provider, protocol, protocolKey = protocol) {
  if (provider === 'zhipu' && protocol === 'rerank') return 'rerank-mock';
  if (provider === 'aliyun-bailian' && protocol === 'rerank') return 'gte-rerank-v2';
  const selectedProvider = orderedProviders().find((item) => item.provider === provider);
  return modelCode(selectedModelFor(selectedProvider, protocolKey) ?? ({ anthropic: 'claude-sonnet-4-6', gemini: 'gemini-3-flash-preview', deepseek: 'deepseek-v4-flash', moonshot: 'kimi-k2.6', zhipu: 'glm-5.1', 'aliyun-bailian': 'qwen3-max', minimax: 'MiniMax-M2.7', openai: 'gpt-5.5' }[provider] ?? 'gpt-5.5'));
}
function embeddingModel(provider) { if (provider === 'aliyun-bailian') return 'text-embedding-v3'; if (provider === 'zhipu') return 'embedding-3'; return 'text-embedding-3-small'; }
function filtered(items, fields) { const query = state.search.trim().toLowerCase(); return query ? items.filter((item) => fields.some((field) => String(field(item) ?? '').toLowerCase().includes(query))) : items; }
function card(label, value) { return '<div class="card"><span class="muted">' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>'; }
function table(rows, className = '') { return '<table' + (className ? ' class="' + esc(className) + '"' : '') + '><tbody>' + rows.map(([k, v]) => '<tr><th>' + esc(k) + '</th><td>' + (typeof v === 'string' && v.startsWith('<') ? v : esc(v)) + '</td></tr>').join('') + '</tbody></table>'; }
function badges(values = []) { return values.length ? values.map((v) => '<span class="badge">' + esc(v) + '</span>').join('') : '<span class="muted">-</span>'; }
function requestsTable(requests) { return '<table><thead><tr><th>ID</th><th>状态</th><th>提供商</th><th>模型</th><th>端点</th><th>命中场景</th><th>耗时</th></tr></thead><tbody>' + requests.slice().reverse().map((r) => '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.provider) + '</td><td>' + esc(r.model || '-') + '</td><td><code>' + esc(r.endpoint) + '</code></td><td>' + esc(r.matchedScenarioId || '-') + '</td><td>' + esc(r.durationMs) + 'ms</td></tr>').join('') + '</tbody></table>'; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
window.copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};
function setActiveNav(view) { document.querySelectorAll('.nav').forEach((item) => item.classList.toggle('active', item.dataset.view === view)); }
document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view; state.search = ''; setActiveNav(button.dataset.view); renderProviderMenu(); render(); }));
load().catch((error) => { panel.innerHTML = '<pre>' + esc(error.stack || error.message) + '</pre>'; });
`;
