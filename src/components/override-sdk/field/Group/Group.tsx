import { ReactElement, useMemo } from 'react';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface GroupProps extends PConnFieldProps {
  children: ReactElement[];
  heading: string;
  showHeading: boolean;
  instructions?: string;
  collapsible: boolean;
  type: string;
}

export default function Group(props: GroupProps) {
  const { children, heading, showHeading, instructions, collapsible, displayMode, type } = props;

  const isReadOnly = displayMode === 'LABELS_LEFT';
  const FieldGroup = getComponentFromMap('FieldGroup');
  const content = useMemo(() => {
    return (
      <div className='grid grid-cols-1 gap-2'>
        {children?.map(child => (
          <div key={child.key}>{child}</div>
        ))}
      </div>
    );
  }, [children, type, isReadOnly]);

  if (!children) return null;

  return (
    <FieldGroup name={showHeading ? heading : undefined} collapsible={collapsible} instructions={instructions}>
      {content}
    </FieldGroup>
  );
}
