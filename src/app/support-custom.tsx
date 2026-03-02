import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import useCustomPegaCase from '../hooks/useCustomPegaCase';
import usePegaMashup from '../hooks/usePegaMashup';
import PConnectRenderer from '../lib/custom-pega/PConnectRenderer';
import { SupportIncidentSkeleton } from './components/skeletons';

const TIMEOUT_MS = 15_000;

export default function SupportCustom() {
  // renderUI: false — only bootstraps PCore (auth, store, APIs).
  // No SDK React components render. Our custom components handle everything.
  const { isReady: isPegaReady, isTimedOut: isPegaTimedOut } = usePegaMashup({ renderUI: false });
  const { phase, caseId, rootPConnect, error } = useCustomPegaCase(isPegaReady);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'creating') return;

    const timer = setTimeout(() => setIsTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className='grow'>
      {/* Bootstrap target for myLoadMashup — no SDK components render here. */}
      <div id='pega-root' hidden />

      <section className='bg-white dark:bg-gray-800'>
        <div className='py-8 px-4 mx-auto max-w-screen-xl lg:px-6'>
          <div className='max-w-screen-md'>
            <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>
              Create incident (Custom)
            </h2>
            <p className='mb-8 text-gray-700 text-lg dark:text-gray-400'>
              Tell us about your concerns. We need to ask you a few questions to get started. It shall take only couple
              of minutes. We will get back to you as soon as possible.
            </p>

            <div className='flex flex-row align-middle items-center justify-center'>
              {(phase === 'idle' || phase === 'creating') && !isTimedOut && !isPegaTimedOut && <SupportIncidentSkeleton />}

              {(phase === 'idle' || phase === 'creating') && (isTimedOut || isPegaTimedOut) && (
                <div className='w-full max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center dark:border-amber-800 dark:bg-amber-950'>
                  <p className='text-lg font-medium text-amber-800 dark:text-amber-200'>Unable to connect to the support system</p>
                  <p className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
                    The Pega server is currently unavailable. Please try again later or contact us directly.
                  </p>
                </div>
              )}

              {phase === 'active' && rootPConnect && (
                <div className='w-full max-w-3xl'>
                  <PConnectRenderer pConnect={rootPConnect} />
                </div>
              )}

              {phase === 'error' && (
                <div className='w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-800 dark:bg-red-950'>
                  <p className='text-lg font-medium text-red-800 dark:text-red-200'>
                    Something went wrong
                  </p>
                  <p className='mt-2 text-sm text-red-700 dark:text-red-300'>
                    {error ?? 'An unexpected error occurred while creating the case.'}
                  </p>
                  <Link to='/support' className='mt-4 inline-block text-primary underline font-semibold'>
                    Back to Support
                  </Link>
                </div>
              )}
            </div>

            {phase === 'completed' && (
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
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
