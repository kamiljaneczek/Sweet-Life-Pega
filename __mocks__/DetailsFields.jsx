/* eslint-disable react/no-array-index-key */
import React, { createElement, isValidElement } from 'react';
import { format } from '@pega/react-sdk-components/lib/components/helpers/formatters/index';

import createPConnectComponent from './react_pconnect';

const styles = {
  fieldLabel: {
    display: 'block',
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '0.875rem',
    lineHeight: 1.43
  },
  fieldValue: {
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: '0.875rem',
    lineHeight: 1.43
  }
};

export default function DetailsFields(props) {
  // const componentName = "DetailsFields";
  const { fields = [] } = props;
  const fieldComponents = [];

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

  function getGridItemLabel(field, keyVal) {
    const dispValue = field.label;

    return (
      <div style={{ flex: '0 0 50%', maxWidth: '50%' }} key={keyVal}>
        <span style={styles.fieldLabel}>{dispValue}</span>
      </div>
    );
  }

  function formatItemValue(inField) {
    const { type, value } = inField;
    let formattedVal = value;

    // eslint-disable-next-line sonarjs/no-small-switch
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

  function getGridItemValue(field, keyVal) {
    const formattedValue = formatItemValue(field);

    return (
      <div style={{ flex: '0 0 50%', maxWidth: '50%' }} key={keyVal}>
        <span style={styles.fieldValue}>{formattedValue}</span>
      </div>
    );
  }

  function getGridItem(field, keyVal) {
    return (
      <div style={{ flex: '0 0 100%', maxWidth: '100%' }} key={keyVal}>
        <span style={styles.fieldValue}>{field?.value}</span>
      </div>
    );
  }

  function getGridItems() {
    return fieldComponents.map((field, index) => {
      if (field?.type === 'reference') {
        return field?.value;
      }
      if (isValidElement(field?.value)) {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0px' }} key={index}>
            {getGridItem(field, `${index}-item`)}
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0px' }} key={index}>
          {getGridItemLabel(field, `${index}-label`)}
          {getGridItemValue(field, `${index}-value`)}
        </div>
      );
    });
  }

  return <>{getGridItems()}</>;
}

export function decorator(story) {
  return story();
}
