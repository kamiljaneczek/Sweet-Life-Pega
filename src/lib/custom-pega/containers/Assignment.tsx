/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare const PCore: any;

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../../../design-system/ui/button';
import type { CustomPConnectProps } from '../types';
import { renderChildren } from '../PConnectRenderer';

interface ActionButton {
  actionID: string;
  jsAction: string;
  name: string;
  type?: string;
}

export default function Assignment({ pConnect }: CustomPConnectProps) {
  const actionsApi = pConnect.getActionsApi();
  const oData: any = pConnect.getDataObject('');
  const caseInfo = oData?.caseInfo;
  const actionButtons: ActionButton[] = caseInfo?.actionButtons ?? [];

  const mainButtons = actionButtons.filter((b) => !b.type || b.type === 'primary');
  const secondaryButtons = actionButtons.filter((b) => b.type === 'secondary');

  const context = pConnect.getContextName();
  const pageReference = pConnect.getPageReference();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const refreshProps = refreshConditions
      .filter((item: any) => item.event === 'Changes')
      .map((item: any) => [item.field, item.field?.substring(1)]);

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

  function getItemKey(): string {
    const assignmentId = caseInfo?.assignments?.[0]?.ID;
    if (assignmentId) return assignmentId;

    // Fallback: check first child
    try {
      const children = pConnect.getChildren();
      if (children.length > 0) {
        const workData = children[0].getDataObject?.('');
        if (workData?.caseInfo?.assignments?.[0]?.ID) {
          return workData.caseInfo.assignments[0].ID;
        }
      }
    } catch { /* ignore */ }

    console.warn('[CustomPega] Could not determine itemKey for Assignment');
    return '';
  }

  function handleButtonPress(jsAction: string, buttonType: string) {
    const itemKey = getItemKey();

    if (buttonType === 'primary') {
      if (jsAction === 'finishAssignment') {
        actionsApi
          .finishAssignment(itemKey)
          .then(() => {})
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
            .navigateToStep('previous', itemKey)
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
          const isLocalAction = (pConnect.getCaseInfo() as any).isLocalAction?.() ||
            pConnect.getValue?.(PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION);

          const cancelPromise = isInCreateStage && !isLocalAction
            ? actionsApi.cancelCreateStageAssignment(itemKey)
            : actionsApi.cancelAssignment(itemKey, false);

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
            .saveAssignment(itemKey)
            .then(() => {
              const caseInfoObj = pConnect.getCaseInfo() as any;
              const caseType = caseInfoObj[PCore.getConstants().CASE_INFO.CASE_TYPE_ID] ?? '';
              const cID = caseInfoObj.getKey?.() ?? '';
              const aID = caseInfoObj.getAssignmentID?.() ?? itemKey;

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
      <div className='space-y-4'>
        {renderChildren(pConnect)}
      </div>

      {actionButtons.length > 0 && (
        <div className='flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
          {mainButtons.map((btn) => (
            <Button
              key={btn.actionID}
              onClick={() => handleButtonPress(btn.jsAction, 'primary')}
            >
              {btn.name}
            </Button>
          ))}
          {secondaryButtons.map((btn) => (
            <Button
              key={btn.actionID}
              variant='outline'
              onClick={() => handleButtonPress(btn.jsAction, 'secondary')}
            >
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
