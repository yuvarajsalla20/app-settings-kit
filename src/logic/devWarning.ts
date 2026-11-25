import { useEffect } from 'react';

/** Says `message` once in development (and again when it changes). Nothing in a release build or when it is empty. */
export function useDevWarning(message: string | false | null | undefined): void {
  useEffect(() => {
    if (message && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: ${message}`);
  }, [message]);
}
