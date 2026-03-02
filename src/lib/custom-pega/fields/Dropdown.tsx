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
          console.log('[CustomPega] Dropdown: data page loaded', optionsData.length, 'options');
          setOptions(optionsData);
        })
        .catch((err: any) => {
          console.error('[CustomPega] Dropdown: data page fetch failed', err);
        });
      return;
    }

    // Inline / associated datasource — datasource is an object with `source` array
    const inlineSource: OptionEntry[] = datasource?.source ?? [];
    if (inlineSource.length > 0) {
      optionsLoadedRef.current = true;
      console.log('[CustomPega] Dropdown: inline datasource', inlineSource.length, 'options');
      setOptions(inlineSource);
      return;
    }

    // If datasource is an array directly (some Pega configs pass it this way)
    if (Array.isArray(datasource) && datasource.length > 0) {
      optionsLoadedRef.current = true;
      // Try to use Utils.getOptionList-like extraction
      const optionsData: OptionEntry[] = [];
      const displayColumn = columns.length > 0 ? getDisplayFieldsMetaData(columns) : null;
      for (const item of datasource) {
        if (item.key !== undefined && item.value !== undefined) {
          optionsData.push({ key: String(item.key), value: String(item.value) });
        } else if (displayColumn) {
          const val = item[displayColumn.primary]?.toString();
          const key = displayColumn.key === 'auto' ? (item.pyGUID ?? val) : item[displayColumn.key]?.toString();
          if (key && val) optionsData.push({ key, value: val });
        }
      }
      if (optionsData.length > 0) {
        console.log('[CustomPega] Dropdown: array datasource', optionsData.length, 'options');
        setOptions(optionsData);
      }
    }
  }, [datasource, listType, parameters, context, columns]);

  const handleValueChange = useCallback(
    (newValue: any) => {
      setLocalValue(newValue);
      if (propName) {
        pConnect.setValue(propName, newValue);
        pConnect.clearErrorMessages({ property: propName });
      }
    },
    [pConnect, propName]
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
