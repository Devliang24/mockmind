import type { MockResult } from "../../core/scenario/types.js";

export function formatDashScopeGeneration(result: MockResult): unknown {
  return {
    request_id: "req_mock_dashscope_0001",
    output: {
      choices: [{
        finish_reason: "stop",
        message: {
          role: "assistant",
          content: result.content ?? ""
        }
      }]
    },
    usage: {
      input_tokens: result.usage?.promptTokens ?? 0,
      output_tokens: result.usage?.completionTokens ?? 0,
      total_tokens: result.usage?.totalTokens ?? 0
    }
  };
}

export function formatDashScopeError(code: string | undefined, message: string): unknown {
  return {
    request_id: "req_mock_dashscope_error_0001",
    code: code ?? "MockError",
    message
  };
}
