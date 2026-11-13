import { describe, expect, it } from "vitest";
import { RequestRecorder } from "../../src/core/recorder/recorder.js";

const base = {
  provider: "openai",
  endpoint: "/v1/chat/completions",
  status: 200,
  stream: false,
  request: { provider: "openai", endpoint: "/v1/chat/completions", method: "POST", rawBody: {}, headers: {}, query: {} }
} as const;

describe("recorder timestamps", () => {
  it("derives receivedAtMs from respondedAtMs - durationMs", () => {
    const recorder = new RequestRecorder();
    const before = Date.now();

    const saved = recorder.add({ ...base, durationMs: 250 });
    const after = Date.now();

    // respondedAtMs is a real wall-clock instant
    expect(saved.respondedAtMs).toBeGreaterThanOrEqual(before);
    expect(saved.respondedAtMs).toBeLessThanOrEqual(after);
    // receivedAtMs is exactly durationMs earlier
    expect(saved.respondedAtMs - saved.receivedAtMs).toBe(250);
  });

  it("keeps adjacent request gaps measurable at ms precision", () => {
    const recorder = new RequestRecorder();
    const first = recorder.add({ ...base, durationMs: 0 });
    const second = recorder.add({ ...base, durationMs: 0 });

    expect(second.receivedAtMs - first.receivedAtMs).toBeGreaterThanOrEqual(0);
    expect(second.receivedAtMs - first.receivedAtMs).toBeLessThan(1000);
  });
});
