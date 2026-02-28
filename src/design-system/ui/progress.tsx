'use client';

import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Progress = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { value?: number | null; max?: number }>(
  ({ className, value, max, ...props }, ref) => (
    <ProgressPrimitive.Root value={value} max={max}>
      <ProgressPrimitive.Track ref={ref} className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
        <ProgressPrimitive.Indicator className='h-full w-full flex-1 bg-accent transition-all' />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = 'Progress';

export { Progress };
