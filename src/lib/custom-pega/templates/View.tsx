import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function View({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const inheritedProps = pConnect.getInheritedProps?.() ?? {};

  const label = configProps.label as string | undefined;
  const showLabel = configProps.showLabel !== false;
  const visibility = inheritedProps.visibility ?? configProps.visibility;

  if (visibility === false) return null;

  return (
    <div data-component='View'>
      {label && showLabel && (
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
          {label}
        </h3>
      )}
      {renderChildren(pConnect)}
    </div>
  );
}
