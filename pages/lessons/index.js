/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import React, { useRef, useState } from 'react';
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
import { getGpVids, getLinkPreviewObj, getShowableUnits } from '../../globalFns.js';
import SelectedGpWebApp from '../../components/Modals/SelectedGpWebApp.js';
import GpWebApps from '../../components/LessonsPg/sections/GpWebApps.js';
import { GiShipWheel } from "react-icons/gi";
import LessonSvg from '../../assets/img/gp-lesson-icon.svg';
import UnitIconSvg from '../../assets/img/gp-unit-icon.svg';
import Button from '../../components/General/Button.js';
import Image from 'next/image.js';

const handleJobVizCardClick = () => {
  window.location.href = '/jobviz';
};

const LessonsPage = ({
  units,
  lessonsObj,
  gpVideosObj,
  webAppsObj,
  didErrorOccur,
}) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedGpWebApp, setSelectedGpWebApp] = useState(null);
  const [isGpVideoModalShown, setIsGpVideoModalShown] = useState(false);
  const [isWebAppModalShown, setIsWebAppModalShown] = useState(false);

  const handleGpWebAppCardClick = app => () => {
    setSelectedGpWebApp(app);
    setIsWebAppModalShown(true);
  }

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
      <section className="mb-3 mt-5">
        <div style={{ backgroundColor: "#F0F4FF" }}>
          <div
            className="container w-100 border-top border-bottom px-2 px-xxl-0 px-sm-5 py-2 lessons-nav-section-container"
          >
            <h4 className="p-0 mb-0">
              <span className='h-100'>
                <GiShipWheel style={{ transform: "translateY(-2px)" }} />
              </span>
              <span className='h-100 ms-1'>
                Navigate To:
              </span>
            </h4>
            <section className="d-flex flex-wrap justify-content-sm-start pt-3 ps-sm-3 pt-sm-3">
              <div className="p-1 p-sm-0">
                <div className="bg-white nav-section-btn rounded">
                  <a href='#gp-apps' style={{ background: "none" }} className='no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles'>
                    <span style={{ height: "60%" }} className='d-inline-flex justify-content-center align-items-center'>
                      {/* put icons here */}
                      <img src="favicon-32x32.png" alt="Apps_Icon" style={{ objectFit: 'contain' }} />
                    </span>
                    <span style={{ height: "40%" }} className='d-inline-flex fw-bold'>
                      Apps
                    </span>
                  </a>
                </div>
              </div>
              <div className="p-1 p-sm-0">
                <div className="bg-white nav-section-btn rounded ms-sm-2 ms-md-5">
                  <a href="#gp-videos" style={{ background: "none" }} className='no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles'>
                    <span style={{ height: "60%" }} className="d-inline-flex justify-content-center align-items-center">
                      <i style={{ color: 'red' }} className='bi bi-youtube' />
                    </span>
                    <span style={{ height: "40%" }} className="fw-bold">
                      Videos
                    </span>
                  </a>
                </div>
              </div>
              <div className="p-1 p-sm-0">
                <div className="bg-white nav-section-btn rounded ms-sm-2 ms-md-5">
                  <a href="#gp-units" style={{ background: "none" }} className='no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles'>
                    <span style={{ height: "60%" }}>
                      <Image
                        src={UnitIconSvg}
                        style={{ height: '50px', width: '50px' }}
                        alt='GP Unit Icon'
                      />
                    </span>
                    <span style={{ height: "40%" }} className="fw-bold">
                      Units
                    </span>
                  </a>
                </div>
              </div>
              <div className="p-1 p-sm-0">
                <div className="bg-white nav-section-btn rounded ms-sm-2 ms-md-5">
                  <a href="#gp-lessons" style={{ background: "none" }} className='no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles'>
                    <span style={{ height: "60%" }}>
                      <Image
                        src={LessonSvg}
                        style={{ height: '50px', width: '50px' }}
                        alt='GP Lesson Icon'
                      />
                    </span>
                    <span style={{ height: "40%" }} className="fw-bold">
                      Lessons
                    </span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
      <section>
        <div className='container'>
          <section className="mb-5 pt-2">
            <section className="headerSecLessonsPg">
              <h4 id="gp-apps" style={{ scrollMarginTop: "100px" }} className="ms-sm-4 text-muted  mb-2 mb-sm-4 text-left mt-4 mx-4">
                Galactic Polymath Learning Tools
              </h4>
            </section>
            <section>
              <section className="mx-auto grid pb-1 p-4 gap-3 pt-3">
                <div onClick={handleJobVizCardClick} className="pointer g-col-12 g-col-md-8 g-col-lg-6 g-col-xl-4 mx-md-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow jobVizCardOnLessonsPg">
                  <section className="d-flex flex-column w-100 h-100">
                    <section style={{ height: '205px' }} className="imgSec d-flex justify-content-center align-items-center">
                      <JobVizIcon />
                    </section>
                    <section className="d-flex justify-content-center align-items-left flex-column ps-3">
                      <h4 className='fw-light text-black mb-0 pb-1 text-center mt-1 mt-sm-2 my-2'>
                        Jobviz Career Explorer
                      </h4>
                      <span className="text-black text-center mt-1 mt-sm-0">A starting point for students to explore 1,000 job possibilities</span>
                    </section>
                  </section>
                </div>
                {webAppsObj?.data?.length && (
                  <GpWebApps
                    webApps={webAppsObj.data}
                    handleGpWebAppCardClick={handleGpWebAppCardClick}
                  />
                )}
              </section>
            </section>
          </section>
          <GpVideos
            isLast={gpVideosObj?.isLast}
            startingGpVids={gpVideosObj?.data}
            nextPgNumStartingVal={gpVideosObj?.nextPgNumStartingVal}
            setIsGpVideoModalShown={setIsGpVideoModalShown}
            setSelectedVideo={setSelectedVideo}
            totalVidsNum={gpVideosObj?.totalItemsNum}
          />
          <GpUnits
            units={units}
            didErrorOccur={didErrorOccur}
          />
        </div>
      </section>
      <GpLessons
        isLast={lessonsObj?.isLast}
        startingLessonsToShow={lessonsObj?.data}
        nextPgNumStartingVal={lessonsObj?.nextPgNumStartingVal}
        didErrorOccur={didErrorOccur}
        totalGpLessonsNum={lessonsObj?.totalItemsNum}
      />
      <SelectedGpVideo
        _selectedVideo={[selectedVideo, setSelectedVideo]}
        _isModalShown={[isGpVideoModalShown, setIsGpVideoModalShown]}
      />
      <SelectedGpWebApp
        _selectedGpWebApp={[selectedGpWebApp, setSelectedGpWebApp]}
        _isModalShown={[isWebAppModalShown, setIsWebAppModalShown]}
      />
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
const WEB_APP_PATHS = [
  {
    name: 'dark',
    path: '/into-the-dark.png',
  },
  {
    name: 'echo',
    path: '/echo-sim.png',
  },
];
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
    let webApps = []
    const todaysDate = new Date();

    // getting the lessons and web-apps from each unit
    for (let lesson of lessons) {
      if (!lesson?.LsnStatuses?.length || !SHOWABLE_LESSONS_STATUSES.includes(lesson.PublicationStatus)) {
        continue;
      }

      const multiMediaArr = lesson.Section?.preview?.Multimedia;
      const multiMediaWebAppNoFalsyVals = multiMediaArr?.length ? multiMediaArr.filter(multiMedia => multiMedia) : [];
      const isThereAWebApp = multiMediaWebAppNoFalsyVals?.length ? multiMediaWebAppNoFalsyVals.some(({ type }) => (type === 'web-app') || (type === 'video')) : false;

      console.log('what is up meng...')

      if (isThereAWebApp) {
        for (let numIteration = 0; numIteration < multiMediaArr.length; numIteration++) {
          let multiMediaItem = multiMediaArr[numIteration]

          if (multiMediaItem?.type === 'web-app') {
            const { errMsg, images, title } = await getLinkPreviewObj(multiMediaItem.mainLink);

            if (errMsg && !images?.length) {
              console.error('Failed to get the image preview of web app. Error message: ', errMsg)
              continue
            }

            console.log('hey there meng: ', multiMediaItem)

            multiMediaItem = {
              lessonIdStr: multiMediaItem.forLsn,
              unitNumID: lesson.numID,
              webAppLink: multiMediaItem.mainLink,
              title: multiMediaItem.title,
              unitTitle: lesson.Title,
              description: multiMediaItem.lessonRelevance,
              webAppPreviewImg: (errMsg || !images?.length) ? null : images[0],
              webAppImgAlt: (errMsg || !images?.length) ? null : `${title}'s preview image`,
              pathToFile: WEB_APP_PATHS.find(({ name }) => multiMediaItem.title.toLowerCase().includes(name))?.path ?? null,
            }

            webApps.push(multiMediaItem)
          }
        }
      }

      let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
      let lessonPartsFromClassRoomObj = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

      console.log("lesson.LsnStatuses, yo there: ", lesson?.LsnStatuses);

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

    console.log("lessonPartsForUI: ", lessonPartsForUI)

    const units = getShowableUnits(lessons).map(lesson => {
      const individualLessonsNum = lesson?.LsnStatuses?.length ? lesson.LsnStatuses.filter(({ status }) => status !== 'Hidden')?.length : 0;
      const lessonObj = {
        ...lesson,
        individualLessonsNum,
        ReleaseDate: moment(lesson.ReleaseDate).format('YYYY-MM-DD'),
      };

      delete lessonObj.LsnStatuses;

      return lessonObj;
    });
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
        units: units,
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
        webAppsObj: {
          data: webApps,
          isLast: webApps.length < DATA_PER_PG,
          nextPgNumStartingVal: 1,
          totalItemsNum: webApps.length,
        },
      },
    };
  } catch (error) {
    console.error('An error has occurred while fetching for lessons. Error message: ', error.message)

    return {
      props: {
        units: null,
        lessonsObj: null,
        gpVideosObj: null,
        webAppsObj: null,
        didErrorOccur: true,
      },
    };
  }
}

export default LessonsPage;
