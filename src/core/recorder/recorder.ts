import type { MockRequest } from "../scenario/types.js";

export type RecordedRequest = {
  id: string;
  provider: string;
  endpoint: string;
  model?: string;
  matchedScenarioId?: string;
  status: number;
  durationMs: number;
  stream: boolean;
  request: MockRequest;
};

export class RequestRecorder {
  private records: RecordedRequest[] = [];
  private nextId = 1;

  add(record: Omit<RecordedRequest, "id">): RecordedRequest {
    const saved = { ...record, id: `req_${this.nextId++}` };
    this.records.push(saved);
    return saved;
  }

  list(): RecordedRequest[] {
    return this.records;
  }

  reset(): void {
    this.records = [];
    this.nextId = 1;
  }
}
