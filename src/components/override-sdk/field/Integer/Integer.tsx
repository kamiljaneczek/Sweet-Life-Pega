import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import { Input } from '../../../../design-system/ui/input';

interface IntegerProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Integer here
}

export default function Integer(props: IntegerProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TextInput = getComponentFromMap('TextInput');
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

  // console.log(`Integer: label: ${label} value: ${value}`);

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (readOnly) {
    return <TextInput {...props} />;
  }

  function intOnChange(event) {
    // console.log(`Integer intOnChange inValue: ${event.target.value}`);

    // Disallow "." and "," (separators) since this is an integer field
    //  Mimics Pega Integer behavior (where separator characters are "eaten" if they're typed)
    const disallowedChars = ['.', ','];
    const theAttemptedValue = event.target.value;
    const lastChar = theAttemptedValue.slice(-1);

    if (disallowedChars.includes(lastChar)) {
      event.target.value = theAttemptedValue.slice(0, -1);
    }

    // Pass through to the Constellation change handler
    onChange(event);
  }

  return (
    <div data-test-id={testId}>
      <Input
        type='text'
        inputMode='numeric'
        pattern='[0-9]*'
        label={label}
        placeholder={placeholder ?? ''}
        required={required}
        disabled={disabled}
        onChange={intOnChange}
        onBlur={!readOnly ? onBlur : undefined}
        error={status === 'error'}
        helperText={helperTextToDisplay}
        InputProps={{}}
        value={value}
      />
    </div>
  );
}
