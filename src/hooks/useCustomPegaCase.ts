/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CasePhase, PConnectProxy } from '../lib/custom-pega/types';

declare const PCore: any;

interface UseCustomPegaCaseResult {
  phase: CasePhase;
  caseId: string;
  rootPConnect: PConnectProxy | null;
  error: string | null;
  isPegaReady: boolean;
}

const SUBSCRIBER_PREFIX = 'CustomPega_';

/**
 * Custom case lifecycle hook that:
 * 1. Waits for PCore readiness (via useConstellation)
 * 2. Creates a case via PCore.getMashupApi().createCase()
 * 3. Extracts the root PConnect from PCore container utilities
 * 4. Manages PubSub subscriptions for case completion/cancellation
 *
 * Does NOT call startMashup() — operates alongside the existing mashup path safely.
 */
export default function useCustomPegaCase(isPegaReady: boolean): UseCustomPegaCaseResult {
  const [phase, setPhase] = useState<CasePhase>('idle');
  const [caseId, setCaseId] = useState('');
  const [rootPConnect, setRootPConnect] = useState<PConnectProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const caseInitiated = useRef(false);
  const storeUnsubRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const extractRootPConnect = useCallback((): PConnectProxy | null => {
    try {
      const containerUtils = PCore.getContainerUtils();

      // Get routing info — same structure the SDK's ViewContainer receives as props
      const routingInfo = containerUtils.getContainerData('app/primary');

      if (!routingInfo?.items) {
        console.log('[CustomPega] extractRootPConnect: no routingInfo yet', routingInfo);
        return null;
      }

      // Find the active container item. Strategy:
      // 1. getActiveContainerItemName (PCore utility)
      // 2. Last non-null entry in accessedOrder
      // 3. First item in items map that has a view (fallback)
      let activeKey: string | null =
        containerUtils.getActiveContainerItemName?.('app/primary') || null;

      if (!activeKey || !routingInfo.items[activeKey]?.view) {
        // Try accessedOrder
        const order = routingInfo.accessedOrder ?? [];
        for (let i = order.length - 1; i >= 0; i--) {
          if (order[i] && routingInfo.items[order[i]]?.view) {
            activeKey = order[i];
            break;
          }
        }
      }

      if (!activeKey || !routingInfo.items[activeKey]?.view) {
        // Fallback: scan items for any entry with a view
        for (const key of Object.keys(routingInfo.items)) {
          const item = routingInfo.items[key];
          if (item?.view && Object.keys(item.view).length) {
            activeKey = key;
            break;
          }
        }
      }

      if (!activeKey) {
        console.log('[CustomPega] extractRootPConnect: no active item found',
          'accessedOrder:', routingInfo.accessedOrder,
          'itemKeys:', Object.keys(routingInfo.items));
        return null;
      }

      const activeItem = routingInfo.items[activeKey];

      if (!activeItem?.view || !Object.keys(activeItem.view).length) {
        console.log('[CustomPega] extractRootPConnect: no view in activeItem', activeKey, activeItem);
        return null;
      }

      // Create PConnect from routing info — mirrors SDK's SimpleView/helper.js
      // We derive pageReference and containerName from the active item and container
      // utilities rather than from the cached root PConnect, keeping us independent
      // of the SDK's React rendering tree.
      //
      // activeItem.context should be the case context (e.g. "app/primary_1"), but
      // in mashup/renderUI:false mode it can be null.  Fall back to the item key
      // which PCore uses as the context name.
      const itemContext: string = activeItem.context ?? activeKey;
      const underscoreIdx = activeKey.lastIndexOf('_');
      const config = {
        meta: activeItem.view,
        options: {
          context: itemContext,
          pageReference: activeItem.view?.config?.context || '',
          containerName: 'primary',
          containerItemName: activeKey,
          hasForm: true,
          target: underscoreIdx > 0 ? activeKey.substring(0, underscoreIdx) : activeKey
        }
      };

      console.log('[CustomPega] extractRootPConnect: creating PConnect', { context: itemContext, activeKey, itemContextRaw: activeItem.context });

      const pConnectObj = PCore.createPConnect(config);
      if (pConnectObj?.getPConnect) {
        const pc = pConnectObj.getPConnect();
        console.log('[CustomPega] extractRootPConnect: success, component:', pc.getComponentName());
        return pc as PConnectProxy;
      }

      console.log('[CustomPega] extractRootPConnect: createPConnect returned no getPConnect');
      return null;
    } catch (err) {
      console.warn('[CustomPega] Failed to extract root PConnect:', err);
      return null;
    }
  }, []);

  /**
   * Subscribe to PCore store changes and try to extract PConnect
   * once the assignment is rendered.
   */
  const waitForPConnect = useCallback(() => {
    // Clean up any existing subscription and interval
    if (storeUnsubRef.current) {
      storeUnsubRef.current();
      storeUnsubRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Poll a few times first — the PConnect may already be available
    let attempts = 0;
    const maxAttempts = 20;
    console.log('[CustomPega] waitForPConnect: starting poll');
    const interval = setInterval(() => {
      attempts += 1;
      const pc = extractRootPConnect();
      if (pc) {
        console.log('[CustomPega] waitForPConnect: found PConnect on attempt', attempts);
        clearInterval(interval);
        setRootPConnect(pc);
        setPhase('active');
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('[CustomPega] Could not extract root PConnect after polling. Subscribing to store changes.');

        // Fall back to store subscription
        const store = PCore.getStore();
        const unsub = store.subscribe(() => {
          const pConn = extractRootPConnect();
          if (pConn) {
            unsub();
            storeUnsubRef.current = null;
            setRootPConnect(pConn);
            setPhase('active');
          }
        });
        storeUnsubRef.current = unsub;
      }
    }, 150);
    intervalRef.current = interval;
  }, [extractRootPConnect]);

  useEffect(() => {
    if (!isPegaReady || caseInitiated.current) return;
    caseInitiated.current = true;
    setPhase('creating');

    getSdkConfig().then((sdkConfig: any) => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[1].pyWorkTypeImplementationClassName;
      }

      // Initialize app/primary container before createCase().
      // The cached root PConnect has context='root', but createCase() creates items
      // under 'app/primary'. We must create a PConnect with context='app' to get
      // the correct container manager.
      const appContext = PCore.getConstants().APP.APP ?? 'app';
      if (!PCore.getContainerUtils().isContainerInitialized(appContext, 'primary')) {
        const appPCObj = PCore.createPConnect({
          meta: { type: 'ViewContainer', config: { name: 'primary' } },
          options: { context: appContext }
        });
        if (appPCObj?.getPConnect) {
          appPCObj.getPConnect().getContainerManager().initializeContainers({
            type: 'single',
            name: 'primary'
          });
          console.log(`[CustomPega] Initialized container ${appContext}/primary`);
        }
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };

      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any)
        .then(() => {
          // Extract short case ID
          const containerUtils = PCore.getContainerUtils();
          const primaryName = containerUtils.getActiveContainerItemName('app/primary') || 'app/primary_1';
          const workareaName = containerUtils.getActiveContainerItemName(`${primaryName}/workarea`) || `${primaryName}/workarea_1`;
          const shortId = PCore.getStoreValue('.pyID', 'caseInfo.content', workareaName);

          if (shortId) {
            setCaseId(shortId);
          }

          // Try to get the root PConnect
          waitForPConnect();
        })
        .catch((err: any) => {
          console.error('[CustomPega] createCase failed:', err);
          setError(err?.message ?? 'Failed to create case');
          setPhase('error');
        });

      // PubSub: case completion / step transition
      const constants = PCore.getConstants();
      PCore.getPubSubUtils().subscribe(
        constants.PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
        (eventPayload: any) => {
          if (eventPayload?.caseID) {
            const shortCaseId = eventPayload.caseID.split(' ')[1] || eventPayload.caseID;
            setCaseId(shortCaseId);
          }

          // Check for definitive completion signal
          const status = eventPayload?.caseInfo?.status ?? eventPayload?.status;
          if (status === 'Resolved-Completed' || status === 'Resolved-Rejected') {
            setPhase('completed');
            return;
          }

          // Not definitively completed — use waitForPConnect to get next assignment.
          // If polling exhausts without finding a PConnect, the store subscription
          // will catch it; if the case truly finished, PConnect won't appear and
          // the caller keeps the current phase until the next event.
          waitForPConnect();
        },
        `${SUBSCRIBER_PREFIX}CaseComplete`
      );

      // PubSub: case cancelled
      PCore.getPubSubUtils().subscribe(
        constants.PUB_SUB_EVENTS.EVENT_CANCEL,
        () => {
          setPhase('idle');
          setRootPConnect(null);
          setCaseId('');
        },
        `${SUBSCRIBER_PREFIX}CaseCancel`
      );
    });

    return () => {
      // Clean up subscriptions
      const constants = PCore.getConstants();
      PCore.getPubSubUtils().unsubscribe(
        constants.PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
        `${SUBSCRIBER_PREFIX}CaseComplete`
      );
      PCore.getPubSubUtils().unsubscribe(
        constants.PUB_SUB_EVENTS.EVENT_CANCEL,
        `${SUBSCRIBER_PREFIX}CaseCancel`
      );

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (storeUnsubRef.current) {
        storeUnsubRef.current();
        storeUnsubRef.current = null;
      }
    };
    // waitForPConnect and extractRootPConnect are stable (useCallback with [] deps)
    // and are intentionally excluded to avoid re-subscription churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPegaReady]);

  return { phase, caseId, rootPConnect, error, isPegaReady };
}
