/* eslint-disable react/jsx-no-useless-fragment */
// @ts-nocheck
import { withKnobs } from '@storybook/addon-knobs';

import SweetLifeDeligthLibraryFeaturedProducts from './index';

import configProps from './mock';

export default {
  title: 'SweetLifeDeligthLibraryFeaturedProducts',
  decorators: [withKnobs],
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

  return (
    <>
      <SweetLifeDeligthLibraryFeaturedProducts {...props} />
    </>
  );
};
