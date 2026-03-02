/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';

import type { CustomPConnectProps, PConnectProxy } from '../types';
import PConnectRenderer, { renderChildren } from '../PConnectRenderer';
import { getPConnectOfActiveContainerItem } from './container-helpers';

declare const PCore: any;

/**
 * ViewContainer resolves children from container routing data when it has a
 * container name (same logic as FlowContainer). Falls back to rendering
 * metadata children for non-container contexts.
 */
export default function ViewContainer({ pConnect }: CustomPConnectProps) {
  const pc = pConnect as any;
  const contextName: string = pc.getContextName?.() ?? '';
  const containerName: string = pc.getContainerName?.() ?? '';
  const containerPath = containerName ? `${contextName}/${containerName}` : '';

  // ---------------------------------------------------------------------------
  // Store subscription for container routing updates
  // ---------------------------------------------------------------------------
  const [routingInfo, setRoutingInfo] = useState<any>(() => {
    if (!containerPath) return null;
    try {
      return PCore.getContainerUtils().getContainerData(containerPath);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!containerPath) return;

    const store = PCore.getStore();
    let lastFingerprint = '';

    const handleStoreChange = () => {
      try {
        const data = PCore.getContainerUtils().getContainerData(containerPath);
        if (!data) return;

        const order = data.accessedOrder ?? [];
        const activeKey = order[order.length - 1] ?? '';
        const activeView = activeKey ? data.items?.[activeKey]?.view : null;
        const hasView = !!(activeView && Object.keys(activeView).length);
        const fingerprint = `${activeKey}|${hasView}`;

        console.log('[CustomPega] ViewContainer sub:', containerPath, {
          accessedOrder: data.accessedOrder,
          itemKeys: Object.keys(data.items ?? {}),
          fingerprint,
          lastFingerprint,
          changed: fingerprint !== lastFingerprint,
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
    return store.subscribe(handleStoreChange);
  }, [containerPath]);

  // ---------------------------------------------------------------------------
  // Resolve active container item → child PConnect
  // ---------------------------------------------------------------------------
  const childPConnect = useMemo((): PConnectProxy | null => {
    if (!containerPath || !routingInfo?.accessedOrder?.length || !routingInfo?.items) return null;

    return getPConnectOfActiveContainerItem(routingInfo, {
      parentGetPConnect: () => pc,
      containerName,
      label: 'ViewContainer',
    });
  }, [routingInfo, containerPath, containerName, pc]);

  // ---------------------------------------------------------------------------
  // Render: prefer routing-resolved child, fall back to metadata children
  // ---------------------------------------------------------------------------
  if (childPConnect) {
    return <PConnectRenderer pConnect={childPConnect} />;
  }

  return <>{renderChildren(pConnect)}</>;
}
