import { useState, useEffect } from 'react';

import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import { Checkbox } from '../../../../design-system/ui/checkbox';
import { Label } from '../../../../design-system/ui/label';

interface CheckboxProps extends Omit<PConnFieldProps, 'value'> {
  // If any, enter additional props that only exist on Checkbox here
  value?: boolean;

  caption?: string;
  trueLabel?: string;
  falseLabel?: string;
}

export default function CheckboxComponent(props: CheckboxProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    value = false,
    readOnly,
    testId,
    required,
    disabled,
    status,
    helperText,
    validatemessage,
    displayMode,
    hideLabel,
    trueLabel,
    falseLabel
  } = props;
  const helperTextToDisplay = validatemessage || helperText;

  const thePConn = getPConnect();
  const theConfigProps = thePConn.getConfigProps() as CheckboxProps;
  const caption = theConfigProps.caption;
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as any).value;

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    // This update theSelectedButton which will update the UI to show the selected button correctly
    setChecked(value);
  }, [value]);

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : caption} value={value ? trueLabel : falseLabel} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : caption} value={value ? trueLabel : falseLabel} variant='stacked' />;
  }

  const handleChange = (checkedState: boolean) => {
    handleEvent(actionsApi, 'changeNblur', propName, checkedState as unknown as string);
  };

  const handleBlur = () => {
    thePConn.getValidationApi().validate(checked as unknown as string);
  };

  return (
    <fieldset className={status === 'error' ? 'text-destructive' : ''}>
      {!hideLabel && (
        <legend className='mb-1 text-sm font-medium'>
          {label}
          {required && <span className='text-destructive'> *</span>}
        </legend>
      )}
      <div className='flex items-center gap-2' data-test-id={testId}>
        <Checkbox
          id={`checkbox-${propName}`}
          checked={checked}
          onCheckedChange={!readOnly ? handleChange : undefined}
          onBlur={!readOnly ? handleBlur : undefined}
          disabled={disabled || readOnly}
        />
        <Label htmlFor={`checkbox-${propName}`} className='text-sm font-normal'>
          {caption}
        </Label>
      </div>
      {helperTextToDisplay && (
        <p className={`mt-1 text-xs ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{helperTextToDisplay}</p>
      )}
    </fieldset>
  );
}
