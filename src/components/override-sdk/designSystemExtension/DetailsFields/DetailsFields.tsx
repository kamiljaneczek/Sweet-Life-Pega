import React, { createElement, isValidElement } from 'react';

import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters';

// DetailsFields is one of the few components that does NOT have getPConnect.
//  So, no need to extend PConnProps
interface DetailsFieldsProps {
  // If any, enter additional props that only exist on this component
  fields: any[];
}

export default function DetailsFields(props: DetailsFieldsProps) {
  // const componentName = "DetailsFields";
  const { fields = [] } = props;
  const fieldComponents: any[] = [];

  fields?.forEach((field, index) => {
    const thePConn = field.getPConnect();
    const theCompType = thePConn.getComponentName().toLowerCase();
    const { label } = thePConn.getConfigProps();
    const configObj = thePConn?.getReferencedView();
    configObj.config.readOnly = true;
    configObj.config.displayMode = 'LABELS_LEFT';
    const propToUse = { ...thePConn.getInheritedProps() };
    configObj.config.label = theCompType === 'reference' ? propToUse?.label : label;
    fieldComponents.push({
      type: theCompType,
      label,
      value: <React.Fragment key={index}>{createElement(createPConnectComponent(), thePConn.getReferencedViewPConnect())}</React.Fragment>
    });
  });

  function getGridItemLabel(field: any, keyVal: string) {
    const dispValue = field.label;

    return (
      <div className='w-1/2' key={keyVal}>
        <span className='block text-sm font-normal text-muted-foreground'>{dispValue}</span>
      </div>
    );
  }

  function formatItemValue(inField: any) {
    const { type, value } = inField;
    let formattedVal = value;

    switch (type) {
      case 'date':
        formattedVal = format(value, type);
        break;

      default:
        // No match means we return the value as we received it
        break;
    }

    // Finally, if the value is undefined or an empty string, we want to display it as "---"
    if (formattedVal === undefined || formattedVal === '') {
      formattedVal = '---';
    }

    return formattedVal;
  }

  function getGridItemValue(field: any, keyVal: string) {
    const formattedValue = formatItemValue(field);

    return (
      <div className='w-1/2' key={keyVal}>
        <span className='text-sm font-normal text-foreground'>{formattedValue}</span>
      </div>
    );
  }

  function getGridItem(field: any, keyVal: string) {
    return (
      <div className='w-full' key={keyVal}>
        <span className='text-sm font-normal text-foreground'>{field?.value}</span>
      </div>
    );
  }

  function getGridItems() {
    const gridItems: any[] = fieldComponents.map((field, index) => {
      if (field?.type === 'reference') {
        return field?.value;
      }
      if (isValidElement(field?.value)) {
        return (
          <div className='flex gap-1 py-1' key={index}>
            {getGridItem(field, `${index}-item`)}
          </div>
        );
      }
      return (
        <div className='flex gap-1 py-1' key={index}>
          {getGridItemLabel(field, `${index}-label`)}
          {getGridItemValue(field, `${index}-value`)}
        </div>
      );
    });
    return gridItems;
  }

  return <>{getGridItems()}</>;
}
