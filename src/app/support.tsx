import { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../design-system/ui/hover-card';

import { Button } from '../design-system/ui/button';
import Header from './components/header';
import Footer from './components/footer';

import classNames from 'classnames';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import useConstellation from '../hooks/useConstellation';
import Loading from './components/loading';

export default function Support() {
  const [showPega, setShowPega] = useState('Info'); // Info, Pega, Confirmation
  const [caseId, setCaseId] = useState('');
  const isPegaReady = useConstellation();

  const handleCaseComplete = eventPayload => {
    setShowPega('Confirmation');
    setCaseId(eventPayload.caseID.split(' ')[1]);
  };

  const handleCaseCancel = () => {
    console.log('Case Cancelled');
    setShowPega('Info');
  };

  function handleCreateCase() {
    setShowPega('Pega');
    getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = (PCore.getEnvironmentInfo() as any).environmentInfoObject?.pyCaseTypeList;
        mashupCaseType = caseTypes?.[1]?.pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
        console.log('createCase rendering is complete');
      });

      const constants = PCore.getConstants();

      PCore.getPubSubUtils().subscribe(constants.PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING, handleCaseComplete, 'CaseComplete');
      PCore.getPubSubUtils().subscribe(constants.PUB_SUB_EVENTS.EVENT_CANCEL, handleCaseCancel, 'CaseCancel');
    });
  }

  return (
    <>
      <Header />

      <div className='flex-grow'>
        <section className='dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl 6 lg:px-6'>
            <div className='max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Questions or need help?</h2>
              <p className='mb-8 text-gray-500 text-lg dark:text-gray-400'>
                We are here to help you. If you have any questions or need help, please let us know. Search in our knowledge base or create a new
                incident.
              </p>
              <div className='flex flex-col flex-wrap mb-8 md:mb-16 space-y-4 md:flex-row md:justify-start justify-center md:space-y-0 md:space-x-4'>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button variant='accent' className='inline-flex'>
                      FAQ
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'> See most commonly asked questions and resolve your query quickly.</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button variant='outline' className='inline-flex'>
                      Knowlege base
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'>Search through our knowledge base to find answers to your questions.</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </section>
        <section className='dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl lg:px-6'>
            <div className=' max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Customer service policies</h2>
              <p className='mb-8 text-gray-500 text-lg dark:text-gray-400'>
                By using our services, you agree to our customer service policies. Please read our <a href='#'>policies</a> carefully before using our
                services.
              </p>
              <div className='flex flex-col flex-wrap mb-8 md:mb-16 space-y-4 md:flex-row md:justify-start justify-center md:space-y-0 md:space-x-4'>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button variant='accent'>Terms of service</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'>Before using our services and buing our products, please read our terms of service.</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button variant='outline'>Refund policies</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'>Review our refund policies before making a purchase.</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button variant='outline'>Privacy policy</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'>Review our privacy policy to understand how we use your data.</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
        </section>
        <section className='bg-white dark:bg-gray-800'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl  lg:px-6'>
            <div className='max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Incidents</h2>
              <p className='mb-8 text-gray-700 text-lg dark:text-gray-400'>
                Tell us about your concerns. We need to ask you a few questions to get started. It shall take only couple of minutes. We will get back
                to you as soon as possible.
              </p>
              <div
                id='incident-info'
                className={classNames(
                  'flex flex-col flex-wrap mb-8 md:mb-16 space-y-4 md:flex-row md:justify-start justify-center md:space-y-0 md:space-x-4',
                  {
                    hidden: showPega === 'Confirmation' || showPega === 'Pega'
                  }
                )}
              >
                <HoverCard openDelay={200}>
                  <HoverCardTrigger>
                    <Button onClick={handleCreateCase} className='flex-grow px-8 py-6' variant='default' size='lg'>
                      <span className='text-lg font-bold' /> Create incident
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className='font-bold'>If nothing helps, please create an incident and we will get back to you as soon as possible.</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className='flex flex-row align-middle items-center justify-center'>
                {!isPegaReady && <Loading />}
                <div
                  id='pega-root'
                  className={classNames('flex-grow w-full max-w-3xl', { hidden: !isPegaReady || showPega === 'Confirmation' || showPega === 'Info' })}
                />
              </div>
              <div
                id='incident-confirmation'
                className={classNames('flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4', {
                  hidden: showPega === 'Info' || showPega === 'Pega'
                })}
              >
                <div className='mb-8 mx-6 md:mx-12 font-normal text-gray-700 text-lg dark:text-gray-400'>
                  Thank you for your submission. We will get back to you as soon as possible. Your case number is{' '}
                  <span className='font-extrabold'>{caseId}</span>
                  {'. '}Please use it in any of followup conversation.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
