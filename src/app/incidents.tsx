import { useEffect, useState } from 'react';

import { loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

import { Button } from '../design-system/ui/button';
import Header from './components/header';
import Footer from './components/footer';
import { startMashup } from '../lib/constellation';
import classNames from 'classnames';

export default function Main() {
  const [showPega, setShowPega] = useState('Info'); // Info, Pega, Confirmation
  /**
   * kick off the application's portal that we're trying to serve up
   */

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    getSdkConfig().then((sdkConfig: any) => {
      const sdkConfigAuth = sdkConfig.authConfig;

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (sdkConfigAuth.customAuthType === 'CustomIdentifier') {
        // Use custom bearer with specific custom parameter to set the desired operator via
        //  a userIdentifier property.  (Caution: highly insecure...being used for simple demonstration)
        sdkSetCustomTokenParamsCB(() => {
          return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
        });
      }

      document.addEventListener('SdkConstellationReady', () => {
        // start the portal
        startMashup();
      });

      // Login if needed, without doing an initial main window redirect
      loginIfNecessary({ appName: 'embedded', mainRedirect: false });
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');

      PCore?.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
    };
  }, []);

  /*
  useEffect(() => {
    if (isPegaReady) {
      setAccessGroup(PCore.getEnvironmentInfo().getAccessGroup());

      const dataViewName = 'D_ObjectList';
      const parameters = {
        Prop1: 'a'
      };
      const paging = {
        pageNumber: 1,
        pageSize: 10
      };
      const query = {
        distinctResultsOnly: true,
        select: [
          {
            field: 'Prop1'
          },
          {
            field: 'Prop2'
          }
        ]
      };

      (PCore.getDataPageUtils().getDataAsync(dataViewName, 'root', parameters, paging, query) as Promise<any>)
        .then(response => {
          // eslint-disable-next-line no-console
          console.log('DataPageUtils.getDataAsync response', response);
        })
        .catch(error => {
          throw new Error('Error', error);
        });
    }
  }, [isPegaReady]); */

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
        // eslint-disable-next-line no-console
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
