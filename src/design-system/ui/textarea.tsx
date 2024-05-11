/* eslint-disable no-restricted-properties */
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from './label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  fullWidth?: boolean;
  variant: 'standard' | 'filled' | 'outlined';
  helperText: string;
  size?: 'small' | 'medium';
  error?: boolean;
  label: string;
  InputProps?: any;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, helperText, label, ...props }, ref) => {
  return (
    <>
      {label && <Label className='block text-sm font-medium text-gray-900 dark:text-gray-300'>{label}</Label>}
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      {helperText && <Label className='block  text-xs font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>}
    </>
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
