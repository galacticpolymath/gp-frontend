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
      <div className="lessonsPgContent">
        <section className="jobVizEntrySection pb-3">
          <h2 className="mt-3 ms-4 text-muted">Galactic Polymath Learning Tools</h2>
          <div className="ms-5 jobVizCareer d-flex flex-column">
            <section className="d-flex w-100">
              <section className="imgSec d-flex justify-content-center align-items-center">
                {/* put the image for jobViz here */}
                <div className="jobVizImgContainer rounded-circle border">
                  <img
                    src=""
                    alt="jobViz_Galactic_Polymath"
                    className='jobVizImg'
                  />
                </div>
              </section>
              <section className="d-flex justify-content-center align-items-center flex-column">
                <h4>
                  <Link href="/job-viz" className="text-muted">Jobviz Career Explorer</Link>
                </h4>
              </section>
            </section>
            <section className="w-100 d-flex flex-column ps-3">
              <span className="text-muted">A starting point for students.</span>
              <span className="text-muted">Exploration of 1,000 job possibilities.</span>
            </section>
          </div>
        </section>
        <section className="lessonsSection pt-2">
          <h2 className="ms-4 mb-4 text-muted">Galactic Polymath Releases</h2>
          <div className='container mx-auto grid pb-5 px-3 gap-3 bg-light-gray pt-3'>
            {lessons
              .filter(({ PublicationStatus }) => PublicationStatus === 'Live')
              .map((lesson, i) => (
                <Link
                  key={i}
                  href={`/lessons/${lesson.id}`}
                  className='d-block bg-white rounded-3 g-col-6 no-hover-color-change'
                >
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
                </Link>
              ))}
          </div>
        </section>
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