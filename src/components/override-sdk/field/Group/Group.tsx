import { Grid } from '@material-ui/core';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { ReactElement, useMemo } from 'react';

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
      <Grid container spacing={2}>
        {children?.map((child) => (
          <Grid item xs={12} key={child.key}>
            {child}
          </Grid>
        ))}
      </Grid>
    );
  }, [children, type, isReadOnly]);

  if (!children) return null;

  return (
    <FieldGroup name={showHeading ? heading : undefined} collapsible={collapsible} instructions={instructions}>
      {content}
    </FieldGroup>
  );
}
