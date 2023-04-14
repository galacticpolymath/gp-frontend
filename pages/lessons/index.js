/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';

const LessonsPage = ({ lessons }) => {

  const handleJobVizCardClick = () => {
    window.location.href = '/job-viz';
  };

  const uniqueIDs = [];
  // const lessonsAptFor = [{ lesson: 'Colourful Solutions', lessonAptFor: "YEARS: 9-13" }, { lesson: 'Genetic Rescue to the Rescue', lessonAptFor: "GRADES: 9-12" }, { lesson: 'The Guardian Frogs of Borneo', lessonAptFor: 'GRADES: 5-9' }, { lesson: 'Females singing to be heard', lessonAptFor: 'GRADES: ADAPTED FOR 5-6, 7-8, & 9-12' }, { lesson: 'I Like That!', lessonAptFor: 'GRADES: 5-9' }];

  const publishedLessons = lessons.filter(({ PublicationStatus, id }) => {
    const isUniqueAndStatusLive = !uniqueIDs.includes(id) && (PublicationStatus === 'Live');

    isUniqueAndStatusLive && uniqueIDs.push(id);

    return isUniqueAndStatusLive;
  });

  // CASE: there is only one language for a specific lesson
  // GOAL: take the user to that specific lesson with the id of the lesson in the url 
  // the user is taken to the target lesson with the id of the lesson in the url 
  // take the user to following url: lesson/[id] 
  // get the id of the lesson
  // the lesson only has one language 
  // check if the lesson has only one language
  // the user clicks on a lesson 

  const handleLessonClick = lesson => {
    console.log('lessons: ', lesson)
    // href={`/lessons/${lesson.DefaultLocale}/${lesson.id}`}
  }

  return (
    <Layout>
      <section className="bg-secondary p-4">
        <div className="text-white col-sm-12 col-md-10 col-lg-8 col-xl-7">
          <h1>Free, Interdisciplinary Lessons</h1>
          <p>We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
        </div>
      </section>
      <div className="">
        <section className="mb-5 pt-2">
          <section className="headerSecLessonsPg">
            <h4 className="mt-3 ms-sm-4 text-muted text-center text-sm-start">
              Galactic Polymath Learning Tools
            </h4>
          </section>
          <section>
            <section className="mx-auto grid pb-1 p-4 gap-3 pt-3">
              <div onClick={handleJobVizCardClick} className="pointer g-col-12 g-col-sm-10 g-col-md-8 g-col-lg-6 g-col-xl-4 mx-md-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow jobVizCardOnLessonsPg">
                <section className="d-flex flex-column flex-sm-row w-100">
                  <section className="imgSec d-flex justify-content-center ">
                    <JobVizIcon />
                  </section>
                  <section className="d-flex justify-content-center align-items-left flex-column ps-3">
                    <h4 className='fw-light text-black mb-0 pb-1 text-center text-sm-start mt-1 mt-sm-0'>
                      Jobviz Career Explorer
                    </h4>
                    <span className="text-black text-center text-sm-start mt-1 mt-sm-0">A starting point for students to explore 1,000 job possibilities</span>
                  </section>
                </section>
                <section className="w-100 d-flex flex-column ps-sm-3 mt-2 mt-sm-0">

                </section>
              </div>
            </section>
          </section>
        </section>
        <section className="lessonsSection pt-1">
          <section className="">
            <h4 className="ms-sm-4 text-center text-sm-start mt-4 mb-2 mb-sm-4 text-muted">Galactic Polymath Lesson Releases</h4>
          </section>
          <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
            {publishedLessons
              .filter(({ PublicationStatus }) => PublicationStatus === 'Live')
              .map((lesson) => {
                return (
                  <div
                    key={lesson.locale + lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    // href={`/lessons/${lesson.DefaultLocale}/${lesson.id}`}
                    className='w-100 g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow cardsOnLessonPg'
                  >

                    <div className="position-relative overflow-hidden ">
                      {lesson.CoverImage && lesson.CoverImage.url && (
                        <Image
                          src={lesson.CoverImage.url}
                          alt={lesson.Subtitle}
                          width={15}
                          height={4.5}
                          sizes="100vw"
                          className="px-1 pt-1"
                          style={{
                            width: "100%",
                            height: "auto",
                          }}
                          priority
                        />
                      )}
                    </div>
                    <div className='pt-2 ps-sm-3 d-grid'>
                      <h3 className='w-light text-black mb-0'>{lesson.Title}</h3>
                      <p className='text-black'>{lesson.Subtitle}</p>
                      {/* d-flex flex-column d-sm-block */}
                      <section className="d-flex flex-wrap gap-1 align-self-end">
                        <span className={`badge me-1 lessonSubject bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                          {lesson.Section.overview.TargetSubject}
                        </span>
                        <span style={{ whiteSpace: 'normal' }} className="badge rounded-pill bg-gray ml-3">
                          {`${lesson.Section.overview.GradesOrYears}: ${lesson.Section.overview.ForGrades}`}
                        </span>
                      </section>
                    </div>

                  </div>
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