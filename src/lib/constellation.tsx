import C11nEnv from '@pega/pcore-pconnect-typedefs/interpreter/c11n-env';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import { useMemo } from 'react';
import { createRoot, Root } from 'react-dom/client';
import localSdkComponentMap from '../../sdk-local-component-map';

declare const myLoadMashup: any;

let mashupState: 'idle' | 'starting' | 'ready' = 'idle';
let defined_root: Root | null = null;
let cachedRenderObj: any = null;
let startPromise: Promise<void> | null = null;
let pendingObserver: MutationObserver | null = null;

function RootComponent(props) {
  const PegaConnectObj = createPConnectComponent();
  const thePConnObj = <PegaConnectObj {...props} />;

  /**
   * NOTE: For Embedded mode, we add in displayOnlyFA to our React context
   * so it is available to any component that may need it.
   * VRS: Attempted to remove displayOnlyFA but it presently handles various components which
   * SDK does not yet support, so all those need to be fixed up before it can be removed.
   * To be done in a future sprint.
   */
  const contextValue = useMemo(() => {
    return { store: PCore.getStore(), displayOnlyFA: true };
  }, [PCore.getStore()]);

  return <StoreContext.Provider value={contextValue}>{thePConnObj}</StoreContext.Provider>;
}

/**
 * Render (or re-render) the Pega mashup content into #pega-root.
 * Handles the case where the target element isn't in the DOM yet via MutationObserver.
 */
function renderMashupContent(renderObj: any) {
  const { props, domContainerID = null, componentName, portalTarget, styleSheetTarget } = renderObj;

  const thePConn = props.getPConnect() as C11nEnv;
  console.log(`EmbeddedTopLevel: renderMashupContent got a PConnect with ${thePConn.getComponentName()}`);

  let target: any = null;

  if (domContainerID !== null) {
    target = document.getElementById(domContainerID);
  } else if (portalTarget !== null) {
    target = portalTarget;
  }

  console.log(
    `renderMashupContent with domContainerID: ${domContainerID}, target: ${target} componentName: ${componentName}, portalTarget: ${portalTarget}, styleSheetTarget: ${styleSheetTarget}`
  );

  const Component: any = RootComponent;

  if (componentName) {
    Component.displayName = componentName;
  }

  const theComponent = <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />;

  const renderToTarget = (el: HTMLElement) => {
    defined_root = createRoot(el);
    defined_root.render(theComponent);
  };

  if (target) {
    renderToTarget(target);
  } else if (domContainerID) {
    // Element not in DOM yet (React may not have rendered it). Wait for it.
    // Disconnect any previous observer to prevent stale renders on re-entry.
    if (pendingObserver) {
      pendingObserver.disconnect();
      pendingObserver = null;
    }
    const observer = new MutationObserver(() => {
      const el = document.getElementById(domContainerID);
      if (el) {
        observer.disconnect();
        pendingObserver = null;
        renderToTarget(el);
      }
    });
    pendingObserver = observer;
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

/**
 * Returns the root PConnect from PCore's bootstrap (cached during onPCoreReady).
 * Available after startMashup() completes. Returns null before that.
 */
export function getCachedRootPConnect(): any | null {
  if (!cachedRenderObj?.props?.getPConnect) return null;
  return cachedRenderObj.props.getPConnect();
}

/**
 * Unmount the Pega React root. Safe to call multiple times.
 * Call this when the page component containing #pega-root unmounts.
 */
export function destroyMashupRoot() {
  if (pendingObserver) {
    pendingObserver.disconnect();
    pendingObserver = null;
  }
  if (defined_root) {
    defined_root.unmount();
    defined_root = null;
  }
}

/**
 * Idempotent mashup lifecycle:
 * - idle → starting: registers onPCoreReady callback, calls myLoadMashup (first time only)
 * - starting: returns the pending promise (deduplicates concurrent calls)
 * - ready (re-entry): unmounts old root, re-renders cached content into current #pega-root
 */
export function startMashup(options?: { renderUI?: boolean }): Promise<void> {
  const { renderUI = true } = options ?? {};

  // Already in progress — return existing promise
  if (mashupState === 'starting') {
    return startPromise!;
  }

  // Re-entry — optionally re-render cached content
  if (mashupState === 'ready') {
    if (renderUI) {
      // Capture old root and null out synchronously so no other code references it.
      // Defer unmount via queueMicrotask to avoid React "synchronously unmount" warning
      // while ensuring it runs before any setTimeout (prevents double-destroy).
      const oldRoot = defined_root;
      defined_root = null;
      if (pendingObserver) {
        pendingObserver.disconnect();
        pendingObserver = null;
      }
      if (oldRoot) {
        queueMicrotask(() => oldRoot.unmount());
      }
      if (cachedRenderObj) {
        renderMashupContent(cachedRenderObj);
      }
    }
    return Promise.resolve();
  }

  // First time — bootstrap the mashup
  mashupState = 'starting';
  startPromise = new Promise<void>((resolve) => {
    PCore.onPCoreReady((renderObj) => {
      console.log('PCore ready!');
      compareSdkPCoreVersions();

      getSdkComponentMap(localSdkComponentMap).then((_theComponentMap: any) => {
        console.log('SdkComponentMap initialized', _theComponentMap);
        cachedRenderObj = renderObj;
        if (renderUI) {
          renderMashupContent(renderObj);
        }
        mashupState = 'ready';
        resolve();
      });
    });

    console.log('startMashup: calling myLoadMashup', window);
    myLoadMashup('pega-root', false);
  });

  return startPromise;
}
