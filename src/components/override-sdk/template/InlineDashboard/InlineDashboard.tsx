import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { PropsWithChildren, ReactElement } from 'react';

interface InlineDashboardProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  title: string;
  filterPosition?: string;
}

export default function InlineDashboard(props: PropsWithChildren<InlineDashboardProps>) {
  const { children, title, filterPosition } = props;
  const childrenToRender = children as ReactElement[];

  const isInlineStart = filterPosition === 'inline-start';

  return (
    <>
      <h4 className='text-xl font-medium'>{title}</h4>

      {filterPosition === 'block-start' && (
        <div className='flex flex-col-reverse gap-4 my-4'>
          <div className='grid gap-4 content-baseline'>{childrenToRender[0]}</div>
          <div className='grid gap-4' style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {childrenToRender[1]}
          </div>
        </div>
      )}
      {filterPosition !== 'block-start' && (
        <div className='grid gap-4 my-4' style={{ gridTemplateColumns: isInlineStart ? '1fr 3fr' : '3fr 1fr' }}>
          <div className={isInlineStart ? 'order-2' : ''}>{childrenToRender[0]}</div>
          <div id='filters' className={`grid gap-4 content-baseline mt-4 ${isInlineStart ? 'order-1' : ''}`}>
            {childrenToRender[1]}
          </div>
        </div>
      )}
    </>
  );
}
