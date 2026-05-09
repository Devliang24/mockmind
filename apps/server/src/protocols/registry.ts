import { handleOpenAICompatibleChat } from "./openai-compatible/chat-handler.js";
import { handleOpenAIEmbeddings } from "./openai-compatible/embeddings-handler.js";
import { handleOpenAIResponses, type OpenAIResponsesBody } from "./openai-compatible/responses-handler.js";
import { handleOpenAIAudio, handleOpenAIBatch, handleOpenAIFiles, handleOpenAIImages, handleOpenAIModerations } from "./openai-compatible/more-handlers.js";
import { handleAnthropicMessages } from "./anthropic-messages/handler.js";
import { handleDashScopeGeneration } from "./dashscope-generation/handler.js";
import { handleGeminiGenerateContent } from "./gemini-generate-content/handler.js";
import { handleMiniMaxChat } from "./minimax-chat/handler.js";
import { handleRerank } from "./rerank/handler.js";
import type { ProtocolHandler, ProtocolId } from "./types.js";
import type { OpenAICompatibleChatBody } from "./openai-compatible/chat-handler.js";
import type { FastifyRequest } from "fastify";

export const protocolHandlers: Record<ProtocolId, ProtocolHandler> = {
  "openai-compatible": async (handlerContext, request, reply) => {
    return handleOpenAICompatibleChat(handlerContext.context, request as FastifyRequest<{ Body: OpenAICompatibleChatBody }>, reply, handlerContext.provider, handlerContext.endpoint);
  },
  "openai-embeddings": handleOpenAIEmbeddings,
  "openai-responses": async (handlerContext, request, reply) => {
    return handleOpenAIResponses(handlerContext.context, request as FastifyRequest<{ Body: OpenAIResponsesBody }>, reply, handlerContext.provider, handlerContext.endpoint);
  },
  "openai-images": handleOpenAIImages,
  "openai-audio": handleOpenAIAudio,
  "openai-moderations": handleOpenAIModerations,
  "openai-files": handleOpenAIFiles,
  "openai-batch": handleOpenAIBatch,
  "anthropic-messages": handleAnthropicMessages,
  "gemini-generate-content": handleGeminiGenerateContent,
  "dashscope-generation": handleDashScopeGeneration,
  "minimax-chat": handleMiniMaxChat,
  "rerank": handleRerank
};

export function getProtocolHandler(protocol: string): ProtocolHandler | undefined {
  return protocolHandlers[protocol as ProtocolId];
}
