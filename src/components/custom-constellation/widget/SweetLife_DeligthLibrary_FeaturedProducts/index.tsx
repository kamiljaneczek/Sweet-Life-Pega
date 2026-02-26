import PropTypes from 'prop-types';

import type { PConnFieldProps } from './PConnProps';

import StyledSweetLifeDeligthLibraryFeaturedProductsWrapper from './styles';

// interface for props
interface SweetLifeDeligthLibraryFeaturedProductsProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  dataPage: Array<any>;
  header: string;
  description: string;
}

// Duplicated runtime code from Constellation Design System Component

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
export default function SweetLifeDeligthLibraryFeaturedProducts(props: SweetLifeDeligthLibraryFeaturedProductsProps) {
  const { header, description, dataPage } = props;

  return (
    <StyledSweetLifeDeligthLibraryFeaturedProductsWrapper>
      <div>
        {header}
        {dataPage}
        {description}
      </div>
      ;
    </StyledSweetLifeDeligthLibraryFeaturedProductsWrapper>
  );
}
SweetLifeDeligthLibraryFeaturedProducts.defaultProps = {
  header: '',
  description: '',
  dataPage: ''
};

SweetLifeDeligthLibraryFeaturedProducts.propTypes = {
  header: PropTypes.string,
  description: PropTypes.string,
  dataPage: PropTypes.string
};
