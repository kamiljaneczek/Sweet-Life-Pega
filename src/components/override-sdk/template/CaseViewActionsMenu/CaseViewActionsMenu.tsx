import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../design-system/ui/button';

interface CaseViewActionsMenuProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  availableActions: any[];
  availableProcesses: any[];
  caseTypeID: string;
  caseTypeName: string;
}

export default function CaseViewActionsMenu(props: CaseViewActionsMenuProps) {
  const { getPConnect, availableActions, availableProcesses, caseTypeID, caseTypeName } = props;
  const thePConn = getPConnect();

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'CaseView';
  const localeKey = `${caseTypeID}!CASE!${caseTypeName}`.toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage]: any = useState('');
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showSnackbar) {
      snackbarTimerRef.current = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    }
    return () => {
      if (snackbarTimerRef.current) {
        clearTimeout(snackbarTimerRef.current);
      }
    };
  }, [showSnackbar]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  function showToast(message: string) {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  }

  function handleSnackbarClose() {
    setShowSnackbar(false);
  }

  function _actionMenuActionsClick(data) {
    const actionsAPI = thePConn.getActionsApi();
    const openLocalAction = actionsAPI.openLocalAction.bind(actionsAPI);

    openLocalAction(data.ID, {
      ...data,
      containerName: 'modal',
      type: 'express'
    });
    // after doing the action, close the menu...
    handleClose();
  }

  function _actionMenuProcessClick(process) {
    const actionsAPI = thePConn.getActionsApi();
    const openProcessAction = actionsAPI.openProcessAction.bind(actionsAPI);
    openProcessAction(process.ID, {
      ...process
    })
      .then(() => {})
      .catch(() => {
        showToast(`${process.name} Submit failed!`);
      });
    handleClose();
  }

  const arMenuItems: React.ReactNode[] = [];

  availableActions.forEach((action) => {
    arMenuItems.push(
      <button
        type='button'
        key={action.ID}
        className='flex w-full items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
        onClick={() => _actionMenuActionsClick(action)}
      >
        {localizedVal(action.name, '', localeKey)}
      </button>
    );
  });

  availableProcesses.forEach((process) => {
    arMenuItems.push(
      <button
        type='button'
        key={process.ID}
        className='flex w-full items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
        onClick={() => _actionMenuProcessClick(process)}
      >
        {localizedVal(process.name, '', localeKey)}
      </button>
    );
  });

  return (
    <>
      <div className='relative inline-block'>
        <Button ref={buttonRef} variant='ghost' aria-controls='actions-menu' aria-haspopup='true' onClick={handleClick}>
          {localizedVal('Actions...', localeCategory)}
        </Button>
        {menuOpen && (
          <div
            ref={menuRef}
            className='absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border bg-popover py-1 text-popover-foreground shadow-md'
          >
            {arMenuItems}
          </div>
        )}
      </div>
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
            onClick={handleSnackbarClose}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </>
  );
}
