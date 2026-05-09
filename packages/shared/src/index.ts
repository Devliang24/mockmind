export type Provider =
  | "openai"
  | "deepseek"
  | "moonshot"
  | "aliyun-bailian"
  | "zhipu"
  | "anthropic"
  | "gemini"
  | "minimax";

export type ProviderGroup = "chinese" | "international" | "openai-compatible" | "native";

export type ProviderAuthScheme = "authorization-bearer" | "x-api-key" | "x-goog-api-key-or-query-key";

export type ProviderAuthInfo = {
  scheme: ProviderAuthScheme;
  label: string;
  headers: string[];
  query: string[];
};

export type AdminModel = {
  id: string;
  provider: Provider;
  displayName: string;
};

export type AdminScenario = {
  id: string;
  provider?: Provider;
  endpoint?: string;
  priority: number;
  match?: Record<string, unknown>;
  response: Record<string, unknown>;
};

export type AdminRecordedRequest = {
  id: string;
  provider: string;
  endpoint: string;
  model?: string;
  matchedScenarioId?: string;
  status: number;
  durationMs: number;
  stream: boolean;
  request: {
    provider: Provider;
    endpoint: string;
    method: string;
    model?: string;
    messages?: unknown[];
    prompt?: string;
    stream?: boolean;
    tools?: unknown[];
    rawBody: unknown;
    headers: Record<string, string>;
    query: Record<string, string>;
  };
  responseBody?: unknown;
};

export type AdminOverviewResponse = {
  ok: true;
  name: "mockmind";
  version: string;
  server: {
    host: string;
    port: number;
  };
  auth: {
    mode: "disabled" | "permissive" | "strict";
  };
  providers: {
    enabled: "all" | "openai-compatible" | "chinese" | "international" | Provider[];
  };
  providersCount: number;
  modelsCount: number;
  scenariosCount: number;
  requestsCount: number;
  recentRequests: AdminRecordedRequest[];
};

export type AdminModelsResponse = {
  data: AdminModel[];
};

export type AdminProvidersResponse = {
  mode: "all";
  providers: Array<{
    provider: Provider;
    displayName: string;
    groups: ProviderGroup[];
    auth: ProviderAuthInfo;
    defaultModels: string[];
    latestModels: string[];
    configuredModels: string[];
    routes: string[];
  }>;
  groups: Record<ProviderGroup, Provider[]>;
};

export type AdminRoute = {
  provider: Provider;
  displayName: string;
  groups: ProviderGroup[];
  auth: ProviderAuthInfo;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  protocol: string;
  endpoint: string;
  description: string;
};

export type AdminRoutesResponse = AdminRoute[];

export type AdminRequestsResponse = AdminRecordedRequest[];

export type AdminResetResponse = {
  ok: true;
};
