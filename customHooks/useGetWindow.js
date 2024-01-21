import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useState } from 'react';

const useGetWindow = () => {
  const router = useRouter();
  const [appWindow, setAppWindow] = useState({});

  useEffect(() => {
    const appWindow = {
      ...router,
      ...window.location,
    };
    setAppWindow(appWindow);
  }, []);

  return appWindow;
};

export default useGetWindow;