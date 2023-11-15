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
import { connectToMongodb } from '../../backend/utils/connection';

const LessonsPage = ({ lessons, didErrorOccur, lessonsParts }) => {

  const handleJobVizCardClick = () => {
    window.location.href = '/job-viz';
  };

  const uniqueIDs = [];
  const publishedLessons = lessons.filter(({ PublicationStatus, numID }) => {
    const willShowLesson = !uniqueIDs.includes(numID) && (PublicationStatus === 'Live');

    if (willShowLesson) {
      uniqueIDs.push(numID);
    }

    return willShowLesson;
  });

  return (
    <Layout
      title='Galactic Polymath Mini-Unit Releases'
      description='We strive to create mind-expanding learning experiences that a non-specialist can teach in any G5-12 classroom with 15 minutes of prep time!'
      imgSrc='https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png'
      imgAlt='Galactic_Polymath_Logo_Lessons_Page'
      keywords='Galatic Polymath Lessons, Galactic Polymath Learning Tools'
      className='lessons-pg-container'
    >
      <section className="bg-secondary p-4">
        <div className="text-white container">
          <h1>Free, Interdisciplinary Lessons</h1>
          <p className='col-sm-12 col-md-10 col-lg-8 col-xl-7 '>We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!</p>
        </div>
      </section>
      <div>
        <div className='container'>
          <section className="mb-5 pt-2">
            <section className="headerSecLessonsPg">
              <h4 className="ms-sm-4 text-muted  mb-2 mb-sm-4 text-left mt-4 mx-4">
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
                      <span className="text-black text-left text-sm-start mt-1 mt-sm-0">A starting point for students to explore 1,000 job possibilities</span>
                    </section>
                  </section>
                  <section className="w-100 d-flex flex-column ps-sm-3 mt-2 mt-sm-0">
                  </section>
                </div>
              </section>
            </section>
          </section>
          <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
              <h4 className="">Galactic Polymath Mini-Unit Releases</h4>
              <p className='mb-0'> Each unit has 2-6 lessons created through 100s of collaborative hours by scientists, teachers, artists, and filmmakers. </p>
              <p><em>And they&apos;re all free!</em></p>
            </div>
            {!!publishedLessons?.length && (
              <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
                {publishedLessons.map((lesson) => <LessonCard key={lesson._id} lesson={lesson} />)}
              </div>
            )}
            {(!publishedLessons?.length && didErrorOccur) && (
              <div className='px-4 pb-4'>
                <p className='text-center text-sm-start'>An error has occurred. Couldn&apos;t retrieve lessons. Please try again by refreshing the page.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

const PROJECTED_LESSONS_FIELDS = [
  'CoverImage',
  'Subtitle',
  'Title',
  'Section',
  'ReleaseDate',
  'locale',
  '_id',
  'numID',
  'PublicationStatus',
  'LessonBanner',
  'LsnStatuses',
  'Subject',
  'ForGrades',
]

export async function getStaticProps() {
  try {
    await connectToMongodb();

    let lessons = await Lessons.find({}, PROJECTED_LESSONS_FIELDS).sort({ ReleaseDate: -1 }).lean();
    let lessonsParts = [];

    for (let lesson of lessons) {
      if (!lesson?.LsnStatuses?.length) {
        continue;
      }

      let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
      let lessonPartsFromClassRoomObj = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

      if (lessonParts?.length) {
        for (let lsnStatus of lesson.LsnStatuses) {
          if (lsnStatus.status !== 'Live') {
            continue;
          }
          const lessonPart = lessonParts.find(({ lsnNum }) => lsnNum === lsnStatus.lsn);
          const lessonPartFromClassroomObj = lessonPartsFromClassRoomObj.find(({ lsn }) => lsn == lsnStatus.lsn);
          
          if(lessonPart){
            // GET THE following FROM EACH LESSON: 
            // the lesson title 
            // the lesson tile
            // the description of the lesson 
            // the tags 
            // grades 
            // lesson duration
            
            // the lesson unit title
            // the lesson subject
            // lesson grades
            // const lessonPartForUI = {
            //   tile: lessonPartFromClassroomObj.tile, 
            //   tags: lessonPartFromClassroomObj.tags, 
            //   lessonPart: lessonPart.lsnTitle,
            //   dur: lessonPart.lsnDur,
            //   preface: lessonPart.lsnPreface,
            //   lessonPartNum: lessonPart.lsnNum,
            //   lessonTitle: lesson.Title,
            //   subject: lesson.TargetSubject,
            //   grades: lesson.ForGrades,
            // };

            // console.log("lessonPartForUI: ", lessonPartForUI)

            // lessonsParts.push(lessonPartForUI);
          }
        }
      }
    }

    lessons = lessons.map(lesson => {
      const lessonObj = {
        ...lesson,
        ReleaseDate: moment(lesson.ReleaseDate).format('YYYY-MM-DD'),
      };

      delete lessonObj.LsnStatuses

      return lessonObj
    });

    return { props: { lessons: lessons, lessonsParts } };
  } catch (error) {
    console.error('An error has occurred while fetching for lessons. Error message: ', error.message)

    return { props: { lessons: [], didErrorOccur: true } };
  }
}

export default LessonsPage;
