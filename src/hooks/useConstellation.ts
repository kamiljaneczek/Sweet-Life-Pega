/* eslint-disable no-console */

import { getSdkConfig, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
import { useEffect, useState } from 'react';
import { startMashup } from '../lib/constellation';

function useConstellation() {
  const [isPegaReady, setIsPegaReady] = useState(false);
  useEffect(() => {
    getSdkConfig().then((sdkConfig: any) => {
      const sdkConfigAuth = sdkConfig.authConfig;

      console.log('sdkConfig - customAuthType: ', sdkConfigAuth.customAuthType);

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
      if (sdkConfigAuth.customAuthType === 'customrBearer') {
        console.log('CustomBearer');
      }
    });

    sdkSetCustomTokenParamsCB(() => {
      return { userIdentifier: 'bCustomAuth' };
    });

    document.addEventListener('SdkConstellationReady', () => {
      // start the portal
      startMashup();
      setIsPegaReady(true);
    });
    loginIfNecessary({ appName: 'embedded', mainRedirect: false });
    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');

      PCore?.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
    };
  }, []);
  return isPegaReady;
}

export default useConstellation;
