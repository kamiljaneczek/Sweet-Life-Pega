'use client';

import { AssistantRuntimeProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive } from '@assistant-ui/react';
import { Plus, Send } from 'lucide-react';
import { Button } from '../../design-system/ui/button';
import { usePegaAgentRuntime } from '../../lib/genai/usePegaAgentRuntime';
import { cn } from '../../lib/utils';
import { MarkdownText } from './MarkdownText';

interface ChatPanelProps {
  agentID: string;
  contextID: string;
  context: string;
  enabled: boolean;
  onClose?: () => void;
}

const UserMessage = () => (
  <MessagePrimitive.Root className='flex justify-end px-3 py-1.5'>
    <div className='max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap break-words'>
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => (
  <MessagePrimitive.Root className='flex justify-start px-3 py-1.5'>
    <div className='max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground break-words'>
      <MessagePrimitive.Parts>{({ part }) => (part.type === 'text' ? <MarkdownText /> : null)}</MessagePrimitive.Parts>
    </div>
  </MessagePrimitive.Root>
);

const TypingIndicator = () => (
  <div className='flex justify-start px-3 py-1.5' aria-label='Assistant is typing'>
    <div className='flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 text-sm text-muted-foreground'>
      <span>Processing your input</span>
      <span className='flex items-center gap-1' aria-hidden='true'>
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60' />
      </span>
    </div>
  </div>
);

export default function ChatPanel({ agentID, contextID, context, enabled }: ChatPanelProps) {
  const { runtime, resetConversation, error, hasMessages } = usePegaAgentRuntime({
    agentID,
    contextID,
    context,
    enabled
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='flex h-[640px] max-h-[calc(100vh-7rem)] w-[480px] max-w-[calc(100vw-5rem)] flex-col overflow-hidden rounded-md bg-popover text-popover-foreground'>
        <div className='flex items-center justify-between border-b px-3 py-2'>
          <div>
            <p className='text-sm font-semibold leading-tight'>Sweet Life Assistant</p>
            <p className='text-xs text-muted-foreground'>Powered by Pega GenAI</p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={resetConversation}
            disabled={!hasMessages}
            className='h-8 gap-1.5 px-2 text-xs'
            title='Start new conversation'
          >
            <Plus className='h-3.5 w-3.5' />
            New
          </Button>
        </div>

        <ThreadPrimitive.Root className='flex flex-1 flex-col overflow-hidden'>
          <ThreadPrimitive.Viewport className='flex-1 overflow-y-auto py-2'>
            <ThreadPrimitive.Empty>
              <div className='flex h-full flex-col items-center justify-center px-6 text-center'>
                <p className='text-sm font-medium'>How can I help?</p>
                <p className='mt-1 text-xs text-muted-foreground'>{enabled ? 'Ask the incident-support agent anything.' : 'Connecting to Pega…'}</p>
              </div>
            </ThreadPrimitive.Empty>

            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                AssistantMessage
              }}
            />

            <ThreadPrimitive.If running>
              <TypingIndicator />
            </ThreadPrimitive.If>
          </ThreadPrimitive.Viewport>

          {error && <div className='border-t bg-destructive/10 px-3 py-1.5 text-xs text-destructive'>{error}</div>}

          <ComposerPrimitive.Root className='flex items-end gap-2 border-t p-2'>
            <ComposerPrimitive.Input
              autoFocus
              placeholder={enabled ? 'Type a message…' : 'Waiting for Pega…'}
              disabled={!enabled}
              className={cn(
                'flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground',
                'min-h-[36px] max-h-32'
              )}
            />
            <ComposerPrimitive.Send asChild>
              <Button size='sm' className='h-9 w-9 p-0' disabled={!enabled} title='Send'>
                <Send className='h-4 w-4' />
              </Button>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </div>
    </AssistantRuntimeProvider>
  );
}
