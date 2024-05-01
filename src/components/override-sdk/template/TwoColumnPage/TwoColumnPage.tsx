import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface TwoColumnPageProps extends PConnProps {
  // If any, enter additional props that only exist on this component
}

/*
 * The wrapper handles knowing how to take in just children
 *  and mapping to the TwoColumn template.
 */
export default function TwoColumnPage(props: TwoColumnPageProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TwoColumn = getComponentFromMap('TwoColumn');

  return <TwoColumn {...props} />;
}
