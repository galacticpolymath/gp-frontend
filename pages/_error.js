/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import Layout from '../components/Layout';

const ErrorPg = () => (
  <Layout>
    <div className="lessonDetailsContainer min-vh-100 pt-3 ps-3">
      <span>404 page not found 😔.</span>
    </div>
  </Layout>
);

export const getServerSideProps = async (context) => {
  console.log('getServerSideProps in _error.js')

  const REGEX = /\d+$/;
  console.log('context.resolvedUrl: ',context.resolvedUrl)

  if (REGEX.test(context.resolvedUrl)) {
    const res = await fetch('https://gp-catalog.vercel.app/index.json');
    const lessons = await res.json();
    const lessonId = context.resolvedUrl.match(REGEX)[0];
    const targetLesson = lessons.find(lesson => lesson.id === parseInt(lessonId));

    if(!targetLesson) return { props: {} }

    console.log('targetLesson: ', targetLesson.PublicationStatus)

    return {
      redirect: {
        destination: `/lessons/${targetLesson.DefaultLocale}/${targetLesson.id}`,
        permanent: true,
      },
    }
  }

  return { props: {} }
};

export default ErrorPg;