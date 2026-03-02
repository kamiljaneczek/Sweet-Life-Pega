import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function SimpleTableSelect({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());

  const label = configProps.label as string | undefined;
  const showLabel = configProps.showLabel !== false;

  return (
    <div data-component='SimpleTableSelect' className='space-y-2'>
      {label && showLabel && <h4 className='text-base font-medium text-gray-900 dark:text-white'>{label}</h4>}
      {renderChildren(pConnect)}
    </div>
  );
}
