/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import JobVizIcon from '../../components/JobViz/JobVizIcon';
import Lessons from '../../backend/models/lesson.js'
import moment from 'moment/moment';
import Sponsors from '../../components/Sponsors.js';
import { connectToMongodb } from '../../backend/utils/connection';
import SelectedGpVideo from '../../components/LessonsPg/modals/SelectedGpVideo.js';
import { nanoid } from 'nanoid';
import GpVideos from '../../components/LessonsPg/sections/GpVideos.js';
import GpUnits from '../../components/LessonsPg/sections/GpUnits.js';
import GpLessons from '../../components/LessonsPg/sections/GpLessons.js';
import { getGpVids, getShowableUnits } from '../../globalFns.js';

const handleJobVizCardClick = () => {
  window.location.href = '/jobviz';
};

const LessonsPage = ({ unitsObj, lessonsObj, gpVideosObj, didErrorOccur }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isModalShown, setIsModalShown] = useState(false);

  return (
    <Layout
      title='Galactic Polymath Mini-Unit Releases'
      description='We strive to create mind-expanding learning experiences that a non-specialist can teach in any G5-12 classroom with 15 minutes of prep time!'
      imgSrc='https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png'
      imgAlt='Galactic_Polymath_Logo_Lessons_Page'
      keywords='Galatic Polymath Lessons, Galactic Polymath Learning Tools'
      className='lessons-pg-container overflow-hidden'
    >
      <section className="bg-secondary p-4">
        <div className="text-white container">
          <h1 className='responseiveH1'>Free, Interdisciplinary Lessons</h1>
          <p className='col-sm-12 col-md-10 col-lg-8 col-xl-7'>
            We strive to create mind-expanding learning experiences that a non-specialist can teach in <em>any G5-12 classroom</em> with 15 minutes of prep time!
          </p>
        </div>
      </section>
      <section className='w-100 my-5 my-md-3'>
        <div className="container">
          <h4 className="ms-sm-4 text-muted mb-2 mb-sm-4 text-left mt-4 mx-4 pe-lg-5">
            Made open access by these funding organizations and research institutions:
          </h4>
          <Sponsors />
        </div>
      </section>
      <section>
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
          <GpVideos
            isLast={gpVideosObj.isLast}
            startingGpVids={gpVideosObj.data}
            nextPgNumStartingVal={gpVideosObj.nextPgNumStartingVal}
            setIsModalShown={setIsModalShown}
            setSelectedVideo={setSelectedVideo}
            totalVidsNum={gpVideosObj.totalItemsNum}
          />
          <GpUnits
            isLast={unitsObj.isLast}
            startingUnitsToShow={unitsObj.data}
            nextPgNumStartingVal={unitsObj.nextPgNumStartingVal}
            didErrorOccur={didErrorOccur}
            totalGpUnitsNum={unitsObj.totalItemsNum}
          />
        </div>
      </section>
      <GpLessons
        isLast={lessonsObj.isLast}
        startingLessonsToShow={lessonsObj.data}
        nextPgNumStartingVal={lessonsObj.nextPgNumStartingVal}
        didErrorOccur={didErrorOccur}
        totalGpLessonsNum={lessonsObj.totalItemsNum}
      />
      <SelectedGpVideo _selectedVideo={[selectedVideo, setSelectedVideo]} _isModalShown={[isModalShown, setIsModalShown]} />
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
  'TargetSubject',
  'ForGrades',
  'GradesOrYears',
]

const SHOWABLE_LESSONS_STATUSES = ['Live', 'Beta'];
const DATA_PER_PG = 6;

export async function getStaticProps() {
  try {
    await connectToMongodb();

    let lessons = await Lessons.find({}, PROJECTED_LESSONS_FIELDS).sort({ ReleaseDate: -1 }).lean();

    if (!lessons?.length) {
      throw new Error("No lessons were retrieved from the database.");
    }

    let gpVideos = getGpVids(lessons);
    gpVideos = gpVideos.map(vid => vid?.ReleaseDate ? { ...vid, ReleaseDate: JSON.stringify(vid.ReleaseDate) } : vid);
    let lessonPartsForUI = [];
    const todaysDate = new Date();

    // getting the lessons from each unit, storing them into the lessonPartsForUI array
    for (let lesson of lessons) {
      if (!lesson?.LsnStatuses?.length || !SHOWABLE_LESSONS_STATUSES.includes(lesson.PublicationStatus)) {
        continue;
      }

      let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
      let lessonPartsFromClassRoomObj = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

      if (lessonParts?.length) {
        for (let lsnStatus of lesson.LsnStatuses) {
          const wasLessonReleased = moment(todaysDate).format('YYYY-MM-DD') > moment(lsnStatus.unit_release_date).format('YYYY-MM-DD');

          if (!wasLessonReleased) {
            continue;
          }

          if (!SHOWABLE_LESSONS_STATUSES.includes(lsnStatus.status)) {
            continue;
          }

          const lessonPart = lessonParts.find(({ lsnNum }) => lsnNum === lsnStatus.lsn);
          const isLessonInLessonPartsForUIArr = (lessonPartsForUI.length && lessonPart) ? lessonPartsForUI.some(({ lessonPartTitle }) => lessonPartTitle === lessonPart.lsnTitle) : false;

          if (lessonPart && !isLessonInLessonPartsForUIArr) {
            const lessonPartFromClassroomObj = lessonPartsFromClassRoomObj.find(({ lsn }) => lsn == lsnStatus.lsn);
            let tags = Array.isArray(lessonPartFromClassroomObj?.tags?.[0]) ? lessonPartFromClassroomObj?.tags.flat() : lessonPartFromClassroomObj?.tags
            tags = tags?.length ? tags.filter(tag => tag) : tags;
            const lessonPartForUI = {
              tags: tags ?? null,
              lessonPartPath: `/lessons/${lesson.locale}/${lesson.numID}#lesson_part_${lessonPart.lsnNum}`,
              tile: lessonPartFromClassroomObj?.tile ?? 'https://storage.googleapis.com/gp-cloud/icons/Missing_Lesson_Tile_Icon.png',
              lessonPartTitle: lessonPart.lsnTitle,
              dur: lessonPart.lsnDur,
              preface: lessonPart.lsnPreface,
              lessonPartNum: lessonPart.lsnNum,
              lessonTitle: lesson.Title,
              subject: lesson.TargetSubject,
              grades: lesson.ForGrades,
              gradesOrYears: lesson.GradesOrYears,
              status: lsnStatus.status,
            }

            lessonPartsForUI.push(lessonPartForUI);
          }
        }
      }
    }

    lessons = getShowableUnits(lessons).map(lesson => {
      const individualLessonsNum = lesson?.LsnStatuses?.length ? lesson.LsnStatuses.filter(({ status }) => status !== 'Hidden')?.length : 0;
      const lessonObj = {
        ...lesson,
        individualLessonsNum,
        ReleaseDate: moment(lesson.ReleaseDate).format('YYYY-MM-DD'),
      };

      delete lessonObj.LsnStatuses;

      return lessonObj;
    });
    const firstPgOfUnits = lessons.slice(0, DATA_PER_PG);
    let firstPgOfLessons = structuredClone(lessonPartsForUI);

    if (firstPgOfLessons?.length) {
      firstPgOfLessons = firstPgOfLessons.sort(({ sort_by_date: sortByDateLessonA }, { sort_by_date: sortByDateLessonB }) => {
        let _sortByDateLessonA = new Date(sortByDateLessonA);
        let _sortByDateLessonB = new Date(sortByDateLessonB);

        if (_sortByDateLessonA > _sortByDateLessonB) {
          return -1;
        }

        if (_sortByDateLessonA < _sortByDateLessonB) {
          return 1;
        }

        return 0;
      }).slice(0, DATA_PER_PG);
    }

    let gpVideosFirstPg = gpVideos?.length ? gpVideos.sort((videoA, videoB) => JSON.parse(videoB.ReleaseDate) - JSON.parse(videoA.ReleaseDate)).slice(0, DATA_PER_PG) : [];
    gpVideosFirstPg = gpVideosFirstPg?.length ? gpVideosFirstPg.map(vid => ({ ...vid, id: nanoid() })) : gpVideosFirstPg;

    return {
      props: {
        unitsObj: {
          data: firstPgOfUnits,
          isLast: lessons.length < DATA_PER_PG,
          nextPgNumStartingVal: 1,
          totalItemsNum: lessons.length,
        },
        lessonsObj: {
          data: firstPgOfLessons,
          isLast: lessonPartsForUI.length < DATA_PER_PG,
          nextPgNumStartingVal: 1,
          totalItemsNum: lessonPartsForUI.length,

        },
        gpVideosObj: {
          data: gpVideosFirstPg,
          isLast: gpVideos.length < DATA_PER_PG,
          nextPgNumStartingVal: 1,
          totalItemsNum: gpVideos.length,

        },
      },
    };
  } catch (error) {
    console.error('An error has occurred while fetching for lessons. Error message: ', error.message)

    return { props: { lessons: [], didErrorOccur: true } };
  }
}

export default LessonsPage;
