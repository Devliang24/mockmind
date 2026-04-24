import type { FastifyRequest } from "fastify";

export function requestHeaders(request: FastifyRequest): Record<string, string> {
  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") output[key.toLowerCase()] = value;
  }
  return output;
}

export function requestQuery(request: FastifyRequest): Record<string, string> {
  const output: Record<string, string> = {};
  if (!request.query || typeof request.query !== "object") return output;
  for (const [key, value] of Object.entries(request.query as Record<string, unknown>)) {
    if (typeof value === "string") output[key] = value;
  }
  return output;
}
