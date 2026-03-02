/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from 'react';
import PConnectRenderer from '../PConnectRenderer';
import type { CustomPConnectProps, PConnectProxy } from '../types';
import Assignment from './Assignment';
import { getPConnectOfActiveContainerItem } from './container-helpers';

declare const PCore: any;

/**
 * FlowContainer resolves its content from PCore container routing data — not
 * from `pConnect.getChildren()` (which is empty for container components).
 *
 * Container components get their children from the routing infrastructure that
 * the SDK initialises via ViewContainer / FlowContainer `useEffect` calls.
 * This mirrors the SDK's `withSimpleViewContainerRenderer` HOC and the
 * `getPConnectOfActiveContainerItem` helper in SimpleView/helper.js.
 *
 * A store subscription ensures re-renders on step transitions (new container
 * items added to `accessedOrder`).
 */
export default function FlowContainer({ pConnect }: CustomPConnectProps) {
  const pc = pConnect as any;
  const contextName: string = pc.getContextName();
  const containerName: string = pc.getContainerName();
  const containerPath = `${contextName}/${containerName}`;

  // ---------------------------------------------------------------------------
  // Self-initialization — replicate what SDK's ViewContainer + FlowContainer
  // do in their useEffects: initializeContainers + addContainerItem.
  // Without this, nested containers (e.g. app/primary_1/workarea) never get
  // routing data when renderUI: false (no SDK React tree).
  // ---------------------------------------------------------------------------
  const initRef = useRef(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    console.log('[CustomPega] FlowContainer: context debug', { contextName, containerName, containerPath });

    (async () => {
      try {
        // Step A — initialize container (mirrors SimpleView/helper.js → useContainerInitializer)
        if (!PCore.getContainerUtils().isContainerInitialized(contextName, containerName)) {
          await pc.getContainerManager().initializeContainers({
            type: 'single',
            name: containerName
          });
          console.log(`[CustomPega] FlowContainer: initialized ${containerPath}`);
        }

        // Step B — add container item (mirrors FlowContainer/helpers.js → addContainerItem)
        if (!PCore.getContainerUtils().hasContainerItems(containerPath)) {
          const caseViewMode = pc.getValue('context_data.caseViewMode');
          if (caseViewMode !== 'review') {
            const target = contextName.substring(0, contextName.lastIndexOf('_'));
            const activeItemID = PCore.getContainerUtils().getActiveContainerItemName(target);
            const containerItemData = PCore.getContainerUtils().getContainerItemData(target, activeItemID);
            const key = containerItemData?.key;
            const flowName = containerItemData?.flowName;

            await pc.getContainerManager().addContainerItem({
              semanticURL: '',
              key,
              flowName,
              caseViewMode: 'perform',
              resourceType: 'ASSIGNMENT',
              data: pc.getDataObject(contextName)
            });
            console.log(`[CustomPega] FlowContainer: addContainerItem complete`, containerPath);
          }
        }
      } catch (err) {
        console.error('[CustomPega] FlowContainer: initialization failed:', err);
        setInitError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [contextName, containerName, containerPath, pc]);

  // ---------------------------------------------------------------------------
  // Subscribe to PCore Redux store — re-render when the active container item
  // changes (step transitions add a new key to accessedOrder).
  // ---------------------------------------------------------------------------
  const [routingInfo, setRoutingInfo] = useState<any>(() => {
    try {
      return PCore.getContainerUtils().getContainerData(containerPath);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const store = PCore.getStore();
    let lastFingerprint = '';

    const handleStoreChange = () => {
      try {
        const data = PCore.getContainerUtils().getContainerData(containerPath);
        if (!data) return;

        const order = data.accessedOrder ?? [];
        const activeKey = order[order.length - 1] ?? '';
        const activeItem = activeKey ? data.items?.[activeKey] : null;
        const activeView = activeItem?.view;
        const hasView = !!(activeView && Object.keys(activeView).length);
        const viewName = activeView?.config?.name ?? '';
        const viewContext = activeView?.config?.context ?? '';
        const fingerprint = `${order.length}:${activeKey}|${hasView}|${viewName}|${viewContext}`;

        console.log('[CustomPega] FlowContainer sub:', containerPath, {
          accessedOrder: data.accessedOrder,
          itemKeys: Object.keys(data.items ?? {}),
          fingerprint,
          lastFingerprint,
          changed: fingerprint !== lastFingerprint
        });

        if (fingerprint !== lastFingerprint) {
          lastFingerprint = fingerprint;
          setRoutingInfo({ ...data });
        }
      } catch {
        /* container may not be initialised yet */
      }
    };

    handleStoreChange();
    const unsubStore = store.subscribe(handleStoreChange);

    // Backup: force re-read when Pega finishes processing an assignment.
    // This catches edge cases where the store fingerprint doesn't change
    // (e.g. same view name across steps but different config).
    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        console.log('[CustomPega] FlowContainer: END_OF_ASSIGNMENT_PROCESSING fired, forcing re-read');
        try {
          const data = PCore.getContainerUtils().getContainerData(containerPath);
          if (data) {
            lastFingerprint = ''; // reset so next store change is always picked up
            setRoutingInfo({ ...data });
          }
        } catch {
          /* container may not exist yet */
        }
      },
      'END_OF_ASSIGNMENT_PROCESSING'
    );

    return () => {
      unsubStore();
      PCore.getPubSubUtils().unsubscribe('assignmentFinished', 'END_OF_ASSIGNMENT_PROCESSING');
    };
  }, [containerPath]);

  // ---------------------------------------------------------------------------
  // Handle container becoming empty during step transitions — re-add the
  // container item. Mirrors SDK FlowContainer useEffect([isInitialized, hasItems]).
  // ---------------------------------------------------------------------------
  const hasItems = !!routingInfo?.accessedOrder?.length;

  useEffect(() => {
    if (!initRef.current || hasItems) return;

    console.log('[CustomPega] FlowContainer: container empty, re-adding item');
    (async () => {
      try {
        const caseViewMode = pc.getValue('context_data.caseViewMode');
        if (caseViewMode === 'review') return;

        const target = contextName.substring(0, contextName.lastIndexOf('_'));
        const activeItemID = PCore.getContainerUtils().getActiveContainerItemName(target);
        const containerItemData = PCore.getContainerUtils().getContainerItemData(target, activeItemID);
        const key = containerItemData?.key;
        const flowName = containerItemData?.flowName;

        await pc.getContainerManager().addContainerItem({
          semanticURL: '',
          key,
          flowName,
          caseViewMode: 'perform',
          resourceType: 'ASSIGNMENT',
          data: pc.getDataObject(contextName)
        });
        console.log('[CustomPega] FlowContainer: re-added container item');
      } catch (err) {
        console.error('[CustomPega] FlowContainer: re-add container item failed:', err);
      }
    })();
  }, [hasItems, contextName, pc]);

  // ---------------------------------------------------------------------------
  // Resolve the active container item into a child PConnect.
  // Mirrors SDK: SimpleView/helper.js → getPConnectOfActiveContainerItem
  // ---------------------------------------------------------------------------
  const childPConnect = useMemo((): PConnectProxy | null => {
    if (!routingInfo?.accessedOrder?.length || !routingInfo?.items) return null;

    return getPConnectOfActiveContainerItem(routingInfo, {
      parentGetPConnect: () => pc,
      containerName,
      label: 'FlowContainer'
    });
  }, [routingInfo, containerName, pc]);

  // ---------------------------------------------------------------------------
  // Bind child PConnect to Redux state — mirrors SDK FlowContainer initComponent()
  // line 92: `ourPConn.isBoundToState()`.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!childPConnect) return;
    try {
      (childPConnect as any).isBoundToState();
    } catch {
      /* ignore — not all PConnect instances support this */
    }
  }, [childPConnect]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const configProps = pConnect.resolveConfigProps(pConnect.getConfigProps());
  const caseMessages = configProps.caseMessages as string | undefined;

  return (
    <div data-component='FlowContainer'>
      {caseMessages && (
        <div className='rounded-md border border-blue-200 bg-blue-50 px-4 py-3 mb-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'>
          {caseMessages}
        </div>
      )}
      {initError && (
        <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 mb-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
          Container initialization failed: {initError}
        </div>
      )}
      {childPConnect ? (
        <Assignment
          pConnect={childPConnect}
          parentPConnect={pc}
          containerItemContext={routingInfo?.accessedOrder?.[routingInfo.accessedOrder.length - 1]}
        >
          <PConnectRenderer pConnect={childPConnect} />
        </Assignment>
      ) : null}
    </div>
  );
}
