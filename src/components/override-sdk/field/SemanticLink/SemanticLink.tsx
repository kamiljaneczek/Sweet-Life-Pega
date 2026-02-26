import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

/* although this is called the SemanticLink component, we are not yet displaying as a
SemanticLink in SDK and only showing the value as a read only text field. */

interface SemanticLinkProps extends PConnFieldProps {
  // If any, enter additional props that only exist on SemanticLink here
  // from previous PropTypes
  text: string;
}

export default function SemanticLink(props: SemanticLinkProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const { text, displayMode, label, hideLabel } = props;

  if (displayMode === 'LABELS_LEFT' || (!displayMode && label !== undefined)) {
    const value = text || '---';
    return (
      <div className='grid grid-cols-2 gap-1 py-1' id='semantic-link-grid'>
        <span className='m-1 p-1 text-sm font-normal text-muted-foreground'>{label}</span>
        <span className='text-sm font-normal text-foreground'>{value}</span>
      </div>
    );
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={text} variant='stacked' />;
  }
}
