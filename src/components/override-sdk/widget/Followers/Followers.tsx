import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { PropsWithChildren } from 'react';

interface FollowersProps extends PConnProps {
  // If any, enter additional props that only exist on this component
}

export default function Followers(props: PropsWithChildren<FollowersProps>) {
  const componentName = 'Followers';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children } = props;

  return (
    <div className='m-1 rounded-lg border bg-card p-1 text-card-foreground shadow-sm'>
      <div className='p-4 pb-2'>
        <h6 className='text-lg font-semibold'>
          {componentName} - <em>unsupported</em>
        </h6>
      </div>
      <div className='px-4 pb-4'>
        <p>{componentName} content</p>
      </div>
    </div>
  );
}
