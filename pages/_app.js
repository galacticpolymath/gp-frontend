/* eslint-disable react/jsx-indent */
import { useEffect } from 'react';
import './style.scss';
import '../styles/pages/HireUs/hireUs.scss';
import '../styles/icons/icons.scss';
import '../styles/comps/carousel.scss';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);
  
  return (
        <Component {...pageProps} />
  );
}

export default MyApp;
