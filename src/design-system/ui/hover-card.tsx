'use client';

import { PreviewCard } from '@base-ui/react/preview-card';
import * as React from 'react';
import { createContext, forwardRef, useContext } from 'react';
import { cn } from '../../lib/utils';

// Context to bridge openDelay from HoverCard root to HoverCardTrigger
const HoverCardContext = createContext<{ openDelay?: number }>({});

function HoverCard({ openDelay, ...props }: PreviewCard.Root.Props & { openDelay?: number }) {
  return (
    <HoverCardContext.Provider value={{ openDelay }}>
      <PreviewCard.Root {...props} />
    </HoverCardContext.Provider>
  );
}

const HoverCardTrigger = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ children, ...props }, ref) => {
  const { openDelay } = useContext(HoverCardContext);
  return (
    <PreviewCard.Trigger delay={openDelay} render={<span ref={ref} {...props} />}>
      {children}
    </PreviewCard.Trigger>
  );
});
HoverCardTrigger.displayName = 'HoverCardTrigger';

const HoverCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end'; sideOffset?: number }
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PreviewCard.Portal>
    <PreviewCard.Positioner align={align} sideOffset={sideOffset}>
      <PreviewCard.Popup
        ref={ref}
        className={cn(
          'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
));
HoverCardContent.displayName = 'HoverCardContent';

export { HoverCard, HoverCardTrigger, HoverCardContent };
