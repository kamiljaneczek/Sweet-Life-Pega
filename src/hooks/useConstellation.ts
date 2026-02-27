import { getSdkConfig, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
import { useEffect, useState } from 'react';
import { startMashup } from '../lib/constellation';

function useConstellation() {
  const [isPegaReady, setIsPegaReady] = useState(false);
  useEffect(() => {
    // SPA navigation case: PCore already initialized from a previous page
    if (typeof PCore !== 'undefined' && PCore) {
      setIsPegaReady(true);
      return;
    }

    // First load: configure auth and wait for SdkConstellationReady
    getSdkConfig().then((sdkConfig: any) => {
      const sdkConfigAuth = sdkConfig.authConfig;

      console.log('sdkConfig - customAuthType: ', sdkConfigAuth.customAuthType);

      if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (sdkConfigAuth.mashupGrantType === 'customBearer' && sdkConfigAuth.customAuthType === 'CustomIdentifier') {
        // Use custom bearer with specific custom parameter to set the desired operator via
        //  a userIdentifier property.  (Caution: highly insecure...being used for simple demonstration)
        sdkSetCustomTokenParamsCB(() => {
          return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
        });
      }
    });

    sdkSetCustomTokenParamsCB(() => {
      return { userIdentifier: 'bCustomAuth' };
    });

    const handleConstellationReady = () => {
      startMashup();
      setIsPegaReady(true);
    };

    document.addEventListener('SdkConstellationReady', handleConstellationReady);
    loginIfNecessary({ appName: 'embedded', mainRedirect: false });

    return function cleanupSubscriptions() {
      document.removeEventListener('SdkConstellationReady', handleConstellationReady);
      PCore?.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');
      PCore?.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
    };
  }, []);
  return isPegaReady;
}

export default useConstellation;
