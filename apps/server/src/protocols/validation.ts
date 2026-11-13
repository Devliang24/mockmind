import type { FastifyReply, FastifyRequest } from "fastify";
import type { Provider } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";
import { requestHeaders, requestQuery } from "../shared/http.js";

export type ValidationError = {
  status: number;
  code: string;
  message: string;
  type?: string;
};

export type Validator = (value: unknown) => boolean;

export type RequiredField = {
  path: string;
  label?: string;
  validate?: Validator;
};

export function validateJsonObjectBody(body: unknown): ValidationError | undefined {
  if (!isRecord(body)) {
    return {
      status: 400,
      code: "invalid_request",
      type: "invalid_request_error",
      message: "Request body must be a JSON object."
    };
  }
  return undefined;
}

export function requireFields(body: unknown, fields: RequiredField[]): ValidationError | undefined {
  const bodyError = validateJsonObjectBody(body);
  if (bodyError) return bodyError;

  for (const field of fields) {
    const value = getPath(body, field.path);
    const isMissing = value === undefined || value === null || value === "";
    const isInvalid = !isMissing && field.validate && !field.validate(value);
    if (isMissing || isInvalid) {
      const name = field.label ?? field.path;
      return {
        status: 400,
        code: "invalid_request",
        type: "invalid_request_error",
        message: `Missing or invalid required field: ${name}.`
      };
    }
  }
  return undefined;
}

export function requireHeaders(request: FastifyRequest, headers: string[]): ValidationError | undefined {
  for (const header of headers) {
    if (!request.headers[header.toLowerCase()]) {
      return {
        status: 400,
        code: "missing_required_header",
        type: "invalid_request_error",
        message: `Missing required header: ${header}.`
      };
    }
  }
  return undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;
    return current[key];
  }, value);
}

export type RejectedRecordContext = {
  provider: Provider;
  endpoint: string;
  startedAtMs: number;
  stream?: boolean;
};

export function checkModelDisabled(
  context: ServerContext,
  model: string | undefined,
  reply: FastifyReply,
  formatError: (status: number, code: string, message: string) => unknown,
  record?: RejectedRecordContext
): boolean {
  if (!model || !context.disabledModels.has(model)) return true;

  const status = context.systemSettings.disabledModelStatusCode;
  const errorBody = formatError(status, "model_disabled", `Model '${model}' is disabled by the administrator.`);

  // Rejected requests are recorded too, otherwise there is no arrival timestamp for
  // 503-class failures and retry intervals cannot be measured.
  if (record && context.systemSettings.recordRejectedRequests) {
    context.recorder.add({
      provider: record.provider,
      endpoint: record.endpoint,
      model,
      status,
      durationMs: Date.now() - record.startedAtMs,
      stream: record.stream ?? false,
      request: {
        provider: record.provider,
        endpoint: record.endpoint,
        method: reply.request.method,
        model,
        ...(record.stream === undefined ? {} : { stream: record.stream }),
        rawBody: reply.request.body,
        headers: requestHeaders(reply.request),
        query: requestQuery(reply.request)
      },
      responseBody: errorBody
    });
  }

  reply.status(status).send(errorBody);
  return false;
}
