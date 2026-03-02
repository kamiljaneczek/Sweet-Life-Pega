/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from 'react';

import { Textarea } from '../../../design-system/ui/textarea';
import type { CustomPConnectProps } from '../types';

export default function TextArea({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const stateProps = pConnect.getStateProps() as any;
  const propName: string = stateProps?.value ?? '';

  const label = (configProps.label as string) ?? '';
  const helperText = (configProps.helperText as string) ?? '';
  const required = configProps.required === true;
  const disabled = configProps.disabled === true || configProps.readOnly === true;
  const placeholder = (configProps.placeholder as string) ?? '';
  const value = (configProps.value as string) ?? '';
  const errorState = (configProps as any).status === 'error';
  const errorMessage = (stateProps?.validateMessage as string) ?? helperText;

  const [localValue, setLocalValue] = useState<string>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    if (propName) {
      pConnect.setValue(propName, localValue);
      pConnect.clearErrorMessages({ property: propName });
    }
  }, [pConnect, propName, localValue]);

  return (
    <div data-component='TextArea'>
      <Textarea
        label={label}
        helperText={errorState ? errorMessage : helperText}
        error={errorState}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        variant='outlined'
      />
    </div>
  );
}
