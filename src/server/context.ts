import type { MockMindConfig } from "../core/scenario/types.js";
import { RequestRecorder } from "../core/recorder/recorder.js";
import { ScenarioStore } from "../core/scenario/store.js";

export type ServerContext = {
  config: MockMindConfig;
  scenarios: ScenarioStore;
  recorder: RequestRecorder;
};

export function createServerContext(config: MockMindConfig): ServerContext {
  const persistence = config.persistence;
  return {
    config,
    scenarios: new ScenarioStore(config),
    recorder: new RequestRecorder(persistence?.enabled && persistence.driver === "sqlite" ? { sqlitePath: persistence.sqlite.path } : {})
  };
}
