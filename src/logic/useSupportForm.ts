import { useEffect, useState } from 'react';
import type { SupportTransport } from './support';

/**
 * 16.0.0: whether About › Contact Support shows the in-app form. Off until the transport says the owner's switch is on, so
 * an app never shows a form that cannot deliver; without a transport, always off (the Mail app, as before). A transport
 * without `formOn` is on.
 */
export function useSupportForm(support: SupportTransport | undefined): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let live = true;
    if (!support) {
      setOn(false);
      return;
    }
    if (!support.formOn) {
      setOn(true);
      return;
    }
    support
      .formOn()
      .then((v) => live && setOn(v === true))
      .catch(() => live && setOn(false));
    return () => {
      live = false;
    };
  }, [support]);
  return on;
}
