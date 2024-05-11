/* eslint-disable no-console */
import { useState } from 'react';

import { Button } from '../design-system/ui/button';
import Header from './components/header';
import Footer from './components/footer';

import classNames from 'classnames';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import useConstellation from '../hooks/useConstellation';
import Loading from './components/loading';

export default function Support() {
  const [showPega, setShowPega] = useState('Info'); // Info, Pega, Confirmation
  const isPegaReady = useConstellation();
  console.log('isPegaReady', isPegaReady);

  function handleCreateCase() {
    setShowPega('Pega');
    getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
        console.log('createCase rendering is complete');
      });
    });
  }

  return (
    <>
      <Header />
      {isPegaReady ? (
        <main>
          <section className=''>
            <div className='py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6'>
              <div className='max-w-screen-md'>
                <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Questions or need help?</h2>
                <p className='mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400'>
                  We are here to help you. If you have any questions or need help, please let us know. Search in our knowledge base or create a new
                  incident.
                </p>
                <div className='flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4'>
                  <Button variant='default'>FAQ</Button>
                  <Button variant='secondary'>Knowlege base</Button>
                  <Button variant='secondary'>Terms of service</Button>
                </div>
              </div>
            </div>
          </section>
          <section className='pt-12 bg-white dark:bg-gray-900'>
            <div className='py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6'>
              <div className='max-w-screen-md'>
                <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Incidents</h2>
                <p className='mb-8 font-light text-gray-700 sm:text-xl dark:text-gray-400'>
                  Tell us about your concerns. We need to ask you a few questions to get started. It shall take only couple of minutes. We will get
                  back to you as soon as possible.
                </p>
                <div id='incident-info' className={classNames('flex justify-center space-x-4', { hidden: showPega !== 'Info' })}>
                  <Button onClick={handleCreateCase} variant='default' size='lg'>
                    Create incident
                  </Button>
                </div>
                <div className='flex flex-row align-middle items-center justify-center'>
                  <div id='pega-root' className={classNames('flex-grow w-full max-w-3xl', { hidden: showPega !== 'Pega' })} />
                </div>
              </div>
            </div>
          </section>
          <section className=''>
            <div className='py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6'>
              <div className='max-w-screen-md'>
                <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Customer service policies</h2>
                <p className='mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400'>
                  By using our services, you agree to our customer service policies. Please read our <a href='#'>policies</a> carefully before using
                  our services.
                </p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <Loading />
      )}

      <Footer />
    </>
  );
}
