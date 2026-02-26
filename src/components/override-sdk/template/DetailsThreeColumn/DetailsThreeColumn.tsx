import { createElement } from 'react';

import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface DetailsThreeColumnProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  showLabel: boolean;
  label: string;
  showHighlightedData: boolean;
}

export default function DetailsThreeColumn(props: DetailsThreeColumnProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldGroup = getComponentFromMap('FieldGroup');

  const { label, showLabel = true, getPConnect, showHighlightedData = false } = props;

  // Get the inherited props from the parent to determine label settings
  const propsToUse = { label, showLabel, ...getPConnect().getInheritedProps() };

  // Set display mode prop and re-create the children so this part of the dom tree renders
  // in a readonly (display) mode instead of a editable
  getPConnect().setInheritedProp('displayMode', 'LABELS_LEFT');
  getPConnect().setInheritedProp('readOnly', true);
  const children = (getPConnect().getChildren() as any[]).map((configObject, index) =>
    createElement(createPConnectComponent(), {
      ...configObject,

      key: index.toString()
    })
  );

  // Set up highlighted data to pass in return if is set to show, need raw metadata to pass to createComponent
  let highlightedDataArr = [];
  if (showHighlightedData) {
    const { highlightedData = [] } = (getPConnect().getRawMetadata() as any).config;
    highlightedDataArr = highlightedData.map(field => {
      field.config.displayMode = 'STACKED_LARGE_VAL';

      // Mark as status display when using pyStatusWork
      if (field.config.value === '@P .pyStatusWork') {
        field.type = 'TextInput';
        field.config.displayAsStatus = true;
      }

      return getPConnect().createComponent(field, undefined, undefined, {}); // 2nd, 3rd, and 4th args now properly typed as optional
    });
  }

  return (
    <FieldGroup name={propsToUse.showLabel ? propsToUse.label : ''}>
      {showHighlightedData && highlightedDataArr.length > 0 && (
        <div className='grid grid-cols-3 gap-2 pb-4'>
          {highlightedDataArr.map((child, i) => (
            <div key={`hf-${i + 1}`}>{child}</div>
          ))}
        </div>
      )}
      <div className='grid grid-cols-3 gap-2'>
        {children.map((child, i) => (
          <div key={`r-${i + 1}`}>{child}</div>
        ))}
      </div>
    </FieldGroup>
  );
}
