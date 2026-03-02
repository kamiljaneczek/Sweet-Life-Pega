import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function Region({ pConnect }: CustomPConnectProps) {
  return (
    <div data-component='Region' className='space-y-4'>
      {renderChildren(pConnect)}
    </div>
  );
}
