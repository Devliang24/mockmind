import type { FastifyReply, FastifyRequest } from "fastify";
import type { Provider } from "../core/scenario/types.js";
import type { ServerContext } from "../server/context.js";

export type ProtocolId =
  | "openai-compatible"
  | "openai-embeddings"
  | "anthropic-messages"
  | "gemini-generate-content"
  | "dashscope-generation"
  | "minimax-chat";

export type ProtocolHandlerContext = {
  context: ServerContext;
  provider: Provider;
  endpoint: string;
  routePath: string;
};

export type ProtocolHandler = (
  handlerContext: ProtocolHandlerContext,
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<unknown>;
