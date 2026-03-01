import { useEffect, useState } from 'react';
import { startMashup } from '../lib/constellation';
import useConstellation from './useConstellation';

const TIMEOUT_MS = 15_000;

interface PegaMashupState {
  isReady: boolean;
  isTimedOut: boolean;
}

/**
 * Combines SDK auth readiness (useConstellation) with mashup rendering lifecycle.
 * Guarantees that startMashup() is called only after React has rendered #pega-root
 * into the DOM (useEffect runs post-render).
 *
 * Root lifecycle (create/unmount) is owned by startMashup's re-entry path —
 * cleanup here only cancels the pending promise to avoid stale setState.
 *
 * Pass `renderUI: false` when the page only needs PCore data APIs (no mashup UI).
 *
 * Returns `{ isReady, isTimedOut }`. If the Pega backend is unreachable,
 * `isTimedOut` flips to `true` after 15 s so consumers can show fallback content.
 */
export default function usePegaMashup(options?: { renderUI?: boolean }): PegaMashupState {
  const { renderUI = true } = options ?? {};
  const isSdkReady = useConstellation();
  const [isMashupReady, setIsMashupReady] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (isMashupReady) return;

    const timer = setTimeout(() => setIsTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isMashupReady]);

  useEffect(() => {
    if (!isSdkReady) return;

    let cancelled = false;
    startMashup({ renderUI }).then(() => {
      if (!cancelled) setIsMashupReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isSdkReady, renderUI]);

  return { isReady: isMashupReady, isTimedOut: isTimedOut && !isMashupReady };
}
