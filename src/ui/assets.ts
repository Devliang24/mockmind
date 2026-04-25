export const uiHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MockMind Console</title>
    <link rel="stylesheet" href="/__ui/style.css" />
  </head>
  <body>
    <div id="app">
      <header class="topbar">
        <div>
          <strong>MockMind Console</strong>
          <span class="muted">协议模拟控制台</span>
        </div>
        <div class="status"><span id="health-dot" class="dot"></span><span id="health-text">加载中</span></div>
      </header>
      <div class="layout">
        <aside class="sidebar">
          <button data-view="overview" class="nav active">概览</button>
          <button data-view="providers" class="nav">供应商</button>
          <div id="provider-menu" class="provider-menu"></div>
          <button data-view="requests" class="nav">请求记录</button>
        </aside>
        <main class="content">
          <section class="toolbar">
            <h1 id="view-title">概览</h1>
            <input id="search" placeholder="搜索当前页面..." />
          </section>
          <section id="panel" class="panel">Loading...</section>
        </main>
      </div>
    </div>
    <script src="/__ui/app.js"></script>
  </body>
</html>`;

export const uiCss = `:root {
  color-scheme: light dark;
  --bg: #0f172a;
  --panel: #111827;
  --panel-2: #1f2937;
  --text: #e5e7eb;
  --muted: #94a3b8;
  --border: #334155;
  --accent: #38bdf8;
  --good: #22c55e;
  --bad: #ef4444;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--text); }
.topbar { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid var(--border); background: #020617; }
.muted { color: var(--muted); margin-left: 10px; font-size: 13px; }
.status { display: flex; align-items: center; gap: 8px; color: var(--muted); }
.dot { width: 10px; height: 10px; border-radius: 999px; background: var(--bad); display: inline-block; }
.dot.ok { background: var(--good); }
.layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: calc(100vh - 56px); }
.sidebar { padding: 16px; border-right: 1px solid var(--border); background: #020617; }
.nav, .provider-link { width: 100%; text-align: left; color: var(--text); background: transparent; border: 1px solid transparent; padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 6px; }
.nav:hover, .nav.active, .provider-link:hover, .provider-link.active { border-color: var(--border); background: var(--panel); }
.nav.active { color: var(--accent); }
.provider-menu { margin: 8px 0 14px; padding-left: 10px; border-left: 1px solid var(--border); }
.provider-link { width: 100%; text-align: left; color: var(--muted); background: transparent; border: 1px solid transparent; padding: 8px 10px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; font-size: 13px; }
.provider-link.active { color: var(--accent); }
.protocol-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; }
.protocol-tab { color: var(--text); background: #0f172a; border: 1px solid var(--border); padding: 8px 10px; border-radius: 999px; cursor: pointer; }
.protocol-tab.active { color: var(--accent); border-color: var(--accent); }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.code-block { position: relative; margin-bottom: 14px; }
.copy-btn { position: absolute; right: 8px; top: 8px; }
.content { padding: 20px; overflow: auto; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
h1 { margin: 0; font-size: 24px; }
input { background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; min-width: 280px; }
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 16px; min-height: 320px; }
.cards { display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 12px; margin-bottom: 18px; }
.card { background: var(--panel-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
.card strong { display: block; font-size: 28px; margin-top: 6px; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { border-bottom: 1px solid var(--border); padding: 10px; text-align: left; vertical-align: top; }
th { color: var(--muted); font-weight: 600; }
.badge { display: inline-block; background: #0f172a; border: 1px solid var(--border); border-radius: 999px; padding: 2px 8px; margin: 2px; color: var(--muted); font-size: 12px; }
pre { margin: 0; overflow: auto; background: #020617; border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: #d1fae5; }
.detail { margin-top: 16px; }
.copy { float: right; }
button { font: inherit; }
@media (max-width: 800px) { .layout { grid-template-columns: 1fr; } .sidebar { border-right: 0; border-bottom: 1px solid var(--border); } .cards { grid-template-columns: repeat(2, 1fr); } .toolbar { align-items: stretch; flex-direction: column; } input { min-width: 0; width: 100%; } }
`;

export const uiJs = `const state = { view: 'overview', search: '', selectedProvider: 'openai', selectedProtocol: '', selectedEndpoint: '', data: {} };
const title = document.getElementById('view-title');
const panel = document.getElementById('panel');
const search = document.getElementById('search');
const providerMenu = document.getElementById('provider-menu');

const providerOrder = ['openai', 'anthropic', 'gemini', 'deepseek', 'moonshot', 'zhipu', 'aliyun-bailian', 'minimax'];
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
  document.getElementById('health-dot').classList.toggle('ok', Boolean(health.ok));
  document.getElementById('health-text').textContent = health.ok ? '健康' : '异常';
  renderProviderMenu();
  render();
}

function renderProviderMenu() {
  const providers = orderedProviders();
  providerMenu.innerHTML = providers.map((provider) => '<button class="provider-link ' + (provider.provider === state.selectedProvider ? 'active' : '') + '" data-provider="' + esc(provider.provider) + '">' + esc(shortProviderName(provider)) + '</button>').join('');
  providerMenu.querySelectorAll('.provider-link').forEach((button) => button.addEventListener('click', () => {
    state.view = 'provider';
    state.selectedProvider = button.dataset.provider;
    state.selectedProtocol = '';
    state.selectedEndpoint = '';
    setActiveNav('providers');
    renderProviderMenu();
    render();
  }));
}

function orderedProviders() {
  const providers = state.data.providers?.providers ?? [];
  return providers.slice().sort((left, right) => providerOrder.indexOf(left.provider) - providerOrder.indexOf(right.provider));
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
  return Array.from(groups.values());
}

function render() {
  title.textContent = viewTitle();
  search.style.display = state.view === 'overview' ? 'none' : 'block';
  panel.innerHTML = renderers[state.view]();
  attachDynamicHandlers();
}

function viewTitle() {
  if (state.view === 'provider') return shortProviderName(currentProvider());
  return { overview: '概览', providers: '供应商', requests: '请求记录' }[state.view] ?? '概览';
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
    const providers = filtered(orderedProviders(), [p => p.provider, p => p.displayName, p => p.groups.join(','), p => p.routes.join(' ')]);
    return '<table><thead><tr><th>排序</th><th>供应商</th><th>区域</th><th>模型</th><th>协议数</th><th>文档</th></tr></thead><tbody>' + providers.map((p, index) => {
      const protocols = groupedProtocols(p.provider);
      return '<tr><td>' + (index + 1) + '</td><td><button class="linkish provider-open" data-provider="' + esc(p.provider) + '">' + esc(p.displayName) + '</button><br><span class="muted">' + esc(p.provider) + '</span></td><td>' + badges(p.groups) + '</td><td>' + badges(p.configuredModels) + '</td><td>' + protocols.length + '</td><td><a href="' + providersDocs[p.provider] + '" target="_blank">官方文档</a></td></tr>';
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
    return providerHeader(provider, protocols) + protocolTabs(protocols) + endpointTable(protocol) + (selectedRoute ? endpointDetail(selectedRoute) : '<p>该供应商暂无可展示端点。</p>');
  },
  requests() {
    const requests = filtered(state.data.requests, [r => r.id, r => r.provider, r => r.endpoint, r => r.model, r => r.matchedScenarioId, r => r.status]);
    return requestsTable(requests) + '<div class="detail"><h2>原始请求</h2><pre>' + esc(JSON.stringify(requests, null, 2)) + '</pre></div>';
  }
};

function providerHeader(provider, protocols) {
  return '<div class="cards">' + card('协议', protocols.length) + card('端点', visibleRoutes(provider.provider).length) + card('模型', provider.configuredModels.length) + card('区域', provider.groups.includes('international') ? '国外' : '国内') + '</div>' +
    '<h2>' + esc(provider.displayName) + '</h2>' + table([['Provider', provider.provider], ['分组', provider.groups.join(', ')], ['模型', provider.configuredModels.join(', ') || '-'], ['官方文档', '<a href="' + providersDocs[provider.provider] + '" target="_blank">' + providersDocs[provider.provider] + '</a>']]);
}

function protocolTabs(protocols) {
  return '<h2>协议菜单</h2><div class="protocol-tabs">' + protocols.map((protocol) => '<button class="protocol-tab ' + (protocol.key === state.selectedProtocol ? 'active' : '') + '" data-protocol="' + esc(protocol.key) + '">' + esc(protocol.label) + '</button>').join('') + '</div>';
}

function endpointTable(protocol) {
  if (!protocol) return '';
  return '<h2>端点列表</h2><table><thead><tr><th>方法</th><th>端点</th><th>说明</th></tr></thead><tbody>' + protocol.routes.map((route) => '<tr class="endpoint-row ' + (routeId(route) === state.selectedEndpoint ? 'active' : '') + '" data-endpoint="' + esc(routeId(route)) + '"><td><span class="badge">' + esc(route.method) + '</span></td><td><code>' + esc(route.path) + '</code></td><td>' + esc(route.description || protocol.label) + '</td></tr>').join('') + '</tbody></table>';
}

function endpointDetail(route) {
  const example = exampleFor(route);
  const relatedScenarios = (state.data.scenarios ?? []).filter((scenario) => scenario.provider === route.provider && (!scenario.endpoint || scenario.endpoint === route.endpoint || scenario.endpoint === route.path));
  return '<div class="detail"><h2>端点详情</h2>' + table([['供应商', route.displayName], ['协议', route.protocol], ['端点', route.method + ' ' + route.path], ['必填 Header', example.headers.join(', ') || '-'], ['必填字段', example.required.join(', ') || '-'], ['官方文档', '<a href="' + example.docsUrl + '" target="_blank">' + example.docsUrl + '</a>']]) +
    '<div class="grid-2"><div>' + codeBlock('cURL 请求', example.curl) + codeBlock('请求 Body', JSON.stringify(example.requestBody, null, 2)) + '</div><div>' + codeBlock('响应 Body', JSON.stringify(example.responseBody, null, 2)) + codeBlock('关联场景', JSON.stringify(relatedScenarios.map((scenario) => ({ id: scenario.id, priority: scenario.priority, match: scenario.match, responseType: scenario.response?.type })), null, 2)) + '</div></div></div>';
}

function exampleFor(route) {
  const model = defaultModel(route.provider, route.protocol);
  const docsUrl = providersDocs[route.provider] ?? providersDocs.openai;
  if (route.protocol === 'openai-responses') return openAIExample(route, docsUrl, { model, input: 'hello' }, { id: 'resp_mock_0001', object: 'response', output_text: 'This is a mock OpenAI Responses API response.' }, ['model', 'input']);
  if (route.protocol === 'openai-embeddings') return openAIExample(route, docsUrl, { model: embeddingModel(route.provider), input: 'hello' }, { object: 'list', data: [{ object: 'embedding', index: 0, embedding: [0.0123, -0.0456, 0.0789] }] }, ['model', 'input']);
  if (route.protocol === 'anthropic-messages') return { docsUrl, headers: ['x-api-key', 'anthropic-version', 'Content-Type'], required: ['model', 'max_tokens', 'messages'], requestBody: { model, max_tokens: 128, messages: [{ role: 'user', content: 'hello' }] }, responseBody: { id: 'msg_mock_0001', type: 'message', role: 'assistant', content: [{ type: 'text', text: 'Hello from mock Anthropic.' }], stop_reason: 'end_turn' }, curl: curl(route.path, { model, max_tokens: 128, messages: [{ role: 'user', content: 'hello' }] }, ['x-api-key: test-key', 'anthropic-version: 2023-06-01', 'Content-Type: application/json']) };
  if (route.protocol === 'gemini-generate-content') return { docsUrl, headers: ['Content-Type'], required: ['contents'], requestBody: { contents: [{ role: 'user', parts: [{ text: 'hello' }] }] }, responseBody: { candidates: [{ content: { role: 'model', parts: [{ text: 'Hello from mock Gemini.' }] }, finishReason: 'STOP' }] }, curl: curl(route.path.replace(':modelAndMethod', 'gemini-1.5-pro:generateContent'), { contents: [{ role: 'user', parts: [{ text: 'hello' }] }] }, ['Content-Type: application/json']) };
  if (route.protocol === 'dashscope-generation') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'input.messages'], requestBody: { model, input: { messages: [{ role: 'user', content: 'hello' }] }, parameters: { result_format: 'message' } }, responseBody: { output: { choices: [{ message: { role: 'assistant', content: '你好，我是模拟的 DashScope 原生响应。' } }] }, usage: { total_tokens: 0 } }, curl: curl(route.path, { model, input: { messages: [{ role: 'user', content: 'hello' }] }, parameters: { result_format: 'message' } }) };
  if (route.protocol === 'minimax-chat') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'messages'], requestBody: { model, messages: [{ role: 'user', content: 'hello' }] }, responseBody: { id: 'minimax_mock_0001', choices: [{ message: { role: 'assistant', content: '你好，我是模拟的 MiniMax 响应。' } }] }, curl: curl(route.path, { model, messages: [{ role: 'user', content: 'hello' }] }) };
  if (route.protocol === 'rerank') return { docsUrl, headers: ['Authorization', 'Content-Type'], required: ['model', 'query', 'documents'], requestBody: { model, query: 'hello', documents: ['hello world', 'other'] }, responseBody: { id: 'rerank_mock_0001', object: 'rerank', results: [{ index: 0, relevance_score: 1, document: 'hello world' }] }, curl: curl(route.path, { model, query: 'hello', documents: ['hello world', 'other'] }) };
  return openAIExample(route, docsUrl, { model, messages: [{ role: 'user', content: 'hello' }] }, { id: 'chatcmpl_mock_0001', object: 'chat.completion', choices: [{ message: { role: 'assistant', content: 'Hello from OpenAI-compatible mock.' }, finish_reason: 'stop' }] }, ['model', 'messages']);
}

function openAIExample(route, docsUrl, requestBody, responseBody, required) {
  return { docsUrl, headers: ['Authorization', 'Content-Type'], required, requestBody, responseBody, curl: curl(route.path, requestBody) };
}
function curl(path, body, headers = ['Authorization: Bearer test-key', 'Content-Type: application/json']) {
  const normalizedPath = path.replace(':modelAndMethod', 'gemini-1.5-pro:generateContent');
  const slash = String.fromCharCode(92);
  const nl = String.fromCharCode(10);
  const headerLines = headers.map((header) => "  -H '" + header + "' " + slash).join(nl);
  return 'curl http://127.0.0.1:4000' + normalizedPath + ' ' + slash + nl + headerLines + nl + '  -d ' + JSON.stringify(JSON.stringify(body));
}

function attachDynamicHandlers() {
  panel.querySelectorAll('.provider-open').forEach((button) => button.addEventListener('click', () => { state.view = 'provider'; state.selectedProvider = button.dataset.provider; state.selectedProtocol = ''; state.selectedEndpoint = ''; setActiveNav('providers'); renderProviderMenu(); render(); }));
  panel.querySelectorAll('.protocol-tab').forEach((button) => button.addEventListener('click', () => { state.selectedProtocol = button.dataset.protocol; state.selectedEndpoint = ''; render(); }));
  panel.querySelectorAll('.endpoint-row').forEach((row) => row.addEventListener('click', () => { state.selectedEndpoint = row.dataset.endpoint; render(); }));
  panel.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', () => copyText(button.nextElementSibling?.textContent || '')));
}
function codeBlock(title, content) { return '<div class="code-block"><button class="copy-btn">复制</button><h3>' + esc(title) + '</h3><pre>' + esc(content) + '</pre></div>'; }
function routeId(route) { return route.method + ' ' + route.path; }
function currentProvider() { return orderedProviders().find((provider) => provider.provider === state.selectedProvider) ?? orderedProviders()[0]; }
function shortProviderName(provider) { return provider?.displayName?.replace('OpenAI Compatible', 'OpenAI').replace('Google Gemini', 'Gemini').replace('Alibaba Bailian / DashScope', 'DashScope / 阿里百炼') ?? ''; }
function protocolMenuKey(route) { if (route.protocol === 'gemini-generate-content') return route.path.includes('streamGenerateContent') ? 'gemini-stream' : 'gemini-generate'; if (route.protocol === 'openai-compatible' && route.path.includes('compatible-mode')) return 'dashscope-openai-chat'; return route.protocol; }
function protocolLabel(route) { const key = protocolMenuKey(route); return ({ 'openai-compatible': 'Chat Completions', 'openai-responses': 'Responses', 'openai-embeddings': 'Embeddings', 'anthropic-messages': 'Messages', 'gemini-generate': 'generateContent', 'gemini-stream': 'streamGenerateContent', 'dashscope-generation': 'Native Text Generation', 'dashscope-openai-chat': 'OpenAI Compatible Chat', 'minimax-chat': 'ChatCompletion v2', rerank: 'Rerank' })[key] ?? route.protocol; }
function defaultModel(provider, protocol) { if (provider === 'anthropic') return 'claude-3-5-sonnet-latest'; if (provider === 'gemini') return 'gemini-1.5-pro'; if (provider === 'deepseek') return 'deepseek-chat'; if (provider === 'moonshot') return 'moonshot-v1-8k'; if (provider === 'zhipu') return protocol === 'rerank' ? 'rerank-mock' : 'glm-4'; if (provider === 'aliyun-bailian') return protocol === 'rerank' ? 'gte-rerank-v2' : 'qwen-plus'; if (provider === 'minimax') return 'abab6.5s-chat'; return 'gpt-4o-mini'; }
function embeddingModel(provider) { if (provider === 'aliyun-bailian') return 'text-embedding-v3'; if (provider === 'zhipu') return 'embedding-3'; return 'text-embedding-3-small'; }
function filtered(items, fields) { const query = state.search.trim().toLowerCase(); return query ? items.filter((item) => fields.some((field) => String(field(item) ?? '').toLowerCase().includes(query))) : items; }
function card(label, value) { return '<div class="card"><span class="muted">' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>'; }
function table(rows) { return '<table><tbody>' + rows.map(([k, v]) => '<tr><th>' + esc(k) + '</th><td>' + (String(v).startsWith('<a ') ? v : esc(v)) + '</td></tr>').join('') + '</tbody></table>'; }
function badges(values = []) { return values.length ? values.map((v) => '<span class="badge">' + esc(v) + '</span>').join('') : '<span class="muted">-</span>'; }
function requestsTable(requests) { return '<table><thead><tr><th>ID</th><th>状态</th><th>提供商</th><th>模型</th><th>端点</th><th>命中场景</th><th>耗时</th></tr></thead><tbody>' + requests.slice().reverse().map((r) => '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.provider) + '</td><td>' + esc(r.model || '-') + '</td><td><code>' + esc(r.endpoint) + '</code></td><td>' + esc(r.matchedScenarioId || '-') + '</td><td>' + esc(r.durationMs) + 'ms</td></tr>').join('') + '</tbody></table>'; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
window.copyText = async (text) => navigator.clipboard?.writeText(text);
function setActiveNav(view) { document.querySelectorAll('.nav').forEach((item) => item.classList.toggle('active', item.dataset.view === view)); }
document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view === 'providers' ? 'providers' : button.dataset.view; state.search = ''; search.value = ''; setActiveNav(button.dataset.view); render(); }));
search.addEventListener('input', () => { state.search = search.value; render(); });
load().catch((error) => { panel.innerHTML = '<pre>' + esc(error.stack || error.message) + '</pre>'; });
`;
