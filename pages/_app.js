/* eslint-disable react/jsx-indent */
import { useEffect } from 'react';
import { ModalProvider } from '../providers/ModalProvider';
import { LessonsCarouselProvider } from '../providers/LessonsCarouselProvider';
import ModalsContainer from '../ModalsContainer';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { SessionProvider } from 'next-auth/react';
import './style.scss';
import '../styles/pages/HireUs/hireUs.scss';
import '../styles/pages/Lessons/lessons.scss';
import '../styles/pages/JobViz/jobviz-page.scss';
import '../styles/icons/icons.scss';
import '../styles/comps/carousel.scss';
import '../styles/pages/home.scss';
import '../styles/pages/About/about.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { UserProvider } from '../providers/UserProvider';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <>
      <GoogleAnalytics gaMeasurementId='G-8B58Y7HD3T' trackPageViews />
      <SessionProvider session={session}>
        <LessonsCarouselProvider>
          <UserProvider>
            <ModalProvider>
              <Component {...pageProps} />
              <ModalsContainer />
            </ModalProvider>
          </UserProvider>
        </LessonsCarouselProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
