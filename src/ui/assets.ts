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
          <span class="muted">Protocol mock dashboard</span>
        </div>
        <div class="status"><span id="health-dot" class="dot"></span><span id="health-text">loading</span></div>
      </header>
      <div class="layout">
        <aside class="sidebar">
          <button data-view="overview" class="nav active">Overview</button>
          <button data-view="providers" class="nav">Providers</button>
          <button data-view="routes" class="nav">Routes</button>
          <button data-view="models" class="nav">Models</button>
          <button data-view="scenarios" class="nav">Scenarios</button>
          <button data-view="requests" class="nav">Requests</button>
          <button data-view="curl" class="nav">cURL Examples</button>
          <div class="actions">
            <button id="reload-btn">Reload Config</button>
            <button id="reset-btn">Reset Requests</button>
          </div>
        </aside>
        <main class="content">
          <section class="toolbar">
            <h1 id="view-title">Overview</h1>
            <input id="search" placeholder="Search current view..." />
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
.nav, .actions button { width: 100%; text-align: left; color: var(--text); background: transparent; border: 1px solid transparent; padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 6px; }
.nav:hover, .nav.active, .actions button:hover { border-color: var(--border); background: var(--panel); }
.nav.active { color: var(--accent); }
.actions { border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px; }
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

export const uiJs = `const state = { view: 'overview', search: '', data: {} };
const title = document.getElementById('view-title');
const panel = document.getElementById('panel');
const search = document.getElementById('search');

const providersDocs = {
  openai: 'https://platform.openai.com/docs/api-reference',
  deepseek: 'https://api-docs.deepseek.com/api/create-chat-completion',
  moonshot: 'https://platform.kimi.ai/docs/api/overview',
  zhipu: 'https://docs.bigmodel.cn/api-reference',
  'aliyun-bailian': 'https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-dashscope',
  anthropic: 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages',
  gemini: 'https://ai.google.dev/api',
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
  document.getElementById('health-text').textContent = health.ok ? 'healthy' : 'unhealthy';
  render();
}

function filtered(items, fields) {
  const query = state.search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => fields.some((field) => String(field(item) ?? '').toLowerCase().includes(query)));
}

function render() {
  title.textContent = labels[state.view];
  search.style.display = state.view === 'overview' ? 'none' : 'block';
  panel.innerHTML = renderers[state.view]();
  const copyCurl = document.getElementById('copy-curl');
  if (copyCurl) copyCurl.addEventListener('click', () => copyText(document.getElementById('curl-examples')?.textContent || ''));
}

const labels = { overview: 'Overview', providers: 'Providers', routes: 'Routes', models: 'Models', scenarios: 'Scenarios', requests: 'Requests', curl: 'cURL Examples' };

const renderers = {
  overview() {
    const o = state.data.overview;
    return '<div class="cards">' +
      card('Providers', o.providersCount) + card('Models', o.modelsCount) + card('Scenarios', o.scenariosCount) + card('Requests', o.requestsCount) +
      '</div>' +
      '<h2>Server</h2>' + table([['Host', o.server.host], ['Port', o.server.port], ['Auth', o.auth.mode], ['Providers', JSON.stringify(o.providers.enabled)]]) +
      '<h2>Recent Requests</h2>' + requestsTable(o.recentRequests || []);
  },
  providers() {
    const providers = filtered(state.data.providers.providers, [p => p.provider, p => p.displayName, p => p.groups.join(','), p => p.routes.join(' ')]);
    return '<table><thead><tr><th>Provider</th><th>Groups</th><th>Models</th><th>Routes</th><th>Docs</th></tr></thead><tbody>' + providers.map((p) =>
      '<tr><td><strong>' + esc(p.displayName) + '</strong><br><span class="muted">' + esc(p.provider) + '</span></td><td>' + badges(p.groups) + '</td><td>' + badges(p.configuredModels) + '</td><td>' + p.routes.map(esc).join('<br>') + '</td><td><a href="' + providersDocs[p.provider] + '" target="_blank">official</a></td></tr>'
    ).join('') + '</tbody></table>';
  },
  routes() {
    const routes = filtered(state.data.routes, [r => r.provider, r => r.route]);
    return '<table><thead><tr><th>Provider</th><th>Route</th><th>cURL</th></tr></thead><tbody>' + routes.map((r) => '<tr><td>' + esc(r.provider) + '</td><td><code>' + esc(r.route) + '</code></td><td><button onclick="copyText(' + JSON.stringify(curlForRoute(r.route)).replaceAll('"', '&quot;') + ')">Copy</button></td></tr>').join('') + '</tbody></table>';
  },
  models() {
    const models = filtered(state.data.models.data, [m => m.id, m => m.provider, m => m.displayName]);
    return '<table><thead><tr><th>Model</th><th>Provider</th><th>Display Name</th></tr></thead><tbody>' + models.map((m) => '<tr><td><code>' + esc(m.id) + '</code></td><td>' + esc(m.provider) + '</td><td>' + esc(m.displayName) + '</td></tr>').join('') + '</tbody></table>';
  },
  scenarios() {
    const scenarios = filtered(state.data.scenarios, [s => s.id, s => s.provider, s => s.endpoint, s => s.response?.type, s => JSON.stringify(s.match || {})]);
    return '<table><thead><tr><th>ID</th><th>Provider</th><th>Endpoint</th><th>Priority</th><th>Match</th><th>Response</th></tr></thead><tbody>' + scenarios.map((s) => '<tr><td><code>' + esc(s.id) + '</code></td><td>' + esc(s.provider || '-') + '</td><td>' + esc(s.endpoint || '-') + '</td><td>' + esc(s.priority) + '</td><td><pre>' + esc(JSON.stringify(s.match || {}, null, 2)) + '</pre></td><td><span class="badge">' + esc(s.response?.type) + '</span></td></tr>').join('') + '</tbody></table>';
  },
  requests() {
    const requests = filtered(state.data.requests, [r => r.id, r => r.provider, r => r.endpoint, r => r.model, r => r.matchedScenarioId, r => r.status]);
    return requestsTable(requests) + '<div class="detail"><h2>Raw Requests</h2><pre>' + esc(JSON.stringify(requests, null, 2)) + '</pre></div>';
  },
  curl() {
    return '<button class="copy" id="copy-curl">Copy all</button><pre id="curl-examples">' + esc(curlExamples()) + '</pre>';
  }
};

function card(label, value) { return '<div class="card"><span class="muted">' + label + '</span><strong>' + value + '</strong></div>'; }
function table(rows) { return '<table><tbody>' + rows.map(([k, v]) => '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>').join('') + '</tbody></table>'; }
function badges(values = []) { return values.length ? values.map((v) => '<span class="badge">' + esc(v) + '</span>').join('') : '<span class="muted">-</span>'; }
function requestsTable(requests) { return '<table><thead><tr><th>ID</th><th>Status</th><th>Provider</th><th>Model</th><th>Endpoint</th><th>Scenario</th><th>Duration</th></tr></thead><tbody>' + requests.slice().reverse().map((r) => '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.provider) + '</td><td>' + esc(r.model || '-') + '</td><td><code>' + esc(r.endpoint) + '</code></td><td>' + esc(r.matchedScenarioId || '-') + '</td><td>' + esc(r.durationMs) + 'ms</td></tr>').join('') + '</tbody></table>'; }
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

function curlForRoute(route) {
  const path = route.replace(/^\w+\s+/, '').split(' ')[0].replace(':modelAndMethod', 'gemini-1.5-pro:generateContent').replace(':fileId', 'file-mock-0001').replace(':batchId', 'batch_mock_0001');
  if (route.startsWith('GET')) return 'curl http://127.0.0.1:4000' + path;
  const slash = String.fromCharCode(92);
  const nl = String.fromCharCode(10);
  return [
    'curl http://127.0.0.1:4000' + path + ' ' + slash,
    "  -H 'Authorization: Bearer test-key' " + slash,
    "  -H 'Content-Type: application/json' " + slash,
    "  -d '" + JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'hello' }] }) + "'"
  ].join(nl);
}
function curlExamples() {
  const nl = String.fromCharCode(10);
  return [
    curlForRoute('POST /v1/chat/completions'),
    curlForRoute('POST /v1/responses').replace('\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]', '\"input\":\"hello\"'),
    curlForRoute('POST /v1/embeddings').replace('\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]', '\"input\":\"hello\"'),
    curlForRoute('POST /v1/messages').replace("-H 'Authorization: Bearer test-key'", "-H 'x-api-key: test-key' " + String.fromCharCode(92) + nl + "  -H 'anthropic-version: 2023-06-01'").replace('\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]', '\"max_tokens\":128,\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]'),
    curlForRoute('POST /v1beta/models/:modelAndMethod').replace('\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]', '\"contents\":[{\"role\":\"user\",\"parts\":[{\"text\":\"hello\"}]}]')
  ].join(nl + nl);
}
window.copyText = async (text) => navigator.clipboard?.writeText(text);

document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  state.view = button.dataset.view;
  state.search = '';
  search.value = '';
  render();
}));
search.addEventListener('input', () => { state.search = search.value; render(); });
document.getElementById('reset-btn').addEventListener('click', async () => { await api('/__admin/reset', { method: 'POST' }); await load(); });
document.getElementById('reload-btn').addEventListener('click', async () => { alert(JSON.stringify(await api('/__admin/reload', { method: 'POST' }))); });

load().catch((error) => { panel.innerHTML = '<pre>' + esc(error.stack || error.message) + '</pre>'; });
`;
