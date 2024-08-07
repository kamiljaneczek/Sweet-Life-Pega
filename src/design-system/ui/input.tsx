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
  const { onChange, onBlur, disabled, required, error } = props;
  return (
    <>
      {label && (
        <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>
          {label} {required ? ' *' : null}
        </Label>
      )}
      <input
        type={type}
        disabled={disabled}
        className={cn(
          'shadow-sm bg-gray-50 border-gray-300 text-gray-900 focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-accent dark:focus:border-accent dark:shadow-sm-light flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onChange={onChange}
        onBlur={onBlur}
      />
      {helperText && error ? (
        <Label className='block mt-2 pl-1 text-sm font-light text-destructive dark:text-destructive'>{helperText}</Label>
      ) : (
        helperText && <Label className='block mt-2 pl-1 text-sm  font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>
      )}
    </>
  );
});
Input.displayName = 'Input';

export { Input };
