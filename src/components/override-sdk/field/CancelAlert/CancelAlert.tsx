import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../design-system/ui/button';
import './CancelAlert.css';

interface CancelAlertProps extends PConnFieldProps {
  // If any, enter additional props that only exist on CancelAlert here
  heading: string;
  content: string;
  itemKey: string;
  hideDelete: boolean;
  isDataObject: boolean;
  skipReleaseLockRequest: any;
  dismiss: Function;
}

export default function CancelAlert(props: CancelAlertProps) {
  const { heading, content, getPConnect, itemKey: containerItemID, hideDelete, isDataObject, skipReleaseLockRequest, dismiss } = props;
  const actionsAPI = getPConnect().getActionsApi();
  const containerManagerAPI = getPConnect().getContainerManager();
  const isLocalAction = getPConnect().getValue(PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION);
  const isBulkAction = (getPConnect() as any)?.options?.isBulkAction;
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const broadCastUtils: any = PCore.getCoexistenceManager().getBroadcastUtils();
  const isReverseCoexistence = broadCastUtils.isReverseCoexistenceCaseLoaded();
  const localeCategory = 'ModalContainer';
  const btnIds = {
    SAVE_AND_CLOSE: 'saveAndClose',
    CONTINUE_WORKING: 'continueWorking',
    DELETE: 'delete'
  };

  const [buttonsState, setButtonsState] = useState({
    [btnIds.SAVE_AND_CLOSE]: false,
    [btnIds.DELETE]: false
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showSnackbar) {
      snackbarTimer.current = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
    return () => {
      if (snackbarTimer.current) {
        clearTimeout(snackbarTimer.current);
      }
    };
  }, [showSnackbar]);

  function disableButton(id) {
    setButtonsState((prevState) => ({
      ...prevState,
      [id]: true
    }));
  }

  function enableButton(id) {
    setButtonsState((prevState) => ({
      ...prevState,
      [id]: false
    }));
  }

  function cancelHandler() {
    if (isReverseCoexistence) {
      dismiss(true);
      // @ts-expect-error - An argument for 'payload' was not provided.
      PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.REVERSE_COEXISTENCE_EVENTS.HANDLE_DISCARD);
    } else if (!isDataObject && !isLocalAction && !isBulkAction) {
      disableButton(btnIds.DELETE);
      actionsAPI
        .deleteCaseInCreateStage(containerItemID, hideDelete)
        .then(() => {
          // @ts-expect-error - An argument for 'payload' was not provided.
          PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL);
        })
        .catch(() => {
          setSnackbarMessage(localizedVal('Delete failed.', localeCategory));
          setShowSnackbar(true);
        })
        .finally(() => {
          enableButton(btnIds.DELETE);
          dismiss(true);
        });
    } else if (isLocalAction) {
      dismiss(true);
      actionsAPI.cancelAssignment(containerItemID, false);
    } else if (isBulkAction) {
      dismiss(true);
      actionsAPI.cancelBulkAction(containerItemID);
    } else {
      dismiss(true);
      containerManagerAPI.removeContainerItem({ containerItemID, skipReleaseLockRequest });
    }
  }

  function handleSnackbarClose() {
    setShowSnackbar(false);
  }

  const leftButton = (
    <Button
      variant='secondary'
      onClick={() => {
        dismiss();
        if (isReverseCoexistence) {
          broadCastUtils.setCallBackFunction(null);
          broadCastUtils.setIsDirtyDialogActive(false);
        }
      }}
    >
      {localizedVal('Go back', localeCategory)}
    </Button>
  );

  const rightButton = (
    <Button variant='default' disabled={buttonsState[btnIds.DELETE]} onClick={cancelHandler}>
      {localizedVal('Discard', localeCategory)}
    </Button>
  );

  return (
    <>
      <div className='cancel-alert-background'>
        <div className='cancel-alert-top'>
          <h3>{localizedVal(heading, localeCategory)}</h3>
          <div>
            <p>{localizedVal(content, localeCategory)}</p>
          </div>
          <div className='action-controls'>
            <div className='flex items-center justify-between gap-4'>
              <div>{leftButton}</div>
              <div>{rightButton}</div>
            </div>
          </div>
        </div>
      </div>
      {showSnackbar && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-white shadow-lg transition-opacity duration-300'>
          <span>{snackbarMessage}</span>
          <button type='button' onClick={handleSnackbarClose} className='ml-2 rounded p-1 hover:bg-gray-700'>
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </>
  );
}
