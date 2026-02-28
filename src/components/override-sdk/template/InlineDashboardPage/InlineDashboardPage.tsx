import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

import { buildFilterComponents } from '@pega/react-sdk-components/lib/components/infra/DashboardFilter/filterUtils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Children, PropsWithChildren, useEffect, useMemo, useState } from 'react';

interface InlineDashboardPageProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  title: string;
  icon?: string;
  filterPosition?: string;
}

export default function InlineDashboardPage(props: PropsWithChildren<InlineDashboardPageProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const InlineDashboard = getComponentFromMap('InlineDashboard');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, getPConnect, icon = '', filterPosition = 'block-start' } = props;
  const [filterComponents, setFilterComponents] = useState([]);
  const childArray = useMemo(() => {
    return Children.toArray(children);
  }, [children]);

  const allFilters = (getPConnect().getRawMetadata() as any).children[1];

  useEffect(() => {
    setFilterComponents(buildFilterComponents(getPConnect, allFilters));
  }, []);

  const inlineProps = { ...props };
  inlineProps.children = [];
  // Region layout views
  inlineProps.children[0] = childArray[0];
  // filter items
  inlineProps.children[1] = filterComponents;

  return <InlineDashboard {...inlineProps} />;
}
