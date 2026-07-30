import type { MockRequest } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";

export function latencyForRequest(context: ServerContext, request: MockRequest): number {
  return request.model ? context.systemSettings.modelLatencyMs[request.model] ?? 0 : 0;
}
