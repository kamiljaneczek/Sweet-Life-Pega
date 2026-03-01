import { getSdkConfig, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
import { useEffect, useState } from 'react';

// Module-level singleton: ensures auth + SDK bootstrap runs exactly once
// and persists across SPA navigations (component mount/unmount cycles)
let initStarted = false;
let pegaReady = false;
const readyListeners = new Set<() => void>();

function ensureConstellationInit() {
  if (initStarted) return;
  initStarted = true;

  getSdkConfig().then((sdkConfig: any) => {
    const sdkConfigAuth = sdkConfig.authConfig;

    console.log('sdkConfig - customAuthType: ', sdkConfigAuth.customAuthType);

    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'Basic') {
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
      sdkSetAuthHeader(`Basic ${sB64}`);
    }

    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'BasicTO') {
      const now = new Date();
      const expTime = new Date(now.getTime() + 5 * 60 * 1000);
      let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
      const regex = /[-:]/g;
      sISOTime = sISOTime.replace(regex, '');
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
      sdkSetAuthHeader(`Basic ${sB64}`);
    }

    if (sdkConfigAuth.mashupGrantType === 'customBearer' && sdkConfigAuth.customAuthType === 'CustomIdentifier') {
      sdkSetCustomTokenParamsCB(() => {
        return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
      });
    }
  });

  sdkSetCustomTokenParamsCB(() => {
    return { userIdentifier: 'bCustomAuth' };
  });

  // Auth-only: sets pegaReady when SDK bootstrap completes (no mashup rendering here)
  document.addEventListener('SdkConstellationReady', () => {
    pegaReady = true;
    readyListeners.forEach((cb) => cb());
    readyListeners.clear();
  });

  loginIfNecessary({ appName: 'embedded', mainRedirect: false });
}

export { ensureConstellationInit };

function useConstellation() {
  const [isPegaReady, setIsPegaReady] = useState(pegaReady);

  useEffect(() => {
    // Already initialized from a previous mount or SdkConstellationReady already fired
    if (pegaReady || (typeof PCore !== 'undefined' && PCore)) {
      pegaReady = true;
      setIsPegaReady(true);
      return;
    }

    // Start the singleton init (no-op if already started)
    ensureConstellationInit();

    // Subscribe to the ready notification
    const onReady = () => setIsPegaReady(true);
    readyListeners.add(onReady);

    return () => {
      readyListeners.delete(onReady);
    };
  }, []);

  return isPegaReady;
}

export default useConstellation;
