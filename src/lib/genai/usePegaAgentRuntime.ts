import { type AppendMessage, type ThreadMessageLike, useExternalStoreRuntime } from '@assistant-ui/react';
import { useCallback, useState } from 'react';
import { createConversation, sendMessage } from './pegaGenAIClient';
import type { PegaMessage } from './types';

interface UsePegaAgentRuntimeOptions {
  agentID: string;
  contextID: string;
  context: string;
  enabled: boolean;
}

const convertMessage = (message: PegaMessage): ThreadMessageLike => ({
  id: message.id,
  role: message.role,
  content: [{ type: 'text', text: message.content }]
});

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function usePegaAgentRuntime({ agentID, contextID, context, enabled }: UsePegaAgentRuntimeOptions) {
  const [messages, setMessages] = useState<PegaMessage[]>([]);
  const [conversationID, setConversationID] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureConversation = useCallback(async (): Promise<string> => {
    if (conversationID) return conversationID;
    const data = await createConversation({ contextID, agentID, context });
    setConversationID(data.ID);
    if (data.welcomeMessage) {
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: data.welcomeMessage as string }]);
    }
    return data.ID;
  }, [agentID, context, contextID, conversationID]);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      if (!enabled) {
        setError('Pega is not ready yet.');
        return;
      }
      const part = message.content[0];
      if (!part || part.type !== 'text') {
        setError('Only text messages are supported.');
        return;
      }
      const userText = part.text;

      setError(null);
      setMessages((prev) => [...prev, { id: newId(), role: 'user', content: userText }]);
      setIsRunning(true);

      try {
        const convId = await ensureConversation();
        const data = await sendMessage({ agentID, conversationID: convId, message: userText, context });
        setMessages((prev) => [...prev, { id: data.messageID ?? newId(), role: 'assistant', content: data.response }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Pega GenAI request failed.';
        setError(msg);
        setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: `⚠️ ${msg}` }]);
      } finally {
        setIsRunning(false);
      }
    },
    [agentID, context, enabled, ensureConversation]
  );

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew
  });

  const resetConversation = useCallback(() => {
    setMessages([]);
    setConversationID(null);
    setError(null);
    setIsRunning(false);
  }, []);

  return { runtime, resetConversation, error, hasMessages: messages.length > 0 };
}
