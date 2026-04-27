import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
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
  responseBody?: unknown;
};

export type RequestRecorderOptions = {
  sqlitePath?: string;
};

export class RequestRecorder {
  private records: RecordedRequest[] = [];
  private nextId = 1;
  private db?: Database.Database;

  constructor(options: RequestRecorderOptions = {}) {
    if (options.sqlitePath) {
      this.db = openDatabase(options.sqlitePath);
      migrate(this.db);
      this.records = loadRecords(this.db);
      this.nextId = nextSequence(this.records);
    }
  }

  add(record: Omit<RecordedRequest, "id">): RecordedRequest {
    const saved = { ...record, id: `req_${this.nextId++}` };
    this.records.push(saved);
    this.persist(saved);
    return saved;
  }

  list(): RecordedRequest[] {
    return this.records;
  }

  reset(): void {
    this.records = [];
    this.nextId = 1;
    this.db?.prepare("DELETE FROM request_records").run();
  }

  close(): void {
    this.db?.close();
    this.db = undefined;
  }

  private persist(record: RecordedRequest): void {
    if (!this.db) return;
    this.db.prepare(`
      INSERT INTO request_records (
        id,
        sequence,
        provider,
        endpoint,
        model,
        matched_scenario_id,
        status,
        duration_ms,
        stream,
        request_json,
        response_body_json
      ) VALUES (
        @id,
        @sequence,
        @provider,
        @endpoint,
        @model,
        @matchedScenarioId,
        @status,
        @durationMs,
        @stream,
        @requestJson,
        @responseBodyJson
      )
    `).run({
      id: record.id,
      sequence: sequenceFromId(record.id),
      provider: record.provider,
      endpoint: record.endpoint,
      model: record.model ?? null,
      matchedScenarioId: record.matchedScenarioId ?? null,
      status: record.status,
      durationMs: record.durationMs,
      stream: record.stream ? 1 : 0,
      requestJson: JSON.stringify(record.request),
      responseBodyJson: record.responseBody === undefined ? null : JSON.stringify(record.responseBody)
    });
  }
}

function openDatabase(sqlitePath: string): Database.Database {
  const filePath = resolve(sqlitePath);
  mkdirSync(dirname(filePath), { recursive: true });
  return new Database(filePath);
}

function migrate(db: Database.Database): void {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_records (
      id TEXT PRIMARY KEY,
      sequence INTEGER NOT NULL,
      provider TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      model TEXT,
      matched_scenario_id TEXT,
      status INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      stream INTEGER NOT NULL,
      request_json TEXT NOT NULL,
      response_body_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_request_records_sequence ON request_records(sequence);
  `);
}

function loadRecords(db: Database.Database): RecordedRequest[] {
  const rows = db.prepare(`
    SELECT id, provider, endpoint, model, matched_scenario_id, status, duration_ms, stream, request_json, response_body_json
    FROM request_records
    ORDER BY sequence ASC
  `).all() as Array<{
    id: string;
    provider: string;
    endpoint: string;
    model: string | null;
    matched_scenario_id: string | null;
    status: number;
    duration_ms: number;
    stream: number;
    request_json: string;
    response_body_json: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    provider: row.provider,
    endpoint: row.endpoint,
    model: row.model ?? undefined,
    matchedScenarioId: row.matched_scenario_id ?? undefined,
    status: row.status,
    durationMs: row.duration_ms,
    stream: Boolean(row.stream),
    request: parseJson(row.request_json) as MockRequest,
    responseBody: row.response_body_json === null ? undefined : parseJson(row.response_body_json)
  }));
}

function nextSequence(records: RecordedRequest[]): number {
  return records.reduce((max, record) => Math.max(max, sequenceFromId(record.id)), 0) + 1;
}

function sequenceFromId(id: string): number {
  const match = id.match(/^req_(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
