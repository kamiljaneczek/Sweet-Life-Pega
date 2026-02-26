import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import { Input } from '../../../../design-system/ui/input';

interface TimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Time here
}

export default function Time(props: TimeProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');
  const TextInput = getComponentFromMap('TextInput');

  const { label, required, disabled, value = '', validatemessage, status, onChange, readOnly, helperText, displayMode, hideLabel, testId } = props;
  const helperTextToDisplay = validatemessage || helperText;

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (readOnly) {
    return <TextInput {...props} />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const theValue = event.target.value || null;
    onChange({ value: theValue });
  };

  // Convert HH:mm value to input format
  let timeValue = '';
  if (value) {
    // Value comes in as HH:mm format, which is already compatible with input type="time"
    timeValue = value;
  }

  return (
    <div data-test-id={testId}>
      <Input
        type='time'
        label={label}
        required={required}
        disabled={disabled}
        error={status === 'error'}
        helperText={helperTextToDisplay}
        InputProps={{}}
        value={timeValue}
        onChange={handleChange}
      />
    </div>
  );
}
