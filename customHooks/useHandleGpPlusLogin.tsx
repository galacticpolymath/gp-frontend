import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { resetUrl } from '../globalFns';
import { useRouter } from 'next/router';

export const useHandleGpPlusLogin = () => {
  const { status } = useSession();
  const router = useRouter();
  const [checkForOutsetaPropCount, setCheckForOutsetaPropCount] = useState(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const idToken = url.searchParams.get('magic_credential');

    console.log('(window as any).Outseta: ', (window as any).Outseta);

    if (
      idToken &&
      status === 'authenticated' &&
      typeof (window as any)?.Outseta?.setMagicLinkIdToken !== 'function' &&
      checkForOutsetaPropCount <= 5
    ) {
      setTimeout(() => {
        setCheckForOutsetaPropCount((state) => state + 1);
      }, 1_000);
    } else if (idToken && status === 'authenticated') {
      console.log('Will log the user into outseta...');
      console.log((window as any).Outseta);
      (window as any).Outseta?.debugOn();
      (window as any).Outseta.setMagicLinkIdToken(idToken);
      resetUrl(router);
    }
  }, [status, checkForOutsetaPropCount]);

  return;
};
