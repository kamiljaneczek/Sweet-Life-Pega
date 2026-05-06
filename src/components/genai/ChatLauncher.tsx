'use client';

import { useMatch } from '@tanstack/react-router';
import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../design-system/ui/popover';
import useConstellation from '../../hooks/useConstellation';
import { cn } from '../../lib/utils';
import ChatPanel from './ChatPanel';

const AGENT_ID = (import.meta.env.VITE_PEGA_AGENT_ID as string | undefined) ?? 'Incident-support';
const APP_CONTEXT = (import.meta.env.VITE_PEGA_CONTEXT as string | undefined) ?? 'app/primary';
// Default fallback contextID used when not on a case page. Override via VITE_PEGA_CONTEXT_ID
// to test different values: app alias ('TellUsMoreRef'), class name ('SL-TellUsMoreRef-Work'),
// or a known case ID. Pega uses this to resolve the agent rule's class.
const DEFAULT_CONTEXT_ID = (import.meta.env.VITE_PEGA_CONTEXT_ID as string | undefined) ?? 'TellUsMoreRef';

export default function ChatLauncher() {
  const isPegaReady = useConstellation();
  const [open, setOpen] = useState(false);

  const supportMatch = useMatch({ from: '/support/new/$caseId', shouldThrow: false });
  const contextID = supportMatch?.params?.caseId ?? DEFAULT_CONTEXT_ID;

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={open ? 'Close chat' : 'Open chat'}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-60'
          )}
        >
          {open ? <X className='h-6 w-6' /> : <MessageCircle className='h-6 w-6' />}
        </PopoverTrigger>
        <PopoverContent side='top' align='end' sideOffset={12} className='w-auto border bg-popover p-0 shadow-xl'>
          <ChatPanel agentID={AGENT_ID} contextID={contextID} context={APP_CONTEXT} enabled={isPegaReady} onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
