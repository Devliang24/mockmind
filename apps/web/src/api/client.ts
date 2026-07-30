import type {
  AdminModelsResponse,
  AdminOverviewResponse,
  AdminProvidersResponse,
  AdminRequestsResponse,
  AdminRoutesResponse,
  AdminScenario,
  AdminSettingsResponse
} from "@mockmind/shared";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: "application/json", ...(options?.headers ?? {}) },
    ...options
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export type ConsoleData = {
  health: { ok: boolean; name: string };
  overview: AdminOverviewResponse;
  providers: AdminProvidersResponse;
  routes: AdminRoutesResponse;
  models: AdminModelsResponse;
  scenarios: AdminScenario[];
  requests: AdminRequestsResponse;
  settings: AdminSettingsResponse;
};

export async function loadConsoleData(): Promise<ConsoleData> {
  const [health, overview, providers, routes, models, scenarios, requests, settings] = await Promise.all([
    api<ConsoleData["health"]>("/health"),
    api<AdminOverviewResponse>("/__admin/overview"),
    api<AdminProvidersResponse>("/__admin/providers"),
    api<AdminRoutesResponse>("/__admin/routes"),
    api<AdminModelsResponse>("/__admin/models"),
    api<AdminScenario[]>("/__admin/scenarios"),
    api<AdminRequestsResponse>("/__admin/requests"),
    api<AdminSettingsResponse>("/__admin/settings")
  ]);

  return { health, overview, providers, routes, models, scenarios, requests, settings };
}

export async function toggleModel(modelId: string, disabled: boolean): Promise<{ ok: boolean; id: string; disabled: boolean }> {
  return api(`/__admin/models/${encodeURIComponent(modelId)}`, {
    method: "PATCH",
    body: JSON.stringify({ disabled }),
    headers: { "Content-Type": "application/json" }
  });
}

export async function loadSettings(): Promise<AdminSettingsResponse> {
  return api<AdminSettingsResponse>("/__admin/settings");
}

export async function saveSettings(settings: AdminSettingsResponse): Promise<AdminSettingsResponse> {
  return api<AdminSettingsResponse>("/__admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
    headers: { "Content-Type": "application/json" }
  });
}
