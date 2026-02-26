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

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, helperText, error, required, label, ...props }, ref) => {
  return (
    <>
      {label && (
        <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>
          {label} {required ? ' *' : null}
        </Label>
      )}
      <textarea
        className={cn(
          'shadow-md flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      {helperText && error ? (
        <Label className='block mt-2 pl-1 text-sm  font-light text-destructive dark:text-destructive'>{helperText}</Label>
      ) : (
        helperText && <Label className='block mt-2 pl-2 text-xs font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>
      )}
    </>
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
