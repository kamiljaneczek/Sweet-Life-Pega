/* eslint-disable react/no-unstable-nested-components */
import type { Meta, StoryObj } from '@storybook/react';

import AppAnnouncement from '@pega/react-sdk-components/lib/components/widget/AppAnnouncement';

import YourOrgSweetLifeFeaturedProducts from './index';
import { pyHome1Resolved, pyHome1Raw } from './mock';

const meta: Meta<typeof YourOrgSweetLifeFeaturedProducts> = {
  title: 'YourOrgSweetLifeFeaturedProducts',
  component: YourOrgSweetLifeFeaturedProducts,
  excludeStories: /.*Data$/,
};

export default meta;
type Story = StoryObj<typeof YourOrgSweetLifeFeaturedProducts>;

export const BaseYourOrgSweetLifeFeaturedProducts: Story = args => {
  const configProps = pyHome1Resolved.children[0].children[0].config;

  const props = {
    getPConnect: () => {
      return {
        getStateProps: () => {
          return {};
        },
        getActionsApi: () => {
          return {
            getNextWork: () => {
              return new Promise(resolve => {
                resolve({});
              });
            },
            updateFieldValue: () => {
              /* nothing */
            },
            triggerFieldChange: () => {
              /* nothing */
            }
          };
        },
        getChildren: () => {
          return pyHome1Raw.children;
        },
        getComponentName: () => {
          return '';
        },
        getLocalizedValue: value => {
          return value;
        },
        getRawMetadata: () => {
          return pyHome1Raw;
        },
        createComponent: config => {
          if (config.type === 'AppAnnouncement') {
            return (
              <AppAnnouncement
                key='announcement'
                header='Announcements'
                description={configProps.description}
                datasource={configProps.datasource}
                whatsnewlink={configProps.whatsnewlink}
                getPConnect={(): typeof PConnect => ({}) as typeof PConnect}
              />
            );
          }
        },
        ignoreSuggestion: () => {
          /* nothing */
        },
        acceptSuggestion: () => {
          /* nothing */
        },
        setInheritedProps: () => {
          /* nothing */
        },
        resolveConfigProps: () => {
          /* nothing */
        }
      };
    }
  };

  const regionAChildren = pyHome1Raw.children[0].children.map(child => {
    return props.getPConnect().createComponent(child);
  });

  return (
    <YourOrgSweetLifeFeaturedProducts {...props} {...args}>
      {regionAChildren}
    </YourOrgSweetLifeFeaturedProducts>
  );
};

BaseYourOrgSweetLifeFeaturedProducts.args = {};
