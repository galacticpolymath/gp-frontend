import Link from 'next/link';
import Image from 'next/image';

import Hero from '../../components/Hero';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';

const LessonsPage = ({ lessons }) => {

  const uniqueIDs = []

  const publishedLessons = lessons.filter(({ PublicationStatus, ReleaseDate, id }) => {
    if (!uniqueIDs.includes(id) 
      && PublicationStatus==="Live") {
        uniqueIDs.push(id);
        return true;
      }
    return false;
  });

  return (
    <Layout>
      <Hero className="bg-secondary">
        <h1>Interdisciplinary Lessons</h1>
        <p>Our lessons are free. We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
      </Hero>

      <div className='bg-light-gray'>
        <div className='container mx-auto grid py-5 px-3 gap-3'>
          {publishedLessons
            .filter(({ PublicationStatus }) => PublicationStatus === 'Live')
            .map((lesson) => (
              <Link
                key={lesson.locale + lesson.id}
                href={`/lessons/${lesson.DefaultLocale}/${lesson.id}`}
                passHref
              >
                <a className='d-block bg-white rounded-3 g-col-6 no-hover-color-change'>
                  <div>
                    {lesson.CoverImage && lesson.CoverImage.url && (
                      <Image
                        src={lesson.CoverImage.url}
                        alt={lesson.Subtitle}
                        layout="responsive"
                        width={1500}
                        height={450}
                      />
                    )}
                  </div>
                  <div className='p-3'>
                    <h3 className='fw-light text-black'>{lesson.Title}</h3>
                    <p className='text-black'>{lesson.Subtitle}</p>
                    <span className={`badge bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                      {lesson.Section.overview.TargetSubject}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');

  const lessons = await res.json();

  return { props: { lessons } };
};

export default LessonsPage;