import type { FastifyReply, FastifyRequest } from "fastify";
import type { MockMindConfig } from "../scenario/types.js";

export function checkAuth(config: MockMindConfig, request: FastifyRequest, reply: FastifyReply): boolean {
  if (config.auth.mode === "disabled" || config.auth.mode === "permissive") return true;
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
  if (token && config.auth.apiKeys.includes(token)) return true;
  reply.code(401).send({ error: { message: "Invalid API key", type: "authentication_error", code: "invalid_api_key" } });
  return false;
}
