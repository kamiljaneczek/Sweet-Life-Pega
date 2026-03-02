declare const myLoadMashup: any;
declare const PCore: any;

let mashupState: 'idle' | 'starting' | 'ready' = 'idle';
let startPromise: Promise<void> | null = null;

/**
 * Lightweight mashup bootstrap that only initializes PCore APIs.
 * Does NOT import anything from @pega/react-sdk-components.
 * No SDK component map, no React bridge, no StoreContext.
 *
 * Use this when only PCore data/case APIs are needed (e.g. custom-pega rendering).
 */
export function startMashupLite(): Promise<void> {
  if (mashupState === 'starting') {
    return startPromise!;
  }

  if (mashupState === 'ready') {
    return Promise.resolve();
  }

  mashupState = 'starting';
  startPromise = new Promise<void>((resolve) => {
    PCore.onPCoreReady(() => {
      console.log('PCore ready (lite)');
      mashupState = 'ready';
      resolve();
    });

    myLoadMashup('pega-root', false);
  });

  return startPromise;
}
