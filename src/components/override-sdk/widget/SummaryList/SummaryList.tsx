import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface SummaryListProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  arItems$: any[];
  menuIconOverride$?: string;
  menuIconOverrideAction$?: any;
}

export default function SummaryList(props: SummaryListProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const SummaryItem = getComponentFromMap('SummaryItem');

  const { menuIconOverride$: menuOverride = '' } = props;
  return (
    <div>
      {props.arItems$.map(file => (
        <SummaryItem key={file.id} menuIconOverride$={menuOverride} arItems$={file} menuIconOverrideAction$={props.menuIconOverrideAction$} />
      ))}
    </div>
  );
}
