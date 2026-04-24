import type { MockMindConfig, MockRequest, MockResult, Scenario } from "./types.js";
import { scenarioMatches } from "./matcher.js";

export class ScenarioStore {
  private scenarios: Scenario[];

  constructor(private readonly config: MockMindConfig) {
    this.scenarios = [...config.scenarios].sort((left, right) => right.priority - left.priority);
  }

  list(): Scenario[] {
    return this.scenarios;
  }

  find(request: MockRequest): { scenario?: Scenario; result?: MockResult } {
    const scenario = this.scenarios.find((candidate) => scenarioMatches(candidate, request));
    if (scenario) return { scenario, result: scenario.response };
    if (this.config.fallback.enabled) return { result: this.config.fallback.response };
    return {};
  }
}
