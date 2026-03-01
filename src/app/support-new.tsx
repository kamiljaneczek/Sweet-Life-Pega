/* eslint-disable no-console */

import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import usePegaMashup from '../hooks/usePegaMashup';
import { cn } from '../lib/utils';
import { SupportIncidentSkeleton } from './components/skeletons';

interface SupportNewProps {
  caseId?: string;
}

export default function SupportNew({ caseId: caseIdParam }: SupportNewProps) {
  const [showPega, setShowPega] = useState<'Pega' | 'Confirmation'>('Pega');
  const [caseId, setCaseId] = useState(caseIdParam ?? '');
  const { isReady: isPegaReady, isTimedOut } = usePegaMashup();
  const navigate = useNavigate();
  const caseInitiated = useRef(false);

  const handleCaseComplete = (eventPayload) => {
    setShowPega('Confirmation');
    setCaseId(eventPayload.caseID.split(' ')[1]);
  };

  const handleCaseCancel = () => {
    console.log('Case Cancelled');
    navigate({ to: '/support' });
  };

  useEffect(() => {
    if (!isPegaReady || caseInitiated.current) return;
    caseInitiated.current = true;

    getSdkConfig().then((sdkConfig) => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[1].pyWorkTypeImplementationClassName;
      }

      const constants = PCore.getConstants();

      if (caseIdParam) {
        // Open mode: reconstruct full case ID and open case via mashup API
        const workPool = mashupCaseType.split('-').slice(0, -1).join('-');
        const fullCaseId = `${workPool} ${caseIdParam}`;
        const options = { pageName: 'pyEmbedAssignment' };

        (PCore.getMashupApi().openCase(fullCaseId, PCore.getConstants().APP.APP, options) as any).catch((err) => {
          console.error('Failed to open case:', err);
          navigate({ to: '/support' });
        });
      } else {
        // Create mode: create a new case
        const options: any = {
          pageName: 'pyEmbedAssignment',
          startingFields: {}
        };
        (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
          // Get case ID from PCore store after case is rendered
          const primaryContainer = PCore.getContainerUtils().getActiveContainerItemName('app/primary') || 'app/primary_1';
          const workareaContainer =
            PCore.getContainerUtils().getActiveContainerItemName(`${primaryContainer}/workarea`) || `${primaryContainer}/workarea_1`;
          const shortId = PCore.getStoreValue('.pyID', 'caseInfo.content', workareaContainer);

          if (shortId) {
            setCaseId(shortId);
            window.history.replaceState(null, '', `/support/new/${shortId}`);
          }
        });
      }

      PCore.getPubSubUtils().subscribe(constants.PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, handleCaseComplete, 'CaseComplete');
      PCore.getPubSubUtils().subscribe(constants.PUB_SUB_EVENTS.EVENT_CANCEL, handleCaseCancel, 'CaseCancel');
    });

    return () => {
      const constants = PCore.getConstants();
      PCore.getPubSubUtils().unsubscribe(constants.PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, 'CaseComplete');
      PCore.getPubSubUtils().unsubscribe(constants.PUB_SUB_EVENTS.EVENT_CANCEL, 'CaseCancel');
    };
  }, [isPegaReady]);

  return (
    <div className='grow'>
      <section className='bg-white dark:bg-gray-800'>
        <div className='py-8 px-4 mx-auto max-w-screen-xl lg:px-6'>
          <div className='max-w-screen-md'>
            <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>
              {caseIdParam ? 'Continue incident' : 'Create incident'}
            </h2>
            <p className='mb-8 text-gray-700 text-lg dark:text-gray-400'>
              {caseIdParam
                ? `Continue working on your incident ${caseIdParam}. Pick up where you left off.`
                : 'Tell us about your concerns. We need to ask you a few questions to get started. It shall take only couple of minutes. We will get back to you as soon as possible.'}
            </p>
            <div className='flex flex-row align-middle items-center justify-center'>
              {!isPegaReady && !isTimedOut && <SupportIncidentSkeleton />}
              {isTimedOut && (
                <div className='w-full max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center dark:border-amber-800 dark:bg-amber-950'>
                  <p className='text-lg font-medium text-amber-800 dark:text-amber-200'>Unable to connect to the support system</p>
                  <p className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
                    The Pega server is currently unavailable. Please try again later or contact us directly.
                  </p>
                </div>
              )}
              <div id='pega-root' className={cn('grow w-full max-w-3xl', { hidden: !isPegaReady || isTimedOut || showPega === 'Confirmation' })} />
            </div>
            <div
              id='incident-confirmation'
              className={cn('flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4', {
                hidden: showPega === 'Pega'
              })}
            >
              <div className='mb-8 mx-6 md:mx-12 font-normal text-gray-700 text-lg dark:text-gray-400'>
                Thank you for your submission. We will get back to you as soon as possible. Your case number is{' '}
                <span className='font-extrabold'>{caseId}</span>
                {'. '}Please use it in any of followup conversation.
                <div className='mt-6'>
                  <Link to='/support' className='text-primary underline font-semibold'>
                    Back to Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
