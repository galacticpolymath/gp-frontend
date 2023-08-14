/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import React from 'react';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';
import LessonCard from '../../components/LessonsPg/LessonCard';
import Lessons from '../../backend/models/lesson.js'
import moment from 'moment/moment';
import { useEffect } from 'react';

const LessonsPage = ({ lessons }) => {

  useEffect(() => {
    console.log('lessons: ', lessons)
  })

  const handleJobVizCardClick = () => {
    window.location.href = '/job-viz';
  };

  const uniqueIDs = [];

  const publishedLessons = lessons.filter(({ PublicationStatus, _id }) => {
    const willShowLesson = !uniqueIDs.includes(_id) && (PublicationStatus === 'Live');

    if (willShowLesson) {
      uniqueIDs.push(_id);
    }

    return willShowLesson;
  });

  return (
    <Layout
      title='Galactic Polymath Lesson Releases'
      description='We strive to create mind-expanding learning experiences that a non-specialist can teach in any G5-12 classroom with 15 minutes of prep time!'
      imgSrc='https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png'
      imgAlt='Galactic_Polymath_Logo_Lessons_Page'
      keywords='Galatic Polymath Lessons, Galactic Polymath Learning Tools'
      className='lessons-pg-container'
    >
      <section className="bg-secondary p-4">
        <div className="text-white col-sm-12 col-md-10 col-lg-8 col-xl-7">
          <h1>Free, Interdisciplinary Lessons</h1>
          <p>We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
        </div>
      </section>
      <div>
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
          <section>
            <h4 className="ms-sm-4 text-center text-sm-start mt-4 mb-2 mb-sm-4 text-muted">Galactic Polymath Lesson Releases</h4>
          </section>
          <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
            {publishedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

const PROJECTED_FIELDS = [
  'CoverImage',
  'SubTitle',
  'Title',
  'Section.overview.TargetSubject',
  'Section.overview.GradesOrYears',
  'Section.overview.ForGrades',
  'ReleaseDate',
  'locale',
  'id',
  'PublicationStatus',
]

export async function getStaticProps() {
  try {
    let lessons = await Lessons.find({}, PROJECTED_FIELDS).sort({ ReleaseDate: -1 }).lean();
    lessons = lessons.map(lesson => ({
      ...lesson,
      ReleaseDate: moment(lesson.ReleaseDate).format('YYYY-MM-DD')
    }))
    // console.log('lessonsInDB?.[0]?.ReleaseDate: ', lessonsInDB?.[0]?.ReleaseDate)
    // const res = await fetch('https://catalog.galacticpolymath.com/index.json');
    // let lessons = await res.json();
    // lessons = lessons.filter(({ isTestRepo }) => !isTestRepo);
    console.log('lessons: ', lessons)
    // lessons.sort((lessonA, lessonB) => new Date(lessonB.ReleaseDate) - new Date(lessonA.ReleaseDate));

    // console.log('lessons?.[0]?.ReleaseDate: ', lessons?.[0]?.ReleaseDate)

    return { props: { lessons } };
  } catch (error) {
    console.error('An error has occurred while fetching for lessons. Error message: ', error.message)

    return { props: { lessons: [] } };
  }
}

export default LessonsPage;
