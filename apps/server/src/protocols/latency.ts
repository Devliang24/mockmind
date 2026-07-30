import type { MockRequest } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";

export function latencyForRequest(context: ServerContext, request: MockRequest): number {
  if (request.model && context.systemSettings.modelLatencyMs[request.model] !== undefined) return context.systemSettings.modelLatencyMs[request.model];
  if (context.systemSettings.providerLatencyMs[request.provider] !== undefined) return context.systemSettings.providerLatencyMs[request.provider];
  return context.systemSettings.latencyMs;
}
