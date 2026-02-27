/* eslint-disable react/jsx-no-useless-fragment */
// @ts-nocheck
import SweetLifeDeligthLibraryFeaturedProducts from './index';

import configProps from './mock';

export default {
  title: 'SweetLifeDeligthLibraryFeaturedProducts',
  component: SweetLifeDeligthLibraryFeaturedProducts
};

export const BaseSweetLifeDeligthLibraryFeaturedProducts = () => {
  const props = {
    label: configProps.label,
    header: configProps.header,
    description: configProps.description,
    image: configProps.image,
    datasource: configProps.datasource,
    whatsnewlink: configProps.whatsnewlink
  };

  return <SweetLifeDeligthLibraryFeaturedProducts {...props} />;
};
