/* eslint-disable react/jsx-indent */
import { useEffect } from 'react';
import { ModalProvider } from '../providers/ModalProvider';
import { LessonsCarouselProvider } from '../providers/LessonsCarouselProvider';
import ModalsContainer from '../ModalsContainer';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import './style.scss';
import '../styles/pages/HireUs/hireUs.scss';
import '../styles/pages/Lessons/lessons.scss';
import '../styles/pages/JobViz/job-viz-page.scss';
import '../styles/icons/icons.scss';
import '../styles/comps/carousel.scss';
import '../styles/pages/home.scss';
import '../styles/pages/About/about.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MyApp({ Component, pageProps }) {
  function getData(){
    const client = new ApolloClient({
      uri: 'https://flyby-router-demo.herokuapp.com/',
      cache: new InMemoryCache(),
    });
    client
    .query({
      query: gql`
        query GetLocations {
          locations {
            id
            name
            description
            photo
          }
        }
      `,
    })
    .then((result) => console.log(result)); 
  }

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
    getData();
  }, []);

  

  return (
    <>
      <GoogleAnalytics gaMeasurementId='G-8B58Y7HD3T' trackPageViews />
      <LessonsCarouselProvider>
        <ModalProvider>
          <Component {...pageProps} />
          <ModalsContainer />
        </ModalProvider>
      </LessonsCarouselProvider>
    </>
  );
}

export default MyApp;
