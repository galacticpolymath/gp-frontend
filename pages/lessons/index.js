/* eslint-disable react/jsx-key */
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
import IndividualLesson from '../../components/LessonsPg/IndividualLesson.js';
import Sponsors from '../../components/Sponsors.js';
import GpLessonSvg from '../../assets/img/gp-lesson-icon.svg'
import UnitIconSvg from '../../assets/img/gp-unit-icon.svg'
import Image from 'next/image';
import Pill from '../../components/Pill.js';
import VideoCard from "../../components/LessonsPg/VideoCard.js";
import { connectToMongodb } from '../../backend/utils/connection';
import { getVideoThumb } from '../../components/LessonSection/Preview/utils.js';

const getLessonImgSrc = lesson => {
  const { CoverImage, LessonBanner } = lesson;

  if (lesson.PublicationStatus === "Coming Soon") {
    return "https://storage.googleapis.com/gp-cloud/icons/coming-soon_Banner.png"
  }

  if (LessonBanner && !(CoverImage && CoverImage.url)) {
    return LessonBanner;
  }

  return CoverImage.url
}

const UnshowableLesson = () => (
  <div
    className="w-100 pointer d-flex justify-content-center align-items-center disable-underline-a-tags g-col-sm-12 g-col-md-6 g-col-lg-6 g-col-xl-4 mx-auto d-grid p-3 bg-white rounded-3 cardsOnLessonPg"
  >
    <p style={{ fontWeight: 700 }} className="text-center">Not shown on Lessons page.</p>
  </div>
);

const handleJobVizCardClick = () => {
  window.location.href = '/jobviz';
};

const STATUSES_OF_SHOWABLE_LESSONS = ['Live', 'Proto', 'Beta', 'Coming Soon'];

