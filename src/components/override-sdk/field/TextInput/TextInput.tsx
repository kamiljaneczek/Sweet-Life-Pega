/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import { Input } from '../../../../design-system/ui/input';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Label } from '../../../../design-system/ui/label';

interface TextInputProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  fieldMetadata?: any;
}

export default function TextInput(props: TextInputProps) {
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
    /* onChange, onBlur */
    readOnly,
    testId,
    fieldMetadata,
    helperText,
    displayMode,
    hideLabel,
    placeholder
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;

  const target = pConn.getTarget();
  console.log('target', target);
  // @ts-ignorets-ignore
  const { containerName = 'primary' } = pConn.getContainerName();
  console.log('containerName', containerName);
  const context = pConn.getContextName();
  console.log('context', context);

  const containerManager = pConn.getContainerManager();
  containerManager.initializeContainers({
    type: 'multiple'
  });

  const helperTextToDisplay = validatemessage || helperText;

  const [inputValue, setInputValue] = useState('');
  const maxLength = fieldMetadata?.maxLength;

  let readOnlyProp = {}; // Note: empty if NOT ReadOnly

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (readOnly) {
    readOnlyProp = { readOnly: true };
  }

  let testProp = {};

  testProp = {
    'data-test-id': testId
  };

  function handleChange(event) {
    // update internal value
    setInputValue(event?.target?.value);
  }

  function handleBlur() {
    handleEvent(actions, 'changeNblur', propName, inputValue);
  }

  return (
    <>
      <Label htmlFor='email' className={required ? 'font-extrabold' : 'font-normal'}>
        {label}
      </Label>
      <Input
        placeholder={placeholder ?? ''}
        size={2}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        onBlur={!readOnly ? handleBlur : undefined}
        value={inputValue}
      />
      <p className='text-xs font-extralight text-neutral-600 -mt-2'>{helperText}</p>
    </>
  );
}
