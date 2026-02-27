import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '../../../../design-system/ui/button';
import { Card, CardContent, CardHeader } from '../../../../design-system/ui/card';

import './ToDo.css';

interface ToDoProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  datasource?: any;
  myWorkList?: any;

  caseInfoID?: string;
  headerText?: string;

  itemKey?: string;
  showTodoList?: boolean;
  type?: string;

  context?: string;
  isConfirm?: boolean;
}

const isChildCase = (assignment) => {
  return assignment.isChild;
};

function topThreeAssignments(assignmentsSource: any[]): any[] {
  return Array.isArray(assignmentsSource) ? assignmentsSource.slice(0, 3) : [];
}

function getID(assignment: any) {
  if (assignment.value) {
    const refKey = assignment.value;
    return refKey.substring(refKey.lastIndexOf(' ') + 1);
  }
  const refKey = assignment.ID;
  const arKeys = refKey.split('!')[0].split(' ');
  return arKeys[2];
}

export default function ToDo(props: ToDoProps) {
  const { getPConnect, datasource = [], headerText = 'To do', showTodoList = true, myWorkList = {}, type = 'worklist', isConfirm = false } = props;

  const CONSTS = PCore.getConstants();

  const bLogging = true;
  let assignmentCount = 0;
  const currentUser = PCore.getEnvironmentInfo().getOperatorName() ?? '';
  const currentUserInitials = Utils.getInitials(currentUser);
  const assignmentsSource = datasource?.source || myWorkList?.source;

  const [bShowMore, setBShowMore] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage]: any = useState('');

  const [assignments, setAssignments] = useState<any[]>(initAssignments());

  const thePConn = getPConnect();
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Todo';
  const showlessLocalizedValue = localizedVal('show_less', 'CosmosFields');
  const showMoreLocalizedValue = localizedVal('show_more', 'CosmosFields');
  const canPerform = assignments?.[0]?.canPerform === 'true' || assignments?.[0]?.canPerform === true;

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

  function initAssignments(): any[] {
    if (assignmentsSource) {
      assignmentCount = assignmentsSource.length;
      return topThreeAssignments(assignmentsSource);
    }
    // turn off todolist
    return [];
  }

  const getAssignmentId = (assignment) => {
    return type === CONSTS.TODO ? assignment.ID : assignment.id;
  };

  const getPriority = (assignment) => {
    return type === CONSTS.TODO ? assignment.urgency : assignment.priority;
  };

  const getAssignmentName = (assignment) => {
    return type === CONSTS.TODO ? assignment.name : assignment.stepName;
  };

  function showToast(message: string) {
    const theMessage = `Assignment: ${message}`;

    console.error(theMessage);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  }

  function handleSnackbarClose() {
    setShowSnackbar(false);
  }

  function _showMore() {
    setBShowMore(false);
    setAssignments(assignmentsSource);
  }

  function _showLess() {
    setBShowMore(true);
    setAssignments(topThreeAssignments(assignmentsSource));
  }

  function clickGo(assignment) {
    const id = getAssignmentId(assignment);
    let { classname = '' } = assignment;
    const sTarget = thePConn.getContainerName();
    const sTargetContainerName = sTarget;

    const options: any = {
      containerName: sTargetContainerName,
      channelName: ''
    };

    if (classname === null || classname === '') {
      classname = thePConn.getCaseInfo().getClassName();
    }

    if (sTarget === 'workarea') {
      options.isActionFromToDoList = true;
      options.target = '';
      options.context = null;
      options.isChild = isChildCase(assignment);
    } else {
      options.isActionFromToDoList = false;
      options.target = sTarget;
    }

    thePConn
      .getActionsApi()
      .openAssignment(id, classname, options)
      .then(() => {
        if (bLogging) {
          console.log(`openAssignment completed`);
        }
      })
      .catch(() => {
        showToast(`Submit failed!`);
      });
  }

  const renderTaskId = (type, getPConnect, showTodoList, assignment) => {
    const displayID = getID(assignment);

    if ((showTodoList && type !== CONSTS.TODO) || assignment.isChild === true) {
      /* Supress link for todo inside flow step */
      return (
        <Button variant='link' size='sm' className='h-auto p-0 text-sm'>
          {`${assignment.name} ${getID(assignment)}`}
        </Button>
      );
    }
    return displayID;
  };

  const getListItemComponent = (assignment) => {
    return (
      <>
        <span className='hidden md:inline'>
          {localizedVal('Task in', localeCategory)}
          {renderTaskId(type, getPConnect, showTodoList, assignment)}
          {type === CONSTS.WORKLIST && assignment.status ? `\u2022 ` : undefined}
          {type === CONSTS.WORKLIST && assignment.status ? <span className='psdk-todo-assignment-status'>{assignment.status}</span> : undefined}
          {` \u2022  ${localizedVal('Urgency', localeCategory)}  ${getPriority(assignment)}`}
        </span>
        <span className='md:hidden'>
          <Button variant='link' size='sm' className='h-auto p-0 text-sm'>
            {`${assignment.name} ${getID(assignment)}`}
          </Button>
          {` \u2022 ${localizedVal('Urgency', localeCategory)}  ${getPriority(assignment)}`}
        </span>
      </>
    );
  };

  const toDoContent = (
    <>
      {showTodoList && (
        <CardHeader>
          <div className='flex items-center gap-2'>
            <h6 className='text-lg font-semibold'>{headerText}</h6>
            <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground'>
              {assignmentCount}
            </span>
          </div>
        </CardHeader>
      )}
      <ul className='divide-y'>
        {assignments.map((assignment) => (
          <li className='psdk-todo-avatar-header' key={getAssignmentId(assignment)}>
            <div className='mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'>
              {currentUserInitials}
            </div>
            <div className='block'>
              <h6 className='text-lg font-semibold'>{assignment?.name}</h6>
              <span className='text-sm text-muted-foreground'>
                {`${localizedVal('Task in', localeCategory)} ${renderTaskId(type, getPConnect, showTodoList, assignment)} \u2022  ${localizedVal(
                  'Urgency',
                  localeCategory
                )}  ${getPriority(assignment)}`}
              </span>
            </div>
            {(!isConfirm || canPerform) && (
              <div className='ml-auto'>
                <button
                  type='button'
                  id='go-btn'
                  className='inline-flex items-center rounded p-2 hover:bg-accent'
                  onClick={() => clickGo(assignment)}
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      {type === CONSTS.WORKLIST && (
        <Card className='my-2 border-l-[6px] border-l-primary pb-2'>
          {showTodoList && (
            <CardHeader>
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'>
                  {currentUserInitials}
                </div>
                <div className='flex items-center gap-2'>
                  <h6 className='text-lg font-semibold'>{headerText}</h6>
                  <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground'>
                    {assignmentCount}
                  </span>
                </div>
              </div>
            </CardHeader>
          )}
          <CardContent>
            <ul className='divide-y'>
              {assignments.map((assignment) => (
                <li
                  key={getAssignmentId(assignment)}
                  className='flex cursor-pointer items-center gap-3 px-2 py-3 hover:bg-accent'
                  onClick={() => clickGo(assignment)}
                >
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{getAssignmentName(assignment)}</p>
                    <p className='text-sm text-muted-foreground'>{getListItemComponent(assignment)}</p>
                  </div>
                  <button type='button' className='inline-flex items-center rounded p-1 hover:bg-accent' onClick={() => clickGo(assignment)}>
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {type === CONSTS.TODO && !isConfirm && <Card className='border-l-[6px] border-l-primary p-2 m-2'>{toDoContent}</Card>}
      {type === CONSTS.TODO && isConfirm && <>{toDoContent}</>}

      {assignmentCount > 3 && (
        <div className='flex justify-center'>
          {bShowMore ? (
            <Button variant='link' onClick={_showMore}>
              {showMoreLocalizedValue === 'show_more' ? 'Show more' : showMoreLocalizedValue}
            </Button>
          ) : (
            <Button variant='link' onClick={_showLess}>
              {showlessLocalizedValue === 'show_less' ? 'Show less' : showlessLocalizedValue}
            </Button>
          )}
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
            onClick={handleSnackbarClose}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </>
  );
}
