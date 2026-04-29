import { z } from "zod";

const providerSchema = z.enum([
  "openai",
  "deepseek",
  "moonshot",
  "aliyun-bailian",
  "zhipu",
  "anthropic",
  "gemini",
  "minimax"
]);

const mockResultSchema = z.object({
  type: z.enum(["text", "json", "tool_call", "embedding", "error", "stream"]),
  content: z.string().optional(),
  reasoningContent: z.string().optional(),
  json: z.unknown().optional(),
  chunks: z.array(z.string()).optional(),
  reasoningChunks: z.array(z.string()).optional(),
  streamError: z.object({
    code: z.string().optional(),
    message: z.string()
  }).optional(),
  toolCalls: z.array(z.unknown()).optional(),
  toolName: z.string().optional(),
  toolArguments: z.record(z.string(), z.unknown()).optional(),
  embedding: z.array(z.number()).optional(),
  usage: z.object({
    promptTokens: z.number().int().nonnegative().optional(),
    completionTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional()
  }).optional(),
  error: z.object({
    status: z.number().int().min(100).max(599),
    type: z.string().optional(),
    code: z.string().optional(),
    message: z.string()
  }).optional(),
  status: z.number().int().min(100).max(599).optional(),
  errorType: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional()
}).transform((value) => {
  if (value.type === "error" && !value.error) {
    return {
      ...value,
      error: {
        status: value.status ?? 500,
        type: value.errorType,
        code: value.code,
        message: value.message ?? "mock error"
      }
    };
  }
  return value;
});

export const configSchema = z.object({
  server: z.object({
    host: z.string().default("127.0.0.1"),
    port: z.number().int().positive().default(4000)
  }).prefault({}),
  providers: z.object({
    // Metadata only: route registration always includes every implemented protocol.
    enabled: z.union([
      z.literal("all"),
      z.literal("openai-compatible"),
      z.literal("chinese"),
      z.literal("international"),
      z.array(providerSchema)
    ]).default("all")
  }).prefault({}),
  auth: z.object({
    mode: z.enum(["disabled", "permissive", "strict"]).default("permissive"),
    apiKeys: z.array(z.string()).default(["123456"])
  }).prefault({}),
  models: z.array(z.object({
    id: z.string(),
    provider: providerSchema
  })).default([]),
  defaults: z.object({
    latencyMs: z.number().int().nonnegative().default(0),
    streamChunkDelayMs: z.number().int().nonnegative().default(30)
  }).prefault({}),
  persistence: z.object({
    enabled: z.boolean().default(true),
    driver: z.enum(["memory", "sqlite"]).default("sqlite"),
    sqlite: z.object({
      path: z.string().default(".mockmind/mockmind.sqlite")
    }).prefault({})
  }).prefault({}),
  fallback: z.object({
    enabled: z.boolean().default(true),
    response: mockResultSchema.default({ type: "text", content: "This is a default mock response from mockmind." })
  }).prefault({}),
  scenarios: z.array(z.object({
    id: z.string(),
    provider: providerSchema.optional(),
    endpoint: z.string().optional(),
    priority: z.number().int().default(0),
    match: z.object({
      model: z.string().optional(),
      stream: z.boolean().optional(),
      messagesContain: z.string().optional(),
      lastUserMessageContains: z.string().optional(),
      messageRole: z.string().optional(),
      hasTools: z.boolean().optional(),
      body: z.record(z.string(), z.unknown()).optional(),
      bodyPath: z.record(z.string(), z.unknown()).optional(),
      headers: z.record(z.string(), z.string()).optional(),
      query: z.record(z.string(), z.string()).optional()
    }).optional(),
    response: mockResultSchema
  })).default([])
});

export type ConfigInput = z.input<typeof configSchema>;
