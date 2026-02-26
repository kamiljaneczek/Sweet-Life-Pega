import { PropsWithChildren, ReactElement } from 'react';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface OneColumnProps extends PConnProps {
  // If any, enter additional props that only exist on this component
}

export default function OneColumn(props: PropsWithChildren<OneColumnProps>) {
  const { children } = props;
  return (children as ReactElement[]).map(child => {
    return (
      <div key={child.key} className=''>
        {child}
      </div>
    );
  });
}
