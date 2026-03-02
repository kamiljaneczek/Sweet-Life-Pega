import type { CustomPConnectProps } from './types';
import { renderChildren } from './PConnectRenderer';

const warnedTypes = new Set<string>();

export default function FallbackComponent({ pConnect }: CustomPConnectProps) {
  const componentName = pConnect.getComponentName();

  if (!warnedTypes.has(componentName)) {
    warnedTypes.add(componentName);
    console.warn(`[CustomPega] Unmapped component type: "${componentName}"`);
  }

  const isDev = import.meta.env.DEV;

  return (
    <div
      className={isDev ? 'border-2 border-dashed border-yellow-400 p-2 my-1' : undefined}
      data-component={componentName}
    >
      {isDev && (
        <span className='text-xs text-yellow-600 font-mono'>
          {componentName}
        </span>
      )}
      {renderChildren(pConnect)}
    </div>
  );
}
