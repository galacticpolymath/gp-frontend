/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import Link from 'next/link';
import Image from 'next/image';

import Hero from '../../components/Hero';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';

const LessonsPage = ({ lessons }) => {

  const handleJobVizCardClick = () => {
    window.location.href = '/job-viz';
  };

  const uniqueIDs = [];
  const lessonsAptFor = [{ lesson: 'Colourful Solutions', lessonAptFor: "YEARS: 9-13" }, { lesson: 'Genetic Rescue to the Rescue', lessonAptFor: "GRADES: 9-12" }, { lesson: 'The Guardian Frogs of Borneo', lessonAptFor: 'GRADES: 5-9' }, { lesson: 'Females singing to be heard', lessonAptFor: 'GRADES: ADAPTED FOR 5-6, 7-8, & 9-12' }, { lesson: 'I Like That!', lessonAptFor: 'GRADES: 5-9' }];

  const publishedLessons = lessons.filter(({ PublicationStatus, id }) => {
    const isUniqueAndStatusLive = !uniqueIDs.includes(id) && (PublicationStatus === 'Live');

    isUniqueAndStatusLive && uniqueIDs.push(id);

    return isUniqueAndStatusLive;
  }).map(lesson => {
    const lessonAptFor = lessonsAptFor.find(({ lesson: lessonTitle }) => lessonTitle === lesson.Title);

    if (lessonsAptFor) {
      return {
        ...lesson,
        aptFor: lessonAptFor.lessonAptFor,
      };
    }

    return lesson;
  });

  return (
    <Layout>
      <Hero className="bg-secondary heroLessonsPg">
        <h1>Interdisciplinary Lessons</h1>
        <p>Our lessons are free. We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
      </Hero>
      <div className="lessonsPgContent">
        <section className="pb-3 pb-sm-5 pt-2">
          <section className="headerSecLessonsPg">
            <h2 className="mt-3 ms-sm-4 text-center text-sm-start text-muted">
              Galactic Polymath Learning Tools
            </h2>
          </section>
          <section>
            <section className="d-flex d-md-block justify-content-center align-items-center justify-content-md-start align-items-md-start ps-lg-5 ms-md-3 mt-sm-4">
              <div onClick={handleJobVizCardClick} className="jobVizCareer cardOnLessonsPg linkCard d-flex flex-column rounded lessonsPgShadow pb-2 pb-sm-3 pb-md-4">
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
                <section className="w-100 d-flex flex-column ps-sm-3 mt-2 mt-sm-0">
                  <span className="text-muted">A starting point for students.</span>
                  <span className="text-muted">Exploration of 1,000 job possibilities.</span>
                </section>
              </div>
            </section>
          </section>
        </section>
        <section className="lessonsSection pt-1">
          <section className="headerSecLessonsPg">
            <h2 className="ms-sm-4 text-center text-sm-start mt-4 mb-2 mb-sm-4 text-muted">Galactic Polymath Lesson Releases</h2>
          </section>
          <div className='container mx-auto grid pb-5 px-3 gap-3 pt-3 lessonIslandsContainer'>
            {publishedLessons
              .filter(({ PublicationStatus }) => PublicationStatus === 'Live')
              .map((lesson) => {
                const isOnFemaleSingLesson = "Females singing to be heard" === lesson.Title;
                const classNameAptFor = isOnFemaleSingLesson ? 'mt-2 mt-sm-0 ms-sm-0 ms-md-2 lessonsPgAptFor' : 'mt-2 mt-sm-0 ms-sm-2 lessonsPgAptFor';
                return (
                  <Link
                    key={lesson.locale + lesson.id}
                    href={`/lessons/${lesson.DefaultLocale}/${lesson.id}`}
                    passHref
                    className='d-block position-relative bg-white rounded-3 g-col-6 no-hover-color-change lessonsPgShadow cardOnLessonsPg availableLesson'
                  >
                    <div className="d-flex justify-content-center pt-lg-2">
                      {lesson.CoverImage && lesson.CoverImage.url && (
                        <Image
                          src={lesson.CoverImage.url}
                          alt={lesson.Subtitle}
                          width={1500}
                          height={450}
                          sizes="100vw"
                          style={{
                            width: '100%',
                            height: 'auto',
                          }}
                        />
                      )}
                    </div>
                    <div className='pt-2 ps-3'>
                      <h3 className='fw-light text-black mb-0'>{lesson.Title}</h3>
                      <p className='text-black'>{lesson.Subtitle}</p>
                      {/* d-flex flex-column d-sm-block */}
                      <section className="d-flex flex-column d-sm-block">
                        <span className={`badge lessonSubject bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                          {lesson.Section.overview.TargetSubject}
                        </span>
                        <span className={classNameAptFor}>
                          {lesson.aptFor}
                        </span>
                      </section>
                    </div>

                  </Link>
                )
              }

              )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');

  const lessons = await res.json();

  return { props: { lessons } };
}

export default LessonsPage;