/* eslint-disable @typescript-eslint/no-unused-vars */
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useState } from 'react';
import { Input } from '../../../../design-system/ui/input';
import { getCurrencyCharacters, getCurrencyOptions } from './currency-utils';

/* Using @unicef/material-ui-currency-textfield component here, since it allows formatting decimal values,
as per the locale.
*/

interface CurrrencyProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Currency here
  currencyISOCode?: string;
}

export default function Currency(props: CurrrencyProps) {
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
    /* onChange, onBlur, */
    readOnly,
    testId,
    helperText,
    displayMode,
    hideLabel,
    currencyISOCode = 'USD',
    placeholder
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;
  const helperTextToDisplay = validatemessage || helperText;

  const [inputValue, setInputValue] = useState('');

  // console.log(`Currency: label: ${label} value: ${value}`);

  const testProp = {
    'data-test-id': testId
  };

  // currencySymbols looks like this: { theCurrencySymbol: '$', theDecimalIndicator: '.', theSeparator: ',' }
  const theSymbols = getCurrencyCharacters(currencyISOCode);
  const theCurrSym = theSymbols.theCurrencySymbol;
  const theCurrDec = theSymbols.theDecimalIndicator;
  const theCurrSep = theSymbols.theDigitGroupSeparator;

  const theCurrencyOptions = getCurrencyOptions(currencyISOCode);
  const formattedValue = format(value, (pConn.getComponentName() ?? '').toLowerCase(), theCurrencyOptions);

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={formattedValue} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={formattedValue} variant='stacked' />;
  }

  function handleBlur() {
    handleEvent(actions, 'changeNblur', propName, inputValue);
  }
  function handleChange(event) {
    // update internal value
    setInputValue(event?.target?.value);
  }

  // console.log(`theCurrSym: ${theCurrSym} | theCurrDec: ${theCurrDec} | theCurrSep: ${theCurrSep}`);

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
      className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
      onChange={handleChange}
      onBlur={!readOnly ? handleBlur : undefined}
      type='text'
      InputProps={{ inputProps: { ...testProp } }}
    />
  );
}
