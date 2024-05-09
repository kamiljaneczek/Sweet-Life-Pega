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
    <div className='min-h-screen bg-white text-black'>
      <Header />
      <main>
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
    </div>
  );
}
