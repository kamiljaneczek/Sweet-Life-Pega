import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { getCurrencyOptions } from '@pega/react-sdk-components/lib/components/field/Currency/currency-utils';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useState } from 'react';

import { Input } from '../../../../design-system/ui/input';

interface PercentageProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Percentage here
  currencyISOCode?: string;
}

export default function Percentage(props: PercentageProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    required,
    disabled,
    value = '',
    validatemessage,
    status,
    // onChange,
    // onBlur,
    readOnly,
    currencyISOCode = 'USD',
    testId,
    helperText,
    displayMode,
    hideLabel,
    placeholder
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;
  const helperTextToDisplay = validatemessage || helperText;

  const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
  const formattedValue = format(value, (pConn.getComponentName() ?? '').toLowerCase(), theCurrencyOptions);

  const [inputValue, setInputValue] = useState('');

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={formattedValue} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={formattedValue} variant='stacked' />;
  }

  const testProp = {
    'data-test-id': testId
  };

  function handleBlur() {
    const numValue = inputValue !== '' ? Number(inputValue) : inputValue;
    handleEvent(actions, 'changeNblur', propName, numValue as unknown as string);
  }

  function handleChange(event) {
    setInputValue(event?.target?.value);
  }

  return (
    <Input
      helperText={helperTextToDisplay}
      placeholder={placeholder ?? ''}
      required={required}
      disabled={disabled}
      readOnly={!!readOnly}
      error={status === 'error'}
      label={label}
      value={value}
      className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-accent dark:focus:border-accent'
      onChange={handleChange}
      onBlur={!readOnly ? handleBlur : undefined}
      type='text'
      InputProps={{ inputProps: { ...testProp } }}
    />
  );
}
