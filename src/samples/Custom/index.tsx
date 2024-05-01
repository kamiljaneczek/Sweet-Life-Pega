import { render } from 'react-dom';
import { useEffect, useState } from 'react';

import { sdkIsLoggedIn, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';

import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';

import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';

declare const myLoadMashup: any;

export default function Custom() {
  const [mashupCaseTypes, setMashupCaseTypes] = useState([]);
  const [isPegaReady, setIsPegaReady] = useState<boolean>(false);
  // Array of 3 shopping options to display

  // const [pConn, setPConn] = useState<any>(null);

  // from react_root.js with some modifications
  // eslint-disable-next-line react/no-unstable-nested-components
  function RootComponent(props) {
    const PegaConnectObj = createPConnectComponent();

    // remove from Provider to work around compiler error for now: context={StoreContext}
    // return (
    //   <Provider store={PCore.getStore()} context={StoreContext} >
    //     <PegaConnectObj {...props} />
    //   </Provider>
    // );

    // const thePConnObj = <div>the RootComponent</div>;
    const thePConnObj = <PegaConnectObj {...props} />;

    // NOTE: For Embedded mode, we add in displayOnlyFA to our React context
    //  so it is available to any component that may need it.
    // VRS: Attempted to remove displayOnlyFA but it presently handles various components which
    //  SDK does not yet support, so all those need to be fixed up before it can be removed. To
    //  be done in a future sprint.
    return (
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      <StoreContext.Provider value={{ store: PCore.getStore(), displayOnlyFA: true }}>{thePConnObj}</StoreContext.Provider>
    );
  }

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here

    // // modified from react_root.js render
    const { props, domContainerID = null, componentName, portalTarget, styleSheetTarget } = inRenderObj;

    const thePConn = props.getPConnect();
    // setPConn(thePConn);
    // eslint-disable-next-line no-console
    console.log(`EmbeddedTopLevel: initialRender got a PConnect with ${thePConn.getComponentName()}`);

    console.log(
      `EmbeddedTopLevel: initialRender with domContainerID: ${domContainerID}, componentName: ${componentName}, portalTarget: ${portalTarget}, styleSheetTarget: ${styleSheetTarget}`
    );

    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />;

    // Initial render of component passed in (which should be a RootContainer)
    render(<>{theComponent}</>, target);
    setIsPegaReady(true);

    // Initial render to show that we have a PConnect and can render in the target location
    // render(      <div>        EmbeddedTopLevel initialRender in {domContainerID} with PConn of {componentName}      </div>,      target    );
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startPega() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(renderObj => {
      // eslint-disable-next-line no-console
      console.log(`PCore ready!`);
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      // Initialize the SdkComponentMap (local and pega-provided)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        // eslint-disable-next-line no-console
        console.log(`SdkComponentMap initialized`);

        // Don't call initialRender until SdkComponentMap is fully initialized
        initialRender(renderObj);
      });
    });

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

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
        console.log('SdkConstellationReady event received. Staarting Pega.');
        // start the portal
        startPega();
      });

      // Login if needed, without doing an initial main window redirect
      loginIfNecessary({ appName: 'embedded', mainRedirect: false });
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)
  }, []);

  return (
    <div>
      <h1>Custom</h1>
    </div>
  );
}
