import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function Group({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());

  const heading = configProps.heading as string | undefined;
  const showHeading = configProps.showHeading !== false;

  return (
    <div data-component='Group' className='space-y-3'>
      {heading && showHeading && <h4 className='text-base font-medium text-gray-900 dark:text-white'>{heading}</h4>}
      <div className='grid grid-cols-1 gap-2'>{renderChildren(pConnect)}</div>
    </div>
  );
}
