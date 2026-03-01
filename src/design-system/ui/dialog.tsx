'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogClose = DialogPrimitive.Close;

const DialogContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Backdrop className='fixed inset-0 z-50 bg-black/50 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0' />
    <DialogPrimitive.Popup
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background shadow-lg data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Popup>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

const DialogTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('border-b px-6 py-4', className)} {...props} />
);

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('px-6 py-4', className)} {...props} />;

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex justify-end gap-2 border-t px-6 py-4', className)} {...props} />
);

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogBody, DialogFooter };
