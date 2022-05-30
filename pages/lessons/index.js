import Link from 'next/link';
import Image from 'next/image';

import Hero from '../../components/Hero';
import Layout from '../../components/Layout';

const LessonsPage = ({ lessons }) => {
  return (
    <Layout>
      <Hero className="bg-secondary">
        <h1>Interdisciplinary Lessons</h1>
        <p>Our lessons are free. We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
      </Hero>

      <div className='bg-light-gray'>
        <div className='container mx-auto grid py-5 px-3 gap-3'>
          {/* TODO: hide unpublished lessons? */}
          {lessons.map(lesson => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              passHref
            >
              <a className='d-block bg-white rounded-3 g-col-6 no-hover-color-change'>
                <div>
                  <Image
                    src={lesson.CoverImage.url}
                    alt={lesson.Subtitle}
                    layout="responsive"
                    // TODO: will these always be the same size?
                    width={1500}
                    height={450}
                  />
                </div>
                <div className='p-3'>
                  <h3 className='fw-light'>{lesson.Title}</h3>
                  <p>{lesson.Subtitle}</p>
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