/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PConnectProxy } from '../types';

declare const PCore: any;

/**
 * Walk up the PConnect parent chain to find a case-data page reference
 * (e.g., 'caseInfo.content') rather than a context name ('app/primary_1').
 * Context names contain '/', page reference paths contain '.'.
 */
function findCasePageReference(pConnect: any): string {
  let current = pConnect;
  const seen = new Set<string>();
  while (current) {
    const ref: string = current.getPageReference?.() ?? '';
    const ctx: string = current.getContextName?.() ?? '';
    if (ref && ref.includes('.') && !ref.includes('/')) {
      return ref;
    }
    if (seen.has(ctx)) break;
    seen.add(ctx);
    try {
      current = current.getParentPConnect?.();
    } catch {
      break;
    }
  }
  return 'caseInfo.content';
}

/**
 * Mirrors the SDK's `processRootViewDetails` from
 * `@pega/react-sdk-overrides/lib/infra/Containers/SimpleView/helper.ts`.
 *
 * Resolves @P annotations for view context and view name.  The context
 * resolution via `getStoreValue` works reliably; however, the view name
 * lookup always fails because the SDK's Redux bridge (`react_pconnect`)
 * that caches resolved @P values in the store is not present.
 *
 * When the name cannot be resolved, `getPConnectOfActiveContainerItem`
 * handles it via a parent-context metadata fallback.
 */
const processRootViewDetails = (rootView: any, containerItem: any, options: { parentGetPConnect: () => any }) => {
  const {
    config: { context: viewContext, name: viewName }
  } = rootView;
  const { context: containerContext } = containerItem;
  const { parentGetPConnect } = options;
  let resolvedViewName = viewName;
  let resolvedViewContext = viewContext;

  const isAnnotedViewName = PCore.getAnnotationUtils().isProperty(viewName);
  const isAnnotedViewContext = PCore.getAnnotationUtils().isProperty(viewContext);

  // resolving annoted view context (SDK lines 18-26)
  if (isAnnotedViewContext) {
    const viewContextProperty = PCore.getAnnotationUtils().getPropertyName(viewContext);
    resolvedViewContext = PCore.getStoreValue(
      `.${viewContextProperty}`,
      viewContextProperty.startsWith('.') ? parentGetPConnect().getPageReference() : '',
      containerContext
    );
  }

  if (!resolvedViewContext) {
    resolvedViewContext = parentGetPConnect().getPageReference();
  }

  // resolving annoted view name (SDK lines 32-36)
  if (isAnnotedViewName) {
    const viewNameProperty = PCore.getAnnotationUtils().getPropertyName(viewName);
    resolvedViewName = PCore.getStoreValue(`.${viewNameProperty}`, resolvedViewContext, containerContext);
    // Without the SDK's react_pconnect bridge, the store lookup typically
    // returns undefined.  The caller handles this via metadata fallback.
  }

  return {
    viewName: resolvedViewName,
    viewContext: resolvedViewContext
  };
};

/**
 * Mirrors the SDK's `getPConnectOfActiveContainerItem` from
 * `@pega/react-sdk-overrides/lib/infra/Containers/SimpleView/helper.ts`.
 *
 * When the @P view name cannot be resolved via the store, `createPConnect`
 * produces a 'reference' component whose `getReferencedView()` returns null
 * (metadata is only registered under the parent case context, not the
 * workarea context).  In that case we create a temp PConnect with the parent
 * context to retrieve the metadata, then use `createComponent` to build
 * the actual View — the same approach that works in Reference.tsx.
 */
export const getPConnectOfActiveContainerItem = (
  containerInfo: any,
  options: { parentGetPConnect: () => any; containerName: string; label: string }
): PConnectProxy | null => {
  const { accessedOrder, items } = containerInfo;
  const { parentGetPConnect, containerName, label } = options;

  if (accessedOrder && items) {
    const activeContainerItemKey = accessedOrder[accessedOrder.length - 1];

    if (
      items[activeContainerItemKey] &&
      items[activeContainerItemKey].view &&
      Object.keys(items[activeContainerItemKey].view).length > 0
    ) {
      const activeContainerItem = items[activeContainerItemKey];
      const target = activeContainerItemKey.substring(0, activeContainerItemKey.lastIndexOf('_'));

      const { view: rootView, context } = activeContainerItem;
      const { viewName, viewContext } = processRootViewDetails(rootView, activeContainerItem, { parentGetPConnect });

      // No raw name in metadata — nothing to resolve
      if (!viewName && !rootView.config?.name) return null;

      const parentPageRef = parentGetPConnect().getPageReference();
      const effectivePageRef = viewContext && !viewContext.includes('/')
        ? viewContext
        : parentPageRef;

      const config = {
        meta: rootView,
        options: {
          context,
          pageReference: effectivePageRef,
          containerName,
          containerItemID: activeContainerItemKey,
          parentPageReference: parentPageRef,
          hasForm: true,
          target
        }
      };

      try {
        const result = PCore.createPConnect(config);
        const pConnectResult = (result?.getPConnect?.() as PConnectProxy) ?? null;
        const componentName = (pConnectResult as any)?.getComponentName?.() ?? 'null';

        // --- Parent-context metadata fallback ---
        // When createPConnect produces a 'reference' with no retrievable
        // metadata (workarea context), resolve via the parent context where
        // the view definition IS registered.
        if (componentName === 'reference') {
          const refView = (pConnectResult as any)?.getReferencedView?.();
          if (!refView) {
            const parentContext = parentGetPConnect().getContextName();
            const casePageRef = findCasePageReference(parentGetPConnect());

            const tempResult = PCore.createPConnect({
              meta: rootView,
              options: { context: parentContext, pageReference: casePageRef }
            });
            const tempPC = tempResult?.getPConnect?.();
            const metadata = tempPC?.getReferencedView?.();

            if (metadata) {
              const viewComp = (parentGetPConnect() as any).createComponent(metadata, null, null, {
                pageReference: casePageRef
              });
              const resolvedPC = viewComp?.props?.getPConnect?.() as PConnectProxy | undefined;
              if (resolvedPC && (resolvedPC as any).getComponentName?.() !== 'reference') {
                return resolvedPC;
              }
            }
          }
        }

        return pConnectResult;
      } catch (err) {
        console.warn(`[CustomPega] ${label}: createPConnect failed:`, err);
        return null;
      }
    }
  }
  return null;
};
