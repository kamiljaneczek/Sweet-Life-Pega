// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { Button, useToaster } from '@pega/cosmos-react-core';

import type { PConnFieldProps } from './PConnProps';


// interface for props
interface YourOrgSweetLifeFeaturedProductsWorkProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  variant: any;

}

export default function GetNextWork(props: YourOrgSweetLifeFeaturedProductsWorkProps) {
  const { getPConnect, variant } = props;

  const toasterCtx = useToaster();

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;

  const getNextWork = () => {

    // alert('Get next work clicked');

    getPConnect()
      .getActionsApi()
      .getNextWork()
      .catch((err) => {
        console.log(err);
        if (err[0].status === 404) {
          toasterCtx.push({
            content: localizedVal('No task currently available')
          });
        }
      });
  };

  return (
    <Button variant={variant} onClick={getNextWork}>
      {getPConnect().getLocalizedValue('Get next work', '', '')}
    </Button>
  );
}
