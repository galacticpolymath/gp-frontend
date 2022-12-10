import { useEffect } from 'react';
import './style.scss';

// what this component doing? 
// installing bootstrap for the component
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
