import type { PegaConversationResponse, PegaSendMessageResponse } from './types';

declare const PCore: any;

interface GenAIAssistantUtils {
  createConversationForAgent: (contextID: string, agentID: string, context: string) => Promise<PegaConversationResponse>;
  sendMessageForAgent: (
    agentID: string,
    conversationID: string,
    message: string,
    context: string
  ) => Promise<{ data: PegaSendMessageResponse['data'] }>;
}

function getUtils(): GenAIAssistantUtils {
  if (typeof PCore === 'undefined' || !PCore?.getGenAIAssistantUtils) {
    throw new Error('[Pega GenAI] PCore is not ready — wait for SdkConstellationReady before calling.');
  }
  return PCore.getGenAIAssistantUtils();
}

function decorateError(op: string, params: Record<string, unknown>, err: unknown): Error {
  const anyErr = err as any;
  const status = anyErr?.response?.status;
  const url = anyErr?.config?.url ?? anyErr?.response?.config?.url;
  const method = (anyErr?.config?.method ?? anyErr?.response?.config?.method)?.toUpperCase();
  const detail = status ? `HTTP ${status} ${method ?? ''} ${url ?? ''}`.trim() : (anyErr?.message ?? 'unknown error');
  // biome-ignore lint/suspicious/noConsole: surfacing for debugging
  console.error(`[Pega GenAI] ${op} failed`, { params, status, method, url, response: anyErr?.response?.data });
  return new Error(`${op} failed — ${detail}`);
}

export async function createConversation(params: { contextID: string; agentID: string; context: string }): Promise<PegaConversationResponse['data']> {
  const utils = getUtils();
  try {
    const result = await utils.createConversationForAgent(params.contextID, params.agentID, params.context);
    return result.data;
  } catch (err) {
    throw decorateError('createConversationForAgent', params, err);
  }
}

export async function sendMessage(params: {
  agentID: string;
  conversationID: string;
  message: string;
  context: string;
}): Promise<PegaSendMessageResponse['data']> {
  const utils = getUtils();
  try {
    const result = await utils.sendMessageForAgent(params.agentID, params.conversationID, params.message, params.context);
    return result.data;
  } catch (err) {
    throw decorateError('sendMessageForAgent', params, err);
  }
}
