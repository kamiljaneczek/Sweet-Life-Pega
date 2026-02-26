import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { dateFormatInfoDefault, getDateFormatInfo } from '@pega/react-sdk-components/lib/components/helpers/date-format-utils';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import { Input } from '../../../../design-system/ui/input';

interface DateTimeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on DateTime here
}

export default function DateTime(props: DateTimeProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TextInput = getComponentFromMap('TextInput');
  const FieldValueList = getComponentFromMap('FieldValueList');

  const { getPConnect, label, required, disabled, value = '', validatemessage, status, readOnly, testId, helperText, displayMode, hideLabel } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;
  const helperTextToDisplay = validatemessage || helperText;

  // Start with default dateFormatInfo
  const dateFormatInfo = dateFormatInfoDefault;
  // and then update, as needed, based on locale, etc.
  const theDateFormat = getDateFormatInfo();
  dateFormatInfo.dateFormatString = theDateFormat.dateFormatString;
  dateFormatInfo.dateFormatStringLC = theDateFormat.dateFormatStringLC;
  dateFormatInfo.dateFormatMask = theDateFormat.dateFormatMask;

  if (displayMode === 'LABELS_LEFT') {
    const formattedDateTime = format(props.value, 'datetime', {
      format: `${dateFormatInfo.dateFormatString} hh:mm a`
    });
    return <FieldValueList name={hideLabel ? '' : label} value={formattedDateTime} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    const formattedDateTime = format(props.value, 'datetime', {
      format: `${dateFormatInfo.dateFormatString} hh:mm a`
    });
    return <FieldValueList name={hideLabel ? '' : label} value={formattedDateTime} variant='stacked' />;
  }

  if (readOnly) {
    const formattedDateTime = format(props.value, 'datetime');
    return <TextInput {...props} value={formattedDateTime} />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = event.target.value;
    const changeValue = dateStr ? new Date(dateStr).toISOString() : '';
    handleEvent(actions, 'changeNblur', propName, changeValue);
  };

  // Convert ISO string value to datetime-local input format (YYYY-MM-DDTHH:MM)
  let inputValue = '';
  if (value) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        inputValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    } catch {
      inputValue = '';
    }
  }

  return (
    <div data-test-id={testId}>
      <Input
        type='datetime-local'
        label={label}
        required={required}
        disabled={disabled}
        error={status === 'error'}
        helperText={helperTextToDisplay}
        InputProps={{}}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
}
