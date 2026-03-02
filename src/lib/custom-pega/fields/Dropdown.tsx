/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../design-system/ui/select';
import type { CustomPConnectProps } from '../types';

interface DatasourceEntry {
  key: string;
  value: string;
}

export default function Dropdown({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const stateProps = pConnect.getStateProps() as any;
  const propName: string = stateProps?.value ?? '';

  const label = (configProps.label as string) ?? '';
  const helperText = (configProps.helperText as string) ?? '';
  const required = configProps.required === true;
  const disabled = configProps.disabled === true || configProps.readOnly === true;
  const value = (configProps.value as string) ?? '';
  const errorState = (configProps as any).status === 'error';
  const errorMessage = (stateProps?.validateMessage as string) ?? helperText;

  // Inline datasource options
  const datasource: DatasourceEntry[] = (configProps.datasource as any)?.source ?? [];

  const [localValue, setLocalValue] = useState<string>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      if (propName) {
        pConnect.setValue(propName, newValue);
        pConnect.clearErrorMessages({ property: propName });
      }
    },
    [pConnect, propName]
  );

  return (
    <div data-component='Dropdown'>
      <Select value={localValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger
          label={label}
          required={required}
          helperText={errorState ? errorMessage : helperText}
          error={errorState}
        >
          <SelectValue placeholder='Select...' />
        </SelectTrigger>
        <SelectContent>
          {datasource.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