const LessonsPage = ({ lessons, didErrorOccur, lessonParts, gpVideos }) => {
  const uniqueIDs = [];
  const lessonsToShow = lessons.filter(({ numID, PublicationStatus, ReleaseDate }) => {
    const willShowLesson = STATUSES_OF_SHOWABLE_LESSONS.includes(PublicationStatus) && !uniqueIDs.includes(numID) &&
      moment(ReleaseDate).format('YYYY-MM-DD') < moment(Date()).format('YYYY-MM-DD');

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
          <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
              <div className="d-flex">
                <h4 className="d-flex justify-content-center align-items-center">
                  Galactic Polymath Videos
                </h4>
              </div>
            </div>
            <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
              {gpVideos?.length && (
                gpVideos.map((videoObj, index) => {
                  return <VideoCard key={index} videoObj={videoObj} />
                })
              )}
            </div>
          </section>
          <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
              <div className="d-flex">
                <Image src={UnitIconSvg} style={{ height: 'fit-content' }} alt='GP Unit Icon' />
                <h4 className="d-flex justify-content-center align-items-center">Galactic Polymath Mini-Unit Releases</h4>
              </div>
              <p className='mt-2 mb-0'> Each unit has 2-6 lessons created through 100s of collaborative hours by scientists, teachers, artists, and filmmakers. </p>
              <p><em>And they&apos;re all free!</em></p>
            </div>
            {!!lessonsToShow?.length && (
              <div className='mx-auto grid pb-1 p-4 gap-3 pt-3 pb-5'>
                {lessonsToShow.map((lesson, index) => {
                  return (
                    (lesson.PublicationStatus === "Proto") ?
                      <UnshowableLesson key={index} />
                      : (
                        <LessonCard
                          key={lesson._id}
                          lesson={lesson}
                          lessonImgSrc={getLessonImgSrc(lesson)}
                          BetaPillComp={(lesson.PublicationStatus === "Beta") || (lesson.PublicationStatus === "Draft") ? <Pill /> : null}
                        />
                      )
                  )
                })}
              </div>
            )}
            {(!lessonsToShow?.length && didErrorOccur) && (
              <div className='px-4 pb-4'>
                <p className='text-center text-sm-start'>An error has occurred. Couldn&apos;t retrieve lessons. Please try again by refreshing the page.</p>
              </div>
            )}
          </section>
        </div>
      </section>
      <section>
        <div className='container'>
          <section className="lessonsSection pt-1">
            <div className='ms-sm-4 galactic-black  mb-2 mb-sm-4 text-left mt-4 mx-4'>
              <div className="d-flex">
                <Image src={GpLessonSvg} style={{ height: 'fit-content' }} alt='GP Unit Icon' />
                <h4 className="d-flex justify-content-center align-items-center">Galactic Polymath Individual Lessons</h4>
              </div>
              <p className='mt-2 mb-0'>Free lessons to engage students in current research, real world problems, and interdisciplinary thinking.</p>
            </div>
            {!!lessonParts?.length && (
              <div className='mx-auto grid justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch pb-1 px-2 p-sm-4 gap-3 pt-3 pb-5'>
                {lessonParts.map((lesson, index) => {
                  return (
                    <IndividualLesson
                      key={index}
                      Pill={lesson.status === "Beta" ? <Pill xCoordinate={23} yCoordinate={-19} /> : null}
                      lesson={{ ...lesson, _id: index }}
                    />
                  );
                })}
              </div>
            )}
            {(!lessonsToShow?.length && didErrorOccur) && (
              <div className='px-4 pb-4'>
                <p className='text-center text-sm-start'>An error has occurred. Couldn&apos;t retrieve lessons. Please try again by refreshing the page.</p>
              </div>
            )}
          </section>
        </div>
      </section>
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

const getCovertDateStrToDateObj = mmddyyyy => {
  try {
    if (typeof mmddyyyy === "string") {
      throw new Error("Invalid date string. Must be a string.")
    }

    return new Date(`${mmddyyyy} UTC`).toISOString().split("T")[0];
  } catch (error) {
    console.error("An error has occurred in converting date string to a date object: ", error)
    console.error("Passed in incorrect date string. Receieved: ", mmddyyyy)

    return null
  }

}

export async function getStaticProps() {
  try {
    await connectToMongodb();

    let lessons = await Lessons.find({}, PROJECTED_LESSONS_FIELDS).sort({ ReleaseDate: -1 }).lean();

    if (!lessons?.length) {
      throw new Error("No lessons were retrieved from the database.");
    }

    let gpVideos = []

    for (const lesson of lessons) {
      let lessonMultiMediaArr = [];
      const { Section, Title, numID } = lesson;

      if (Section?.preview?.Multimedia?.length) {
        for (const media of Section.preview.Multimedia) {
          if ((media.by === "Galactic Polymath") && (media.type === "video") && ((typeof media.mainLink === 'string') && media.mainLink.includes('youtube'))) {
            lessonMultiMediaArr.push({
              lessonUnitTitle: Title,
              videoTitle: media.title,
              mainLink: media.mainLink,
              description: media.description,
              thumbnail: getVideoThumb(media.mainLink),
              lessonUnitNumId: numID,
              lessonNum: (media.forLsn && Number.isInteger(+media.forLsn)) ? parseInt(media.forLsn) : null,
            })
          }
        }
      }

      if (lessonMultiMediaArr.length) {
        gpVideos.push(...lessonMultiMediaArr)
      }
    }

    let lessonPartsForUI = [];

    for (let lesson of lessons) {
      if (!lesson?.LsnStatuses?.length || !SHOWABLE_LESSONS_STATUSES.includes(lesson.PublicationStatus)) {
        continue;
      }

      let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
      let lessonPartsFromClassRoomObj = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

      if (lessonParts?.length) {
        for (let lsnStatus of lesson.LsnStatuses) {

          if (!SHOWABLE_LESSONS_STATUSES.includes(lsnStatus.status)) {
            continue;
          }

          const lessonPart = lessonParts.find(({ lsnNum }) => lsnNum === lsnStatus.lsn);

          if (lessonPart) {
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

    lessons = lessons.map(lesson => {
      const individualLessonsNum = lesson?.LsnStatuses?.length ? lesson.LsnStatuses.filter(({ status }) => status !== 'Hidden')?.length : 0;
      const lessonObj = {
        ...lesson,
        individualLessonsNum,
        ReleaseDate: moment(lesson.ReleaseDate).format('YYYY-MM-DD'),
      };

      delete lessonObj.LsnStatuses

      return lessonObj
    });

    let lessonParts = structuredClone(lessonPartsForUI);

    if (lessonParts?.length) {
      lessonParts = lessonParts.sort(({ sort_by_date: sortByDateLessonA }, { sort_by_date: sortByDateLessonB }) => {
        let _sortByDateLessonA = new Date(sortByDateLessonA);
        let _sortByDateLessonB = new Date(sortByDateLessonB);

        if (_sortByDateLessonA > _sortByDateLessonB) {
          return -1;
        }

        if (_sortByDateLessonA < _sortByDateLessonB) {
          return 1;
        }

        return 0;
      })
    }

    return { props: { lessons: lessons, lessonParts: lessonParts, gpVideos: gpVideos } };
  } catch (error) {
    console.error('An error has occurred while fetching for lessons. Error message: ', error.message)

    return { props: { lessons: [], didErrorOccur: true } };
  }
}

export default LessonsPage;
