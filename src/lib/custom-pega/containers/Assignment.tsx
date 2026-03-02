/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare const PCore: any;

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../../../design-system/ui/button';
import { renderChildren } from '../PConnectRenderer';
import type { CustomPConnectProps } from '../types';

interface ActionButton {
  actionID: string;
  jsAction: string;
  name: string;
  isErrorButton?: boolean;
}

interface ActionButtons {
  main?: ActionButton[];
  secondary?: ActionButton[];
}

function hasButtons(obj: any): obj is ActionButtons {
  return obj && (obj.main?.length > 0 || obj.secondary?.length > 0);
}

/**
 * Try multiple approaches to retrieve action buttons from Pega's data layer.
 *
 * Pega stores action buttons as an **object** `{ main: ActionButton[], secondary: ActionButton[] }`
 * — NOT a flat array. We use `hasButtons()` to validate the result.
 */
function resolveActionButtons(pConn: any, contextName: string, containerItemContext?: string): ActionButtons | null {
  // Approach 0: getCaseInfo().getActions() — officially documented API
  try {
    const actions = pConn.getCaseInfo()?.getActions?.();
    if (hasButtons(actions)) return actions;
  } catch {
    /* ignore */
  }

  // Approach 1: container item context store (e.g. app/primary_1/workarea_1)
  if (containerItemContext && containerItemContext !== contextName) {
    try {
      const fromContainerItem = PCore.getStoreValue('.actionButtons', 'caseInfo', containerItemContext);
      if (hasButtons(fromContainerItem)) return fromContainerItem;
    } catch {
      /* ignore */
    }
  }

  // Approach 2: standard PConnect data object
  const oData = pConn.getDataObject?.('');
  const fromDataObj = oData?.caseInfo?.actionButtons;
  if (hasButtons(fromDataObj)) return fromDataObj;

  // Approach 3: PCore store — read from the current context
  try {
    const fromStore = PCore.getStoreValue('.actionButtons', 'caseInfo', contextName);
    if (hasButtons(fromStore)) return fromStore;
  } catch {
    /* store path may not exist */
  }

  // Approach 4: walk up through ALL ancestor contexts
  try {
    let ctx = contextName;
    while (true) {
      const lastSlash = ctx.lastIndexOf('/');
      if (lastSlash <= 0) break;
      ctx = ctx.substring(0, lastSlash);
      const fromAncestor = PCore.getStoreValue('.actionButtons', 'caseInfo', ctx);
      if (hasButtons(fromAncestor)) return fromAncestor;
    }
  } catch {
    /* ignore */
  }

  return null;
}

interface AssignmentProps extends CustomPConnectProps {
  children?: React.ReactNode;
  containerItemContext?: string;
  parentPConnect?: any;
}

