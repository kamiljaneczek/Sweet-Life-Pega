import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { getDataPage } from '@pega/react-sdk-components/lib/components/helpers/data_page';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import Utils from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import isDeepEqual from 'fast-deep-equal/react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '../../../../design-system/ui/input';

interface IOption {
  key: string;
  value: string;
}

const preProcessColumns = (columnList) => {
  return columnList.map((col) => {
    const tempColObj = { ...col };
    tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;
    return tempColObj;
  });
};

const getDisplayFieldsMetaData = (columnList) => {
  const displayColumns = columnList.filter((col) => col.display === 'true');
  const metaDataObj: any = { key: '', primary: '', secondary: [] };
  const keyCol = columnList.filter((col) => col.key === 'true');
  metaDataObj.key = keyCol.length > 0 ? keyCol[0].value : 'auto';
  for (let index = 0; index < displayColumns.length; index += 1) {
    if (displayColumns[index].primary === 'true') {
      metaDataObj.primary = displayColumns[index].value;
    } else {
      metaDataObj.secondary.push(displayColumns[index].value);
    }
  }
  return metaDataObj;
};

interface AutoCompleteProps extends PConnFieldProps {
  // If any, enter additional props that only exist on AutoComplete here'
  displayMode?: string;
  deferDatasource?: boolean;
  datasourceMetadata?: any;
  status?: string;
  onRecordChange?: any;
  additionalProps?: object;
  listType: string;
  parameters?: any;
  datasource: any;
  columns: any[];
}

export default function AutoComplete(props: AutoCompleteProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TextInput = getComponentFromMap('TextInput');
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    required,
    placeholder,
    value = '',
    validatemessage,
    readOnly,
    testId,
    displayMode,
    deferDatasource,
    datasourceMetadata,
    status,
    helperText,
    hideLabel,
    onRecordChange
  } = props;

  const context = getPConnect().getContextName();
  let { listType, parameters, datasource = [], columns = [] } = props;
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<IOption[]>([]);
  const [theDatasource, setDatasource] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  let selectedValue: any = '';
  const helperTextToDisplay = validatemessage || helperText;

  const thePConn = getPConnect();
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as any).value;

  if (!isDeepEqual(datasource, theDatasource)) {
    // inbound datasource is different, so update theDatasource (to trigger useEffect)
    setDatasource(datasource);
  }

  const flattenParameters = (params = {}) => {
    const flatParams = {};
    Object.keys(params).forEach((key) => {
      const { name, value: theVal } = params[key];
      flatParams[name] = theVal;
    });

    return flatParams;
  };

  // convert associated to datapage listtype and transform props
  // Process deferDatasource when datapage name is present. WHhen tableType is promptList / localList
  if (deferDatasource && datasourceMetadata?.datasource?.name) {
    listType = 'datapage';
    datasource = datasourceMetadata.datasource.name;
    const { parameters: dataSourceParameters, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;
    parameters = flattenParameters(dataSourceParameters);
    const displayProp = propertyForDisplayText.startsWith('@P') ? propertyForDisplayText.substring(3) : propertyForDisplayText;
    const valueProp = propertyForValue.startsWith('@P') ? propertyForValue.substring(3) : propertyForValue;
    columns = [
      {
        key: 'true',
        setProperty: 'Associated property',
        value: valueProp
      },
      {
        display: 'true',
        primary: 'true',
        useForSearch: true,
        value: displayProp
      }
    ];
  }
  columns = preProcessColumns(columns);

  useEffect(() => {
    if (listType === 'associated') {
      setOptions(Utils.getOptionList(props, getPConnect().getDataObject('')));
    }
  }, [theDatasource]);

  useEffect(() => {
    if (!displayMode && listType !== 'associated') {
      getDataPage(datasource, parameters, context).then((results: any) => {
        const optionsData: any[] = [];
        const displayColumn = getDisplayFieldsMetaData(columns);
        results?.forEach((element) => {
          const val = element[displayColumn.primary]?.toString();
          const obj = {
            key: element[displayColumn.key] || element.pyGUID,
            value: val
          };
          optionsData.push(obj);
        });
        setOptions(optionsData);
      });
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (displayMode === 'LABELS_LEFT') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (value) {
    const index = options?.findIndex((element) => element.key === value);
    if (index > -1) {
      selectedValue = options[index].value;
    } else {
      selectedValue = value;
    }
  }

  const handleChange = (event: object, newValue: IOption | null) => {
    const val = newValue ? newValue.key : '';
    handleEvent(actionsApi, 'changeNblur', propName, val);
    if (onRecordChange) {
      onRecordChange(event);
    }
  };

  const handleInputValue = (newInputValue: string) => {
    setInputValue(newInputValue);
    setIsOpen(true);
  };

  if (readOnly) {
    const theValAsString = options?.find((opt) => opt.key === value)?.value;
    return <TextInput {...props} value={theValAsString} />;
  }

  // Filter options based on input value
  const filteredOptions = options.filter((option) => option.value?.toLowerCase().includes((inputValue || '').toLowerCase()));

  return (
    <div ref={wrapperRef} className='relative w-full' data-test-id={testId}>
      <Input
        label={label}
        required={required}
        placeholder={placeholder ?? ''}
        value={inputValue || selectedValue || ''}
        error={status === 'error'}
        helperText={helperTextToDisplay}
        InputProps={{}}
        onChange={(e) => handleInputValue((e.target as HTMLInputElement).value)}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg'>
          {filteredOptions.map((option) => (
            <li
              key={option.key}
              className='cursor-pointer px-3 py-2 text-sm hover:bg-gray-100'
              onClick={() => {
                handleChange({}, option);
                setInputValue(option.value);
                setIsOpen(false);
              }}
            >
              {option.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
