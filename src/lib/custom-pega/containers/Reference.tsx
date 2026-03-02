/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CustomPConnectProps } from '../types';
import PConnectRenderer from '../PConnectRenderer';

/**
 * Resolves a Pega "reference" component into its referenced view.
 *
 * Uses pConnect.createComponent() (like the SDK's Reference) to properly
 * propagate container context. We extract the PConnect from the result's
 * props instead of rendering the SDK element itself.
 */
export default function Reference({ pConnect }: CustomPConnectProps) {
  const pc = pConnect as any;

  console.log('[CustomPega] Reference: mount', {
    componentName: pc.getComponentName?.(),
    contextName: pc.getContextName?.(),
    pageReference: pc.getPageReference?.(),
  });

  const configProps = pc.getConfigProps?.() ?? {};
  const resolvedConfig = pc.resolveConfigProps?.(configProps) ?? configProps;
  const visibility = resolvedConfig.visibility;
  if (visibility === false) {
    console.log('[CustomPega] Reference: hidden by visibility');
    return null;
  }

  const viewMetadata = pc.getReferencedView?.();
  console.log('[CustomPega] Reference: getReferencedView', {
    hasMetadata: !!viewMetadata,
    metaType: viewMetadata?.type,
    metaName: viewMetadata?.config?.name,
    metaKeys: viewMetadata ? Object.keys(viewMetadata) : null,
  });
  if (!viewMetadata) return null;

  // Merge reference config into view config (mirrors SDK Reference component)
  const referenceConfig = { ...pc.getComponentConfig?.() };
  delete referenceConfig?.name;
  delete referenceConfig?.type;
  delete referenceConfig?.visibility;

  const viewObject = {
    ...viewMetadata,
    config: {
      ...viewMetadata.config,
      ...referenceConfig
    }
  };

  const context = resolvedConfig.context ?? pc.getContextName?.() ?? '';

  try {
    // Use createComponent (like the SDK) — it properly propagates container context.
    // We extract the PConnect from the result instead of rendering the SDK element.
    const pageRef = context && context.startsWith('@CLASS') ? '' : context;
    console.log('[CustomPega] Reference: createComponent', {
      viewObjectType: viewObject.type,
      viewObjectName: viewObject.config?.name,
      pageReference: pageRef,
      context,
    });

    const viewComponent: any = pc.createComponent(viewObject, null, null, {
      pageReference: pageRef
    });

    console.log('[CustomPega] Reference: createComponent result', {
      hasViewComponent: !!viewComponent,
      hasProps: !!viewComponent?.props,
      hasGetPConnect: typeof viewComponent?.props?.getPConnect,
      componentType: viewComponent?.type?.name ?? viewComponent?.type ?? 'unknown',
    });

    const childPConnect = viewComponent?.props?.getPConnect?.();
    if (childPConnect) {
      const childComponentName = childPConnect.getComponentName?.() ?? 'unknown';
      console.log('[CustomPega] Reference: resolved child', {
        childComponentName,
        childContext: childPConnect.getContextName?.(),
      });
      childPConnect.setInheritedConfig?.({
        ...referenceConfig,
      });
      return <PConnectRenderer pConnect={childPConnect} />;
    }

    console.log('[CustomPega] Reference: no childPConnect — returning null');
  } catch (err) {
    console.warn('[CustomPega] Reference: failed to resolve referenced view:', err);
  }

  return null;
}
