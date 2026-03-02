import { cn } from '../../../lib/utils';
import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

export default function DefaultForm({ pConnect }: CustomPConnectProps) {
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const numCols = Number(configProps.NumCols) || 1;

  const gridClass = cn(
    'grid gap-4',
    numCols === 1 && 'grid-cols-1',
    numCols === 2 && 'grid-cols-1 md:grid-cols-2',
    numCols >= 3 && 'grid-cols-1 md:grid-cols-3'
  );

  return (
    <div data-component='DefaultForm' className={gridClass}>
      {renderChildren(pConnect)}
    </div>
  );
}
