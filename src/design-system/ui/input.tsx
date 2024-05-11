/* eslint-disable no-restricted-properties */
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from './label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText: string;
  InputProps: any;
  error: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, helperText, ...props }, ref) => {
  return (
    <>
      {label && <Label className='block text-sm font-medium text-gray-900 dark:text-gray-300'>{label}</Label>}
      <input
        type={type}
        className={cn(
          'shadow-sm bg-gray-50  border-gray-300 text-gray-900  focus:ring-primary-500 focus:border-primary-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      {helperText && <Label className='block  text-xs font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>}
    </>
  );
});
Input.displayName = 'Input';

export { Input };
