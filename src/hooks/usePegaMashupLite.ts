import { useEffect, useState } from 'react';
import { startMashupLite } from '../lib/mashup-lite';
import useConstellation from './useConstellation';

const TIMEOUT_MS = 15_000;

interface PegaMashupState {
  isReady: boolean;
  isTimedOut: boolean;
}

/**
 * Lightweight alternative to usePegaMashup that uses mashup-lite
 * (zero @pega/react-sdk-components imports).
 *
 * Only bootstraps PCore APIs — no SDK component map, no React bridge.
 * Use with custom-pega components that render via PConnect directly.
 */
export default function usePegaMashupLite(): PegaMashupState {
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
    startMashupLite().then(() => {
      if (!cancelled) setIsMashupReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isSdkReady]);

  return { isReady: isMashupReady, isTimedOut: isTimedOut && !isMashupReady };
}
