/* eslint-disable react/jsx-indent */
import { useEffect } from 'react';
import './style.scss';
import '../styles/pages/HireUs/hireUs.scss';
import '../styles/pages/Lessons/lessons.scss';
import '../styles/pages/JobViz/job-viz-page.scss';
import '../styles/icons/icons.scss';
import '../styles/comps/carousel.scss';
import '../styles/pages/home.scss';
import { ModalProvider } from '../providers/ModalProvider';
import { LessonsCarouselProvider } from '../providers/LessonsCarouselProvider';
import ModalsContainer from '../ModalsContainer';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <LessonsCarouselProvider>
      <ModalProvider>
        <Component {...pageProps} />
        <ModalsContainer />
      </ModalProvider>
    </LessonsCarouselProvider>
  );
}

export default MyApp;
