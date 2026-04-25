import { handleOpenAICompatibleChat } from "./openai-compatible/chat-handler.js";
import { handleOpenAIEmbeddings } from "./openai-compatible/embeddings-handler.js";
import { handleAnthropicMessages } from "./anthropic-messages/handler.js";
import { handleDashScopeGeneration } from "./dashscope-generation/handler.js";
import { handleGeminiGenerateContent } from "./gemini-generate-content/handler.js";
import { handleMiniMaxChat } from "./minimax-chat/handler.js";
import type { ProtocolHandler, ProtocolId } from "./types.js";
import type { OpenAICompatibleChatBody } from "./openai-compatible/chat-handler.js";
import type { FastifyRequest } from "fastify";

export const protocolHandlers: Record<ProtocolId, ProtocolHandler> = {
  "openai-compatible": async (handlerContext, request, reply) => {
    return handleOpenAICompatibleChat(handlerContext.context, request as FastifyRequest<{ Body: OpenAICompatibleChatBody }>, reply, handlerContext.provider, handlerContext.endpoint);
  },
  "openai-embeddings": handleOpenAIEmbeddings,
  "anthropic-messages": handleAnthropicMessages,
  "gemini-generate-content": handleGeminiGenerateContent,
  "dashscope-generation": handleDashScopeGeneration,
  "minimax-chat": handleMiniMaxChat
};

export function getProtocolHandler(protocol: string): ProtocolHandler | undefined {
  return protocolHandlers[protocol as ProtocolId];
}
