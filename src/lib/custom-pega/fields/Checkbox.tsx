/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from 'react';

import { Checkbox as CheckboxPrimitive } from '../../../design-system/ui/checkbox';
import { Label } from '../../../design-system/ui/label';
import type { CustomPConnectProps } from '../types';

export default function Checkbox({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const stateProps = pConnect.getStateProps() as any;
  const propName: string = stateProps?.value ?? '';

  const label = (configProps.label as string) ?? '';
  const caption = (configProps.caption as string) ?? label;
  const disabled = configProps.disabled === true || configProps.readOnly === true;
  const value = configProps.value === true || configProps.value === 'true';

  const [localChecked, setLocalChecked] = useState<boolean>(value);

  useEffect(() => {
    setLocalChecked(value);
  }, [value]);

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setLocalChecked(checked);
      if (propName) {
        pConnect.setValue(propName, checked);
      }
    },
    [pConnect, propName]
  );

  return (
    <div data-component='Checkbox' className='flex items-center space-x-2'>
      <CheckboxPrimitive
        checked={localChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
      {caption && (
        <Label className='text-sm font-normal text-gray-900 dark:text-gray-300'>
          {caption}
        </Label>
      )}
    </div>
  );
}
