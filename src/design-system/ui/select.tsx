import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { Label } from './label';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

type ExtendedSelectTriggerProps = SelectPrimitive.Trigger.Props & {
  required?: boolean;
  label: string;
  helperText?: string;
  error?: boolean;
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, ExtendedSelectTriggerProps>(
  ({ className, children, label, required, helperText, error, ...props }, ref) => (
    <>
      {label && (
        <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>
          {label} {required ? ' *' : null}
        </Label>
      )}
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        )}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon render={<ChevronDown className='h-4 w-4 opacity-50' />} />
      </SelectPrimitive.Trigger>
      {helperText && error ? (
        <Label className='block mt-1 pl-1 text-sm  font-light text-destructive dark:text-destructive'>{helperText}</Label>
      ) : (
        helperText && <Label className='block mt-1 pl-1 text-sm  font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>
      )}
    </>
  )
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectScrollUpButton = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpArrow ref={ref} className={cn('flex cursor-default items-center justify-center py-1', className)} {...props}>
    <ChevronUp className='h-4 w-4' />
  </SelectPrimitive.ScrollUpArrow>
));
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

const SelectScrollDownButton = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownArrow ref={ref} className={cn('flex cursor-default items-center justify-center py-1', className)} {...props}>
    <ChevronDown className='h-4 w-4' />
  </SelectPrimitive.ScrollDownArrow>
));
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

const SelectContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { position?: string }>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={position === 'popper' ? 1 : 0} side='bottom' align='start'>
        <SelectPrimitive.Popup
          ref={ref}
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className={cn('p-1', position === 'popper' && 'w-full min-w-[var(--anchor-width)]')}>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = 'SelectContent';

const SelectLabel = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <SelectPrimitive.GroupLabel ref={ref} className={cn('py-1.5 pl-8 pr-2 text-base font-semibold', className)} {...props} />
));
SelectLabel.displayName = 'SelectLabel';

const SelectItem = React.forwardRef<HTMLDivElement, SelectPrimitive.Item.Props>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-base outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
      <SelectPrimitive.ItemIndicator>
        <Check className='h-4 w-4' />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

const SelectSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
};