export default function Assignment({ pConnect, parentPConnect, children, containerItemContext }: AssignmentProps) {
  const actionsApi = pConnect.getActionsApi();
  const context = pConnect.getContextName();
  const pageReference = pConnect.getPageReference();

  const [actionButtons, setActionButtons] = useState<ActionButtons | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Resolve action buttons reactively — subscribe to PCore store changes
  // so buttons appear once the assignment data is fully populated.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Try immediately
    const initial = resolveActionButtons(pConnect, context, containerItemContext);
    if (initial) {
      console.log('[CustomPega] Assignment: action buttons found immediately', initial);
      setActionButtons(initial);
      return;
    }

    console.log('[CustomPega] Assignment: no action buttons yet, subscribing to store', { context, containerItemContext });

    const store = PCore.getStore();
    const unsub = store.subscribe(() => {
      const buttons = resolveActionButtons(pConnect, context, containerItemContext);
      if (buttons) {
        console.log('[CustomPega] Assignment: action buttons found', buttons);
        setActionButtons(buttons);
        unsub();
      }
    });

    return () => unsub();
  }, [pConnect, context, containerItemContext]);

  const mainButtons = actionButtons?.main ?? [];
  const secondaryButtons = actionButtons?.secondary ?? [];

  useEffect(() => {
    if (showSnackbar) {
      snackbarTimerRef.current = setTimeout(() => setShowSnackbar(false), 3000);
    }
    return () => {
      if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    };
  }, [showSnackbar]);

  // Register refresh manager for field-change refresh
  useEffect(() => {
    const refreshConditions = (pConnect.getCaseInfo() as any)?.getActionRefreshConditions?.();
    if (!refreshConditions) return;

    PCore.getRefreshManager().deRegisterForRefresh(context);

    const refreshProps = refreshConditions.filter((item: any) => item.event === 'Changes').map((item: any) => [item.field, item.field?.substring(1)]);

    const caseKey = pConnect.getCaseInfo().getKey();
    const refreshOptions = { autoDetectRefresh: true, preserveClientChanges: false };

    refreshProps.forEach((prop: [string, string]) => {
      PCore.getRefreshManager().registerForRefresh(
        'PROP_CHANGE',
        actionsApi.refreshCaseView.bind(actionsApi, caseKey, '', pageReference, {
          ...refreshOptions,
          refreshFor: prop[0]
        }),
        `${pageReference}.${prop[1]}`,
        `${context}/${pageReference}`,
        context
      );
    });

    return () => {
      PCore.getRefreshManager().deRegisterForRefresh(context);
    };
  }, [pConnect, actionsApi, context, pageReference]);

  function showToast(message: string) {
    console.error(`Assignment: ${message}`);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  }

  function handleButtonPress(jsAction: string, buttonType: string) {
    // Use the container item ID (e.g. "app/primary_1/workarea_1")
    // NOT the assignment ID — actionsApi methods require container item IDs
    const containerItemID = containerItemContext ?? '';

    console.log('[CustomPega] Assignment: handleButtonPress', { jsAction, buttonType, containerItemID, context });

    if (buttonType === 'primary') {
      if (jsAction === 'finishAssignment') {
        actionsApi
          .finishAssignment(containerItemID)
          .then(() => {
            console.log('[CustomPega] Assignment: finishAssignment resolved');
          })
          .catch((err: any) => {
            if (!err) {
              showToast('Validation failed. Please check the highlighted fields.');
            } else {
              console.error('Assignment finishAssignment error:', err);
              showToast('Submit failed!');
            }
          });
      }
    } else if (buttonType === 'secondary') {
      switch (jsAction) {
        case 'navigateToStep':
          actionsApi
            .navigateToStep('previous', containerItemID)
            .then(() => {})
            .catch((err: any) => {
              if (!err) {
                showToast('Validation failed. Please check the highlighted fields.');
              } else {
                showToast('Navigation failed!');
              }
            });
          break;

        case 'cancelAssignment': {
          const isInCreateStage = (pConnect.getCaseInfo() as any).isAssignmentInCreateStage?.();
          const isLocalAction =
            (pConnect.getCaseInfo() as any).isLocalAction?.() || pConnect.getValue?.(PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION);

          const cancelPromise =
            isInCreateStage && !isLocalAction ? actionsApi.cancelCreateStageAssignment(containerItemID) : actionsApi.cancelAssignment(containerItemID, false);

          cancelPromise
            .then((data: any) => {
              PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, data);
            })
            .catch((err: any) => {
              console.error('Assignment cancelAssignment error:', err);
              showToast('Cancel failed!');
            });
          break;
        }

        case 'saveAssignment':
          actionsApi
            .saveAssignment(containerItemID)
            .then(() => {
              const caseInfoObj = pConnect.getCaseInfo() as any;
              const caseType = caseInfoObj[PCore.getConstants().CASE_INFO.CASE_TYPE_ID] ?? '';
              const cID = caseInfoObj.getKey?.() ?? '';
              const aID = caseInfoObj.getAssignmentID?.() ?? containerItemID;

              actionsApi.cancelAssignment(aID, false).then(() => {
                PCore.getPubSubUtils().publish('CREATE_STAGE_SAVED', { caseType, caseID: cID });
              });
            })
            .catch((err: any) => {
              if (!err) {
                showToast('Validation failed. Please check the highlighted fields.');
              } else {
                showToast('Save failed');
              }
            });
          break;

        default:
          break;
      }
    }
  }

  return (
    <div data-component='Assignment'>
      <div className='space-y-4'>{children ?? renderChildren(pConnect)}</div>

      {(mainButtons.length > 0 || secondaryButtons.length > 0) && (
        <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
          {mainButtons.map((btn) => (
            <Button key={btn.actionID} onClick={() => handleButtonPress(btn.jsAction, 'primary')}>
              {btn.name}
            </Button>
          ))}
          {secondaryButtons.map((btn) => (
            <Button key={btn.actionID} variant='outline' onClick={() => handleButtonPress(btn.jsAction, 'secondary')}>
              {btn.name}
            </Button>
          ))}
        </div>
      )}

      {showSnackbar && (
        <div
          className='fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm text-white shadow-lg transition-opacity duration-300'
          role='alert'
        >
          <span>{snackbarMessage}</span>
          <button
            type='button'
            aria-label='close'
            className='ml-2 inline-flex items-center rounded p-1 hover:bg-gray-700'
            onClick={() => setShowSnackbar(false)}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
