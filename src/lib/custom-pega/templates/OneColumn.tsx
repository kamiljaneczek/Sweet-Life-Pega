import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function OneColumn({ pConnect }: CustomPConnectProps) {
  return (
    <div data-component='OneColumn' className='space-y-4'>
      {renderChildren(pConnect)}
    </div>
  );
}
