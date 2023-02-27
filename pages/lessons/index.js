import Link from 'next/link';
import Image from 'next/image';

import Hero from '../../components/Hero';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';

const LessonsPage = ({ lessons }) => {

  const handleJobVizCardClick = () => {
    window.location.href = '/job-viz';
  };

  return (
    <Layout>
      <Hero className="bg-secondary heroLessonsPg">
        <h1>Interdisciplinary Lessons</h1>
        <p>Our lessons are free. We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
      </Hero>
      <div className="lessonsPgContent">
        <section className="pb-3 pb-sm-5 pt-2">
          <h2 className="mt-3 ms-sm-4 text-center text-sm-start text-muted">Galactic Polymath Learning Tools</h2>
          <section className="d-flex d-md-block justify-content-center align-items-center justify-content-md-start align-items-md-start ps-lg-5 ms-md-3 mt-sm-3">
            <div onClick={handleJobVizCardClick} className="jobVizCareer cardOnLessonsPg d-flex flex-column rounded lessonsPgShadow pb-2 pb-sm-3 pb-md-4">
              <section className="d-flex w-100">
                <section className="imgSec d-flex justify-content-center align-items-center">
                  {/* put the image for jobViz here */}
                  <JobVizIcon />
                </section>
                <section className="d-flex justify-content-center align-items-center flex-column">
                  <h4 className="text-muted jobVizLink">
                    Jobviz Career Explorer
                  </h4>
                </section>
              </section>
              <section className="w-100 d-flex flex-column ps-sm-3">
                <span className="text-muted">A starting point for students.</span>
                <span className="text-muted">Exploration of 1,000 job possibilities.</span>
              </section>
            </div>
          </section>
        </section>
        <section className="lessonsSection pt-1">
          <h2 className="ms-sm-4 text-center text-sm-start mt-4 mb-2 mb-sm-4 text-muted">Galactic Polymath Lesson Releases</h2>
          <div className='container mx-auto grid pb-5 px-3 gap-3 pt-3'>
            {lessons
              .filter(({ PublicationStatus }) => PublicationStatus === 'Live')
              .map((lesson, i) => (
                <Link
                  key={i}
                  href={`/lessons/${lesson.id}`}
                  className='d-block position-relative bg-white rounded-3 g-col-6 no-hover-color-change lessonsPgShadow cardOnLessonsPg'
                >
                  <div className="d-flex justify-content-center pt-lg-2">
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
                  <div className='pt-2 ps-3'>
                    <h3 className='fw-light text-black mb-0'>{lesson.Title}</h3>
                    <p className='text-black'>{lesson.Subtitle}</p>
                    {/* <span className={`badge lessonSubject bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                      {lesson.Section.overview.TargetSubject}
                    </span> */}
                  </div>
                  <span className={`badge position-absolute lessonSubject bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                    {lesson.Section.overview.TargetSubject}
                  </span>
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