/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare const PCore: any;

import { useCallback, useEffect, useRef, useState } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../design-system/ui/select';
import type { CustomPConnectProps } from '../types';

interface OptionEntry {
  key: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Helpers ported from override-sdk Dropdown
// ---------------------------------------------------------------------------

const flattenParameters = (params: Record<string, any> = {}): Record<string, any> => {
  const flatParams: Record<string, any> = {};
  for (const key of Object.keys(params)) {
    const { name, value: theVal } = params[key];
    flatParams[name] = theVal;
  }
  return flatParams;
};

const preProcessColumns = (columnList: any[]): any[] => {
  return columnList.map((col) => {
    const temp = { ...col };
    temp.value = col.value?.startsWith('.') ? col.value.substring(1) : col.value;
    return temp;
  });
};

const getDisplayFieldsMetaData = (columnList: any[]) => {
  const displayColumns = columnList.filter((col) => col.display === 'true');
  const metaDataObj: any = { key: '', primary: '', secondary: [] };
  const keyCol = columnList.filter((col) => col.key === 'true');
  metaDataObj.key = keyCol.length > 0 ? keyCol[0].value : 'auto';
  for (const dc of displayColumns) {
    if (dc.primary === 'true') {
      metaDataObj.primary = dc.value;
    } else {
      metaDataObj.secondary.push(dc.value);
    }
  }
  return metaDataObj;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Dropdown({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const stateProps = pConnect.getStateProps() as any;
  const propName: string = stateProps?.value ?? '';

  const label = (configProps.label as string) ?? '';
  const helperText = (configProps.helperText as string) ?? '';
  const required = configProps.required === true;
  const disabled = configProps.disabled === true || configProps.readOnly === true;
  const value = (configProps.value as string) ?? '';
  const errorState = (configProps as any).status === 'error';
  const errorMessage = (stateProps?.validateMessage as string) ?? helperText;

  const context = pConnect.getContextName();
  const actionsApi = pConnect.getActionsApi();

  // Datasource-related config props
  let listType: string = (configProps.listType as string) ?? '';
  let datasource: any = configProps.datasource;
  let parameters: any = configProps.parameters;
  let columns: any[] = (configProps.columns as any[]) ?? [];
  const deferDatasource = configProps.deferDatasource === true;
  const datasourceMetadata = configProps.datasourceMetadata as any;

  const [options, setOptions] = useState<OptionEntry[]>([]);
  const [localValue, setLocalValue] = useState<string>(value);
  const optionsLoadedRef = useRef(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // ---------------------------------------------------------------------------
  // Convert deferred datasource to data page parameters
  // (mirrors override-sdk Dropdown lines 105-125)
  // ---------------------------------------------------------------------------
  if (deferDatasource && datasourceMetadata?.datasource?.name) {
    listType = 'datapage';
    datasource = datasourceMetadata.datasource.name;
    const { parameters: dsParams, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;
    parameters = flattenParameters(dsParams);
    const displayProp = propertyForDisplayText?.startsWith('@P') ? propertyForDisplayText.substring(3) : propertyForDisplayText;
    const valueProp = propertyForValue?.startsWith('@P') ? propertyForValue.substring(3) : propertyForValue;
    columns = [
      { key: 'true', setProperty: 'Associated property', value: valueProp },
      { display: 'true', primary: 'true', useForSearch: true, value: displayProp }
    ];
  }
  columns = preProcessColumns(columns);

  // ---------------------------------------------------------------------------
  // Load options based on datasource type
  // (mirrors override-sdk Dropdown + Utils.getOptionList logic)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (optionsLoadedRef.current) return;

    // Data page datasource — datasource is a string (data page name)
    if (typeof datasource === 'string' && datasource && listType !== 'associated') {
      optionsLoadedRef.current = true;
      console.log('[CustomPega] Dropdown: fetching data page', datasource, { parameters, columns });
      PCore.getDataPageUtils()
        .getDataAsync(datasource, context, parameters)
        .then((results: any) => {
          const optionsData: OptionEntry[] = [];
          const displayColumn = getDisplayFieldsMetaData(columns);
          results?.forEach((element: any) => {
            const val = element[displayColumn.primary]?.toString();
            const key = displayColumn.key === 'auto' ? (element.pyGUID ?? val) : element[displayColumn.key]?.toString();
            if (key && val) {
              optionsData.push({ key, value: val });
            }
          });
          console.log('[CustomPega] Dropdown: data page loaded', optionsData.length, 'options', optionsData.slice(0, 3));
          setOptions(optionsData);
        })
        .catch((err: any) => {
          console.error('[CustomPega] Dropdown: data page fetch failed', err);
        });
      return;
    }

    // For non-string datasources, use the same priority as SDK's Utils.getOptionList:
    // 1. configProps.listOutput (processed option list with proper key-value pairs)
    // 2. datasource.source
    // 3. datasource as array
    let listSourceItems: any[] | null = null;

    // Check listOutput first (SDK utility priority)
    const listOutput = configProps.listOutput as any;
    if (Array.isArray(listOutput) && listOutput.length > 0) {
      listSourceItems = listOutput;
      console.log('[CustomPega] Dropdown: using listOutput', listOutput.length, 'items');
    }

    // Fall back to datasource.source
    if (!listSourceItems) {
      const sourceItems = datasource?.source;
      if (Array.isArray(sourceItems) && sourceItems.length > 0) {
        listSourceItems = sourceItems;
        console.log('[CustomPega] Dropdown: using datasource.source', sourceItems.length, 'items');
      }
    }

    // Fall back to datasource as array directly
    if (!listSourceItems && Array.isArray(datasource) && datasource.length > 0) {
      listSourceItems = datasource;
      console.log('[CustomPega] Dropdown: using datasource array', datasource.length, 'items');
    }

    if (listSourceItems && listSourceItems.length > 0) {
      optionsLoadedRef.current = true;
      const optionsData: OptionEntry[] = [];
      const displayColumn = columns.length > 0 ? getDisplayFieldsMetaData(columns) : null;

      for (const item of listSourceItems) {
        // Normalize: Pega may provide `text` instead of `value` for display
        const displayText: string = (item.text ?? item.value ?? '')?.toString();
        const keyVal: string | undefined = item.key?.toString();

        if (keyVal !== undefined && displayText) {
          optionsData.push({ key: keyVal, value: displayText });
        } else if (displayColumn) {
          const val = item[displayColumn.primary]?.toString();
          const key = displayColumn.key === 'auto' ? (item.pyGUID ?? val) : item[displayColumn.key]?.toString();
          if (key && val) optionsData.push({ key, value: val });
        }
      }

      if (optionsData.length > 0) {
        console.log('[CustomPega] Dropdown: options loaded', optionsData.length, 'options', optionsData.slice(0, 3));
        setOptions(optionsData);
      }
    }
  }, [datasource, listType, parameters, context, columns, configProps.listOutput]);

  const handleValueChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      if (propName) {
        // Use actionsApi (same as override-sdk's handleEvent 'changeNblur' pattern)
        // to properly trigger Pega engine field change processing
        actionsApi.updateFieldValue(propName, newValue);
        actionsApi.triggerFieldChange(propName, newValue);
        pConnect.clearErrorMessages({ property: propName });
      }
    },
    [actionsApi, pConnect, propName]
  );

  // Don't render until options are loaded (prevents empty Select)
  if (options.length === 0) {
    return (
      <div data-component='Dropdown'>
        <Select value={localValue} disabled>
          <SelectTrigger label={label} required={required} helperText={helperText}>
            <SelectValue placeholder='Loading...' />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </div>
    );
  }

  return (
    <div data-component='Dropdown'>
      <Select value={localValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger label={label} required={required} helperText={errorState ? errorMessage : helperText} error={errorState}>
          <SelectValue placeholder='Select...' />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.key} value={opt.key}>
              {opt.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
