import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import Utils from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useEffect, useState } from 'react';

// Can't use RadioButtonProps until getLocaleRuleNameFromKeys is NOT private
interface RadioButtonsProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RadioButtons here
  inline: boolean;
  fieldMetadata?: any;
}

export default function RadioButtons(props: RadioButtonsProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    value = '',
    readOnly,
    validatemessage,
    helperText,
    status,
    required,
    inline,
    displayMode,
    hideLabel,
    fieldMetadata
  } = props;
  const [theSelectedButton, setSelectedButton] = useState(value);

  const thePConn = getPConnect();
  const theConfigProps = thePConn.getConfigProps();
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as any).value;
  const helperTextToDisplay = validatemessage || helperText;
  const className = thePConn.getCaseInfo().getClassName();

  let configProperty = (thePConn.getRawMetadata() as any)?.config?.value || '';
  configProperty = configProperty.startsWith('@P') ? configProperty.substring(3) : configProperty;
  configProperty = configProperty.startsWith('.') ? configProperty.substring(1) : configProperty;

  const metaData = Array.isArray(fieldMetadata) ? fieldMetadata.filter((field) => field?.classID === className)[0] : fieldMetadata;
  let displayName = metaData?.datasource?.propertyForDisplayText;
  displayName = displayName?.slice(displayName.lastIndexOf('.') + 1);
  const localeContext = metaData?.datasource?.tableType === 'DataPage' ? 'datapage' : 'associated';
  const localeClass = localeContext === 'datapage' ? '@baseclass' : className;
  const localeName = localeContext === 'datapage' ? metaData?.datasource?.name : configProperty;
  const localePath = localeContext === 'datapage' ? displayName : localeName;

  // theOptions will be an array of JSON objects that are literally key/value pairs.
  //  Ex: [ {key: "Basic", value: "Basic"} ]
  const theOptions = Utils.getOptionList(theConfigProps, thePConn.getDataObject(''));

  useEffect(() => {
    // This update theSelectedButton which will update the UI to show the selected button correctly
    setSelectedButton(value);
  }, [value]);

  if (displayMode === 'LABELS_LEFT') {
    return (
      <FieldValueList
        name={hideLabel ? '' : label}
        // @ts-expect-error - Property 'getLocaleRuleNameFromKeys' is private and only accessible within class 'C11nEnv'
        value={thePConn.getLocalizedValue(value, localePath, thePConn.getLocaleRuleNameFromKeys(localeClass, localeContext, localeName))}
      />
    );
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return (
      <FieldValueList
        name={hideLabel ? '' : label}
        // @ts-expect-error - Property 'getLocaleRuleNameFromKeys' is private and only accessible within class 'C11nEnv'
        value={thePConn.getLocalizedValue(value, localePath, thePConn.getLocaleRuleNameFromKeys(localeClass, localeContext, localeName))}
        variant='stacked'
      />
    );
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleEvent(actionsApi, 'changeNblur', propName, event.target.value);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    thePConn.getValidationApi().validate(event.target.value, ''); // 2nd arg empty string until typedef marked correctly as optional
  };

  return (
    <fieldset className={status === 'error' ? 'text-destructive' : ''}>
      <legend className='mb-1 text-sm font-medium'>
        {label}
        {required && <span className='text-destructive'> *</span>}
      </legend>
      <div className={inline ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'} onBlur={!readOnly ? handleBlur : undefined}>
        {theOptions.map((theOption) => {
          const optionLabel = thePConn.getLocalizedValue(
            theOption.value,
            localePath,
            // @ts-expect-error - Property 'getLocaleRuleNameFromKeys' is private and only accessible within class 'C11nEnv'
            thePConn.getLocaleRuleNameFromKeys(localeClass, localeContext, localeName)
          );
          return (
            <label key={theOption.key} className='flex cursor-pointer items-center gap-2'>
              <input
                type='radio'
                name={propName}
                value={theOption.key}
                checked={theSelectedButton === theOption.key}
                onChange={handleChange}
                disabled={readOnly}
                className='h-4 w-4 border-gray-300 text-primary focus:ring-primary'
              />
              <span className='text-sm'>{optionLabel}</span>
            </label>
          );
        })}
      </div>
      {helperTextToDisplay && (
        <p className={`mt-1 text-xs ${status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{helperTextToDisplay}</p>
      )}
    </fieldset>
  );
}
