/* eslint-disable react/jsx-indent */
import { useEffect, useRef, useState } from 'react';
import './style.scss';
import '../styles/pages/hireUs.scss';
import '../styles/icons/icons.scss';
import { ParallaxProvider } from 'react-scroll-parallax';

// what this component doing? 
// installing bootstrap for the component
function MyApp({ Component, pageProps }) {
  const [scrollEl, setScrollElement] = useState(null);
  const ref = useRef();

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  useEffect(() => {
    setScrollElement(ref.current);
  });

  return (
    <div ref={ref}>
      <ParallaxProvider ref={scrollEl}>
        <Component {...pageProps} />
      </ParallaxProvider>
    </div>
  );
}

export default MyApp;
