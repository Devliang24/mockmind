import type { MockMindConfig } from "../core/scenario/types.js";
import { RequestRecorder } from "../core/recorder/recorder.js";
import { ScenarioStore } from "../core/scenario/store.js";

export type ServerContext = {
  config: MockMindConfig;
  scenarios: ScenarioStore;
  recorder: RequestRecorder;
  disabledModels: Set<string>;
  systemSettings: {
    disabledModelStatusCode: number;
    latencyMs: number;
  };
};

export function createServerContext(config: MockMindConfig): ServerContext {
  const persistence = config.persistence;
  const disabledModels = new Set(config.models.filter((m) => m.disabled).map((m) => m.id));
  return {
    config,
    scenarios: new ScenarioStore(config),
    recorder: new RequestRecorder({
      ...(persistence?.enabled && persistence.driver === "sqlite" ? { sqlitePath: persistence.sqlite.path } : {}),
      maxRequests: config.defaults.maxRequests ?? 500
    }),
    disabledModels,
    systemSettings: {
      disabledModelStatusCode: config.defaults.disabledModelStatusCode ?? 403,
      latencyMs: config.defaults.latencyMs
    }
  };
}
