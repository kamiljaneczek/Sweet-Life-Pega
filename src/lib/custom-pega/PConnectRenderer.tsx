import type { PConnectProxy } from './types';
import { getCustomComponent } from './component-map';

/** Unwrap c11nEnv wrapper → raw PConnect. Handles both wrapped and unwrapped inputs. */
function unwrapPConnect(child: any): PConnectProxy {
  if (typeof child?.getPConnect === 'function' && !child.getComponentName) {
    return child.getPConnect() as PConnectProxy;
  }
  return child as PConnectProxy;
}

interface PConnectRendererProps {
  pConnect: PConnectProxy;
}

export default function PConnectRenderer({ pConnect }: PConnectRendererProps) {
  const pc = unwrapPConnect(pConnect);
  const componentName = pc.getComponentName();
  const Component = getCustomComponent(componentName);
  return <Component pConnect={pc} />;
}

/** Maps pConnect.getChildren() to <PConnectRenderer> elements. */
export function renderChildren(pConnect: PConnectProxy) {
  const children = pConnect.getChildren();
  if (!children || children.length === 0) return null;

  return children.map((child, index) => {
    const pc = unwrapPConnect(child);
    return <PConnectRenderer key={`${pc.getComponentName()}-${index}`} pConnect={pc} />;
  });
}
