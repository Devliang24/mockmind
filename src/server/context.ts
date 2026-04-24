import type { MockMindConfig } from "../core/scenario/types.js";
import { RequestRecorder } from "../core/recorder/recorder.js";
import { ScenarioStore } from "../core/scenario/store.js";

export type ServerContext = {
  config: MockMindConfig;
  scenarios: ScenarioStore;
  recorder: RequestRecorder;
};

export function createServerContext(config: MockMindConfig): ServerContext {
  return {
    config,
    scenarios: new ScenarioStore(config),
    recorder: new RequestRecorder()
  };
}
