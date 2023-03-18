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
            <h4 className="mt-3 ms-4 text-muted">
              Galactic Polymath Learning Tools
            </h4>
          </section>
          <section>
            <section className=" mx-auto grid pb-1 p-4 gap-3 pt-3">
              <div onClick={handleJobVizCardClick} className="g-col-sm-12 g-col-md-8 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow">
                <section className="d-flex w-100">
                  <section className="imgSec d-flex justify-content-center ">
                    {/* put the image for jobViz here */}
                    <JobVizIcon />
                  </section>
                  <section className="d-flex justify-content-center align-items-left flex-column ps-3">
                    <h4 className='fw-light text-black mb-0 pb-1'>
                      Jobviz Career Explorer
                    </h4>
                    <span className="text-black">A starting point for students to explore 1,000 job possibilities</span>
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
                  <Link
                    key={lesson.locale + lesson.id}
                    href={`/lessons/${lesson.DefaultLocale}/${lesson.id}`}
                    passHref
                    className='w-100 g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow'
                  >
                    
                    <div className="position-relative overflow-hidden">
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
                        />
                      )}
                    </div>
                    <div className='pt-2 ps-3 d-grid'>
                      <h3 className='w-light text-black mb-0'>{lesson.Title}</h3>
                      <p className='text-black'>{lesson.Subtitle}</p>
                      {/* d-flex flex-column d-sm-block */}
                      <section className="d-flex flex-wrap gap-1 align-self-end">
                        <span className={`badge me-1 lessonSubject bg-${lesson.Section.overview.TargetSubject.toLowerCase().replace(/\s/g, ' ')}`}>
                          {lesson.Section.overview.TargetSubject}
                        </span>
                        <span className="badge rounded-pill bg-gray ml-3">
                          {`${lesson.Section.overview.GradesOrYears}: ${lesson.Section.overview.ForGrades}`}
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