import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { getCurrencyOptions } from '@pega/react-sdk-components/lib/components/field/Currency/currency-utils';

import { getDateFormatInfo } from '@pega/react-sdk-components/lib/components/helpers/date-format-utils';
import isDeepEqual from 'fast-deep-equal/react';
import { useEffect, useState } from 'react';

import './CaseSummaryFields.css';

import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';

// CaseSummaryFields is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface CaseSummaryFieldsProps {
  // If any, enter additional props that only exist on this component
  status?: string;
  showStatus?: boolean;
  theFields: any[] | any | never;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm text-foreground'>{value}</span>
    </div>
  );
}

export default function CaseSummaryFields(props: CaseSummaryFieldsProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const Operator = getComponentFromMap('Operator');

  const { status, showStatus, theFields } = props;

  const [theFieldsToRender, setFieldsToRender] = useState([]);
  const [theFieldsAsGridItems, setFieldsAsGridItems] = useState<any[]>([]);

  function getFieldValue(field: any): any {
    const fieldTypeLower = field.type.toLowerCase();

    if (field.config.value === null || field.config.value === '') {
      // Special handling for missing value

      switch (fieldTypeLower) {
        case 'caseoperator':
          return <Operator {...field.config} />;

        default:
          return <ReadOnlyField label={field.config.label} value='---' />;
      }
    }

    switch (fieldTypeLower) {
      case 'textinput':
      case 'decimal':
      case 'integer':
      case 'dropdown':
        return <ReadOnlyField label={field.config.label} value={field.config.value} />;

      case 'checkbox': {
        const { caption, label, value, trueLabel, falseLabel } = field.config;
        const fieldLabel = label || caption;
        const fieldValue = value ? trueLabel : falseLabel;

        return <ReadOnlyField label={fieldLabel} value={fieldValue} />;
      }

      case 'status':
        return (
          <div className='flex flex-col'>
            <span className='text-xs text-muted-foreground'>{field.config.label}</span>
            <span className='psdk-csf-status-style'>{field.config.value}</span>
          </div>
        );

      case 'phone': {
        const displayPhone = field.config.value !== '' ? field.config.value : '---';
        return (
          <a href={`tel:${displayPhone}`}>
            <div className='flex flex-col cursor-pointer'>
              <span className='text-xs text-muted-foreground'>{field.config.label}</span>
              <span className='text-sm text-foreground'>{field.config.value}</span>
            </div>
          </a>
        );
      }

      case 'email': {
        const displayEmail = format(field.config.value, field.type);
        return (
          <a href={`mailto:${displayEmail}`}>
            <div className='flex flex-col cursor-pointer'>
              <span className='text-xs text-muted-foreground'>{field.config.label}</span>
              <span className='text-sm text-foreground'>{field.config.value}</span>
            </div>
          </a>
        );
      }

      case 'date':
      case 'datetime': {
        const theDateFormatInfo = getDateFormatInfo();
        // console.log(`theDateFormatInfo: ${theDateFormatInfo}`);
        const theFormat =
          fieldTypeLower === 'datetime' ? `${theDateFormatInfo.dateFormatStringLong} hh:mm a` : theDateFormatInfo.dateFormatStringLong;

        return (
          <ReadOnlyField
            label={field.config.label}
            value={format(field.config.value, field.type, {
              format: theFormat
            })}
          />
        );
      }

      case 'currency': {
        const theCurrencyOptions = getCurrencyOptions(field.config?.currencyISOCode);
        return <ReadOnlyField label={field.config.label} value={format(field.config.value, field.type, theCurrencyOptions)} />;
      }

      case 'boolean':
      case 'userreference':
        return <ReadOnlyField label={field.config.label} value={format(field.config.value, field.type)} />;

      case 'caseoperator':
        return <Operator {...field.config} />;

      default:
        return (
          <span>
            {field.type.toLowerCase()} {field.config.value}
          </span>
        );
    }
  }

  // Whenever theFieldsToRender changes, update theFieldsAsGridItems that's used during render
  useEffect(() => {
    const arGridItems = theFieldsToRender.map((field: any) => {
      // display the field when either visibility property doesn't exist or is true(if exists)
      if (field.config.visibility === undefined || field.config.visibility === true) {
        return (
          <div className='col-span-6' key={field.config.label}>
            {getFieldValue(field)}
          </div>
        );
      }

      return null;
    });
    setFieldsAsGridItems(arGridItems);
  }, [theFieldsToRender]);

  const theFieldsModifiable = theFields;

  // Special Case: if showStatus is true, splice the status value to be 2nd in theFields
  //  if it's not already there
  if (showStatus && theFields?.[1].type !== 'status') {
    const oStatus = {
      type: 'status',
      config: { value: status, label: 'Status' }
    };

    const count = theFieldsModifiable.length;
    if (count < 2) {
      theFieldsModifiable.push(oStatus);
    } else {
      theFieldsModifiable.splice(1, 0, oStatus);
    }
  }

  // At this point, we know what fields we want to render...
  //  So, update our state if it's changed
  if (!isDeepEqual(theFieldsToRender, theFieldsModifiable)) {
    setFieldsToRender(theFieldsModifiable);
  }

  return <div className='psdk-case-summary-fields grid grid-cols-12'>{theFieldsAsGridItems}</div>;
}
