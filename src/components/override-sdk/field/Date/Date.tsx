/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { dateFormatInfoDefault, getDateFormatInfo } from '@pega/react-sdk-components/lib/components/helpers/date-format-utils';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../design-system/ui/button';
import { Calendar } from '../../../../design-system/ui/calendar';
import { Label } from '../../../../design-system/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../design-system/ui/popover';
import { cn } from '../../../../lib/utils';

// Will return the date string in YYYY-MM-DD format which we'll be POSTing to the server
function getFormattedDate(date) {
  // return `${date.$y.toString()}-${(date.$M + 1).toString().padStart(2, '0')}-${date.$D.toString().padStart(2, '0')}`;
  return `${date.getFullYear()}-${(date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)}-${(date.getDate() < 9 ? '0' : '') + date.getDate()}`;
}

interface DateProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Date here
}

export default function Date(props: DateProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TextInput = getComponentFromMap('TextInput');
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
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
    hideLabel
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;
  const helperTextToDisplay = validatemessage || helperText;
  const [date, setDate] = useState<Date>();

  // Start with default dateFormatInfo
  const dateFormatInfo = dateFormatInfoDefault;
  // and then update, as needed, based on locale, etc.
  const theDateFormat = getDateFormatInfo();
  dateFormatInfo.dateFormatString = theDateFormat.dateFormatString;
  dateFormatInfo.dateFormatStringLC = theDateFormat.dateFormatStringLC;
  dateFormatInfo.dateFormatMask = theDateFormat.dateFormatMask;

  if (displayMode === 'LABELS_LEFT') {
    const formattedDate = format(props.value, 'date', {
      format: dateFormatInfo.dateFormatString
    });
    return <FieldValueList name={hideLabel ? '' : label} value={formattedDate} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    const formattedDate = format(props.value, 'date', {
      format: dateFormatInfo.dateFormatString
    });
    return <FieldValueList name={hideLabel ? '' : label} value={formattedDate} variant='stacked' />;
  }

  if (readOnly) {
    // const theReadOnlyComp = <TextInput props />
    return <TextInput {...props} />;
  }

  let testProp = {};

  testProp = {
    'data-test-id': testId
  };

  const handleChange = (date) => {
    onChange({ value: getFormattedDate(date) });
    setDate(date.toDateString());
  };

  const handleAccept = (date) => {
    if (date?.isValid()) {
      handleEvent(actions, 'changeNblur', propName, getFormattedDate(date));
    }
  };

  return (
    <>
      {label && (
        <Label className='block text-base font-normal text-gray-900 dark:text-gray-300'>
          {label} {required ? ' *' : null}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar mode='single' selected={date} onSelect={handleChange} initialFocus />
        </PopoverContent>
      </Popover>

      {helperText && <Label className='block -mt-0.5 pl-2 text-xs font-light text-muted text-gray-900 dark:text-gray-300'>{helperText}</Label>}
    </>
  );
}
