import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

import StyledYourOrgSweetLifeFeaturedProductsWrapper from './styles';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface YourOrgSweetLifeFeaturedProductsProps extends PConnProps {
  // If any, enter additional props that only exist on this component
}

/*
 * The wrapper handles knowing how to take in just children
 *  and mapping to the TwoColumn template.
 */
// Duplicated runtime code from React SDK

// props passed in combination of props from property panel (config.json) and run time props from Constellation
export default function YourOrgSweetLifeFeaturedProducts(props: YourOrgSweetLifeFeaturedProductsProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const OneColumn = getComponentFromMap('OneColumn');

  return (
      <StyledYourOrgSweetLifeFeaturedProductsWrapper>
        <OneColumn
        {...props}
        />
      </StyledYourOrgSweetLifeFeaturedProductsWrapper>
  );
}
