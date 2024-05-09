/* eslint-disable no-console */
import { useState } from 'react';

import { Button } from '../design-system/ui/button';
import Header from './components/header';
import Footer from './components/footer';

import classNames from 'classnames';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import useConstellation from '../hooks/useConstellation';

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
      <main>
        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6'>
            <div className='max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>
                Let&aposs find more that brings us together.
              </h2>
              <p className='mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400'>
                Flowbite helps you connect with friends, family and communities of people who share your interests. Connecting with your friends and
                family as well as discovering new ones is easy with features like Groups, Watch and Marketplace.
              </p>
              <div className='flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4'>
                <a
                  href='#'
                  className='inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-hover focus:ring-4 focus:ring-primary-hover dark:focus:ring-primary-hover'
                >
                  Get started
                </a>
                <a
                  href='#'
                  className='inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
                >
                  <svg className='mr-2 -ml-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                  </svg>
                  View more
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className='text-center py-24'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold'>Any problems?</h2>
            <p className='text-lg text-gray-700 mt-4 mb-8'>We can help you.</p>
            <div id='incident-info' className={classNames('flex justify-center space-x-4', { hidden: showPega !== 'Info' })}>
              <Button onClick={handleCreateCase} className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>
                Create incident{' '}
              </Button>
            </div>
            <div id='pega-root' className={classNames('flex justify-center space-x-4', { hidden: showPega !== 'Pega' })} />
            <img src='assets/img/cupcake.svg' className='w-32 h-32' />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
