export type Provider =
  | "openai"
  | "deepseek"
  | "moonshot"
  | "aliyun-bailian"
  | "zhipu"
  | "anthropic"
  | "gemini"
  | "minimax";

export type MockRequest = {
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

export type MockResult = {
  type: "text" | "json" | "tool_call" | "embedding" | "error" | "stream";
  content?: string;
  reasoningContent?: string;
  json?: unknown;
  chunks?: string[];
  reasoningChunks?: string[];
  streamError?: {
    code?: string;
    message: string;
  };
  toolCalls?: unknown[];
  toolName?: string;
  toolArguments?: Record<string, unknown>;
  embedding?: number[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: {
    status: number;
    type?: string;
    code?: string;
    message: string;
  };
};

export type ScenarioMatch = {
  model?: string;
  stream?: boolean;
  messagesContain?: string;
  lastUserMessageContains?: string;
  messageRole?: string;
  hasTools?: boolean;
  body?: Record<string, unknown>;
  bodyPath?: Record<string, unknown>;
  headers?: Record<string, string>;
  query?: Record<string, string>;
};

export type Scenario = {
  id: string;
  provider?: Provider;
  endpoint?: string;
  priority: number;
  match?: ScenarioMatch;
  response: MockResult;
};

export type ModelConfig = {
  id: string;
  provider: Provider;
};

export type MockMindConfig = {
  server: {
    host: string;
    port: number;
  };
  providers: {
    /** Metadata only: MockMind starts all implemented protocols by default. */
    enabled: "all" | "openai-compatible" | "chinese" | "international" | Provider[];
  };
  auth: {
    mode: "disabled" | "permissive" | "strict";
    apiKeys: string[];
  };
  models: ModelConfig[];
  defaults: {
    latencyMs: number;
    streamChunkDelayMs: number;
  };
  fallback: {
    enabled: boolean;
    response: MockResult;
  };
  scenarios: Scenario[];
};
