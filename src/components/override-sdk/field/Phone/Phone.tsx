import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useEffect, useState } from 'react';
import { Input } from '../../../../design-system/ui/input';

interface PhoneProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Phone here
}

export default function Phone(props: PhoneProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    label,
    required,
    disabled,
    value = '',
    validatemessage,
    status,
    onChange,
    onBlur,
    readOnly,
    testId,
    helperText,
    displayMode,
    hideLabel,
    placeholder
  } = props;
  const helperTextToDisplay = validatemessage || helperText;
  const [inputValue, setInputValue] = useState('');
  let testProp = {};

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  testProp = {
    'data-test-id': testId
  };

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (readOnly) {
    return (
      <div>
        <Input
          helperText={helperTextToDisplay}
          placeholder={placeholder ?? ''}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
          error={status === 'error'}
          label={label}
          value={inputValue}
          InputProps={{
            readOnly: true,
            inputProps: { ...testProp }
          }}
        />
      </div>
    );
  }

  const handleChange = event => {
    setInputValue(event?.target?.value);
    const val = event?.target?.value;
    let phoneValue = val && val.replace(/\D+/g, '');
    phoneValue = `+${phoneValue}`;
    onChange({ value: phoneValue });
  };

  const handleBlur = event => {
    const phoneValue = event?.target?.value;
    event.target.value = `+${phoneValue && phoneValue.replace(/\D+/g, '')}`;
    onBlur(event);
  };

  return (
    <Input
      helperText={helperTextToDisplay}
      placeholder={placeholder ?? ''}
      required={required}
      disabled={disabled}
      className='shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light'
      onChange={handleChange}
      onBlur={!readOnly ? handleBlur : undefined}
      error={status === 'error'}
      label={label}
      value={inputValue}
      InputProps={{ ...testProp }}
    />
  );
}
