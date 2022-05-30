import Image from 'next/image';

import Layout from '../_components/Layout';
import RichText from '../_components/RichText';

const LessonDetails = ({ lesson }) => {
  return (
    <Layout>
      <div className="bg-light-gray p-5">
        <div className="container">
          <h1>{lesson.Title}</h1>
          <h4 className='fw-light'>{lesson.Subtitle}</h4>
          <Image
            src={lesson.CoverImage.url}
            alt={lesson.Subtitle}
            layout="responsive"
            // TODO: will these always be the same size?
            width={1500}
            height={450}
          />
          <div className='row mt-4'>
            <div className="col col-md-6 col-lg-9">
              <h5>Sponsored by:</h5>
              <RichText content={lesson.SponsoredBy} />
            </div>
            <div className="col col-md-6 col-lg-3">
              <Image
                src={lesson.SponsorImage.url}
                alt={lesson.Subtitle}
                layout="responsive"
                width={1}
                height={1}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const paths = lessons.map(lesson => ({
    params: { id: `${lesson.id}` },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params: { id } }) => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const lesson = lessons.find((lesson) => `${lesson.id}` === `${id}`);
  
  return { props: { lesson } };
};

export default LessonDetails;