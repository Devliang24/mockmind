import type { FastifyReply, FastifyRequest } from "fastify";
import type { MockMindConfig, Provider } from "../scenario/types.js";

export function checkAuth(config: MockMindConfig, request: FastifyRequest, reply: FastifyReply): boolean {
  return checkProviderAuth(config, request, reply, "openai");
}

export type ProviderAuthScheme = "authorization-bearer" | "x-api-key" | "x-goog-api-key-or-query-key";

export type ProviderAuthInfo = {
  scheme: ProviderAuthScheme;
  label: string;
  headers: string[];
  query: string[];
};

export function checkProviderAuth(
  config: MockMindConfig,
  request: FastifyRequest,
  reply: FastifyReply,
  provider: Provider,
  errorBody: unknown = invalidApiKeyError()
): boolean {
  if (config.auth.mode === "disabled" || config.auth.mode === "permissive") return true;
  const token = providerAuthToken(request, authInfoForProvider(provider).scheme);
  if (token && config.auth.apiKeys.includes(token)) return true;
  reply.code(401).send(errorBody);
  return false;
}

export function authInfoForProvider(provider: Provider): ProviderAuthInfo {
  if (provider === "anthropic") {
    return {
      scheme: "x-api-key",
      label: "x-api-key: <API_KEY>",
      headers: ["x-api-key"],
      query: []
    };
  }
  if (provider === "gemini") {
    return {
      scheme: "x-goog-api-key-or-query-key",
      label: "x-goog-api-key: <API_KEY> 或 ?key=<API_KEY>",
      headers: ["x-goog-api-key"],
      query: ["key"]
    };
  }
  return {
    scheme: "authorization-bearer",
    label: "Authorization: Bearer <API_KEY>",
    headers: ["Authorization"],
    query: []
  };
}

function providerAuthToken(request: FastifyRequest, scheme: ProviderAuthScheme): string | undefined {
  if (scheme === "authorization-bearer") return bearerToken(headerValue(request, "authorization"));
  if (scheme === "x-api-key") return headerValue(request, "x-api-key");
  return headerValue(request, "x-goog-api-key") ?? queryValue(request, "key");
}

function headerValue(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function queryValue(request: FastifyRequest, name: string): string | undefined {
  const query = request.query;
  if (!query || typeof query !== "object") return undefined;
  const value = (query as Record<string, unknown>)[name];
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : undefined;
  return typeof value === "string" ? value : undefined;
}

function bearerToken(value: string | undefined): string | undefined {
  const match = value?.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

function invalidApiKeyError(): unknown {
  return { error: { message: "Invalid API key", type: "authentication_error", code: "invalid_api_key" } };
}
