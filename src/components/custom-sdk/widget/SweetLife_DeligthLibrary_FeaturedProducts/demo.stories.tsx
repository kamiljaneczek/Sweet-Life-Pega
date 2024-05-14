import type { Meta, StoryObj } from '@storybook/react';

import SweetLifeDeligthLibraryFeaturedProducts from './index';
import { configProps } from './mock';

const meta: Meta<typeof SweetLifeDeligthLibraryFeaturedProducts> = {
  title: 'SweetLifeDeligthLibraryFeaturedProducts',
  component: SweetLifeDeligthLibraryFeaturedProducts,
  excludeStories: /.*Data$/
};

export default meta;
type Story = StoryObj<typeof SweetLifeDeligthLibraryFeaturedProducts>;

export const BaseSweetLifeDeligthLibraryFeaturedProducts: Story = args => {
  const props = {
    datasource: configProps.datasource
  };

  return <SweetLifeDeligthLibraryFeaturedProducts {...props} {...args} />;
};

BaseSweetLifeDeligthLibraryFeaturedProducts.args = {
  header: configProps.header,
  description: configProps.description
};
