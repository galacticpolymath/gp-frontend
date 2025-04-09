/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import React, { useState } from "react";
import Layout from "../../components/Layout";
import JobVizIcon from "../../components/JobViz/JobVizIcon";
import Lessons from "../../backend/models/lesson.js";
import moment from "moment/moment";
import Sponsors from "../../components/Sponsors.js";
import { connectToMongodb } from "../../backend/utils/connection";
import SelectedGpVideo from "../../components/LessonsPg/modals/SelectedGpVideo.js";
import { nanoid } from "nanoid";
import GpVideos from "../../components/LessonsPg/sections/GpVideos.js";
import GpUnits from "../../components/LessonsPg/sections/GpUnits.js";
import GpLessons from "../../components/LessonsPg/sections/GpLessons.js";
import {
  STATUSES_OF_SHOWABLE_LESSONS,
  getGpVids,
  getLinkPreviewObj,
  getShowableUnits,
} from "../../globalFns.js";
import SelectedGpWebApp from "../../components/Modals/SelectedGpWebApp.js";
import GpWebApps from "../../components/LessonsPg/sections/GpWebApps.js";
import { GiShipWheel } from "react-icons/gi";
import LessonSvg from "../../assets/img/gp-lesson-icon.svg";
import UnitIconSvg from "../../assets/img/gp-unit-icon.svg";
import Image from "next/image.js";

const handleJobVizCardClick = () => {
  window.location.href = "/jobviz";
};

const THIRTY_SEVEN_DAYS = 1_000 * 60 * 60 * 24 * 37;

const LessonsPage = (props) => {
  const {
    units,
    lessonsObj,
    gpVideosObj,
    webAppsObj,
    didErrorOccur,
  } = props;
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedGpWebApp, setSelectedGpWebApp] = useState(null);
  const [isGpVideoModalShown, setIsGpVideoModalShown] = useState(false);
  const [isWebAppModalShown, setIsWebAppModalShown] = useState(false);

  const handleGpWebAppCardClick = (app) => () => {
    setSelectedGpWebApp(app);
    setIsWebAppModalShown(true);
  };

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <Layout
      title="Galactic Polymath Mini-Unit Releases"
      description="We strive to create mind-expanding learning experiences that a non-specialist can teach in any G5-12 classroom with 15 minutes of prep time!"
      imgSrc="https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png"
      imgAlt="Galactic_Polymath_Logo_Lessons_Page"
      keywords="Galatic Polymath Lessons, Galactic Polymath Learning Tools"
      className="lessons-pg-container overflow-hidden"
    >
      <section
        style={{
          backgroundImage: `url(${origin}/imgs/lessons/lessons-hero.png)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
        className="py-sm-4 py-5 d-flex justify-content-center"
      >
        <div className="text-white lessons-pg-sec lessons-pg-sec-max-width w-100">
          <h1 className="responseiveH1">Free, Interdisciplinary Lessons</h1>
          <p className="col-sm-12 col-md-10 col-lg-8 col-xl-7">
            We strive to create mind-expanding learning experiences that a
            non-specialist can teach in <em>any G5-12 classroom</em> with 15
            minutes of prep time!
          </p>
        </div>
      </section>
      <section className="mb-3 mt-4 d-flex justify-content-center align-items-center">
        <div
          className="border-top border-bottom w-100"
          style={{ backgroundColor: "#F0F4FF" }}
        >
          <div className="d-flex justify-content-center align-items-center">
            <div className="w-100 container lessons-pg-sec py-2 lessons-nav-section-container">
              <h4 className="p-0 mb-0">
                <span className="h-100">
                  <GiShipWheel style={{ transform: "translateY(-2px)" }} />
                </span>
                <span className="h-100 ms-1">Navigate To:</span>
              </h4>
              <section
                style={{ width: "85%" }}
                className="d-flex flex-wrap justify-content-sm-start pt-3"
              >
                <div className="m-1 m-md-0 mx-md-2 p-1 p-sm-0 d-flex justify-content-center align-items-center">
                  <div className="bg-white nav-section-btn rounded">
                    <a
                      href="#gp-units"
                      style={{ background: "none" }}
                      className="no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles"
                    >
                      <span style={{ height: "60%" }}>
                        <Image
                          src={UnitIconSvg}
                          style={{ height: "50px", width: "50px" }}
                          alt="GP Unit Icon"
                        />
                      </span>
                      <span style={{ height: "40%" }} className="fw-bold">
                        Units
                      </span>
                    </a>
                  </div>
                </div>
                <div className="nav-card m-1 m-md-0 mx-md-2 p-1 p-sm-0 d-flex justify-content-center align-items-center">
                  <div className="bg-white nav-section-btn rounded">
                    <a
                      href="#gp-apps"
                      style={{ background: "none" }}
                      className="no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles"
                    >
                      <span
                        style={{ height: "60%" }}
                        className="d-inline-flex justify-content-center align-items-center"
                      >
                        {/* put icons here */}
                        <img
                          src="favicon-32x32.png"
                          alt="Apps_Icon"
                          style={{ objectFit: "contain" }}
                        />
                      </span>
                      <span
                        style={{ height: "40%" }}
                        className="d-inline-flex fw-bold"
                      >
                        Apps
                      </span>
                    </a>
                  </div>
                </div>
                <div className="nav-card m-1 m-md-0 mx-md-2 p-1 p-sm-0 d-flex justify-content-center align-items-center">
                  <div className="bg-white nav-section-btn rounded">
                    <a
                      href="#gp-videos"
                      style={{ background: "none" }}
                      className="no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles"
                    >
                      <span
                        style={{ height: "60%" }}
                        className="d-inline-flex justify-content-center align-items-center"
                      >
                        <i style={{ color: "red" }} className="bi bi-youtube" />
                      </span>
                      <span style={{ height: "40%" }} className="fw-bold">
                        Videos
                      </span>
                    </a>
                  </div>
                </div>
                <div className="nav-card m-1 m-md-0 mx-md-2 p-1 p-sm-0 d-flex justify-content-center align-items-center">
                  <div className="bg-white nav-section-btn rounded">
                    <a
                      href="#gp-lessons"
                      style={{ background: "none" }}
                      className="no-link-decoration txt-underline-on-hover w-100 h-100 d-flex flex-column justify-content-center align-items-center no-btn-styles"
                    >
                      <span style={{ height: "60%" }}>
                        <Image
                          src={LessonSvg}
                          style={{ height: "50px", width: "50px" }}
                          alt="GP Lesson Icon"
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
        </div>
      </section>
      <section className="d-flex justify-content-center align-items-center">
        <div className="lessons-pg-sec lessons-pg-sec-max-width">
          <GpUnits units={units} didErrorOccur={didErrorOccur} />
          <section className="my-4 my-md-3 d-flex justify-content-center align-items-center img-background-container lessons-section-border-top lessons-section-border-bottom">
            <div style={{ width: '86%', maxWidth: '1240px' }} className="sponsors-container-lessons">
              <h4 className="text-muted mb-3 mb-sm-5 text-left mt-2 mt-sm-4 pe-lg-5">
                Made open access by these funding organizations and research
                institutions:
              </h4>
              <Sponsors
                decimal={0.24}
                parentContainerCss="d-flex justify-content-center align-items-center sponsor-container-lessons-pg"
              />
            </div>
          </section>
          <section className="mb-5 pt-2 lessonsSection">
            <section className="headerSecLessonsPg d-flex flex-column flex-sm-row">
              <section className="d-flex justify-content-sm-center align-items-sm-center">
                <img
                  src="GP_bubbleLogo300px.png"
                  alt="Apps_Icon"
                  style={{ objectFit: "contain", width: 100, height: 100 }}
                />
              </section>
              <section className="d-flex justify-content-center align-items-center">
                <h4
                  id="gp-apps"
                  style={{ scrollMarginTop: "100px" }}
                  className="text-muted mb-2 mb-sm-0 text-left mx-2"
                >
                  Galactic Polymath Learning Tools
                </h4>
              </section>
            </section>
            <section>
              <section className="mx-auto grid pb-1 p-4 gap-3 pt-3">
                <div
                  onClick={handleJobVizCardClick}
                  className="pointer g-col-12 g-col-lg-6 g-col-xl-4 mx-md-auto d-grid p-3 bg-white rounded-3 lessonsPgShadow jobVizCardOnLessonsPg"
                >
                  <section className="d-flex flex-column w-100 h-100">
                    <section
                      style={{ height: "205px" }}
                      className="imgSec d-flex justify-content-center align-items-center"
                    >
                      <JobVizIcon />
                    </section>
                    <section className="d-flex justify-content-center align-items-left flex-column ps-3">
                      <h4 className="fw-light text-black mb-0 pb-1 text-left mt-1 mt-sm-2 my-2">
                        Jobviz Career Explorer
                      </h4>
                      <span className="text-black text-left mt-1 mt-sm-0">
                        A starting point for students to explore 1,000 job
                        possibilities
                      </span>
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
        </div>
      </section>
      <section className="d-flex justify-content-center align-items-center">
        <GpLessons
          isLast={lessonsObj?.isLast}
          startingLessonsToShow={lessonsObj?.data}
          nextPgNumStartingVal={lessonsObj?.nextPgNumStartingVal}
          didErrorOccur={didErrorOccur}
          totalGpLessonsNum={lessonsObj?.totalItemsNum}
        />
      </section>
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
  "CoverImage",
  "Subtitle",
  "Title",
  "Section",
  "ReleaseDate",
  "locale",
  "_id",
  "numID",
  "PublicationStatus",
  "LessonBanner",
  "LsnStatuses",
  "TargetSubject",
  "ForGrades",
  "GradesOrYears",
];
const WEB_APP_PATHS = [
  {
    name: "dark",
    path: "/into-the-dark.png",
  },
  {
    name: "echo",
    path: "/echo-sim.png",
  },
];
const DATA_PER_PG = 6;

function getIsUnitNew(releaseDate, now) {
  const releaseDateMilliseconds = new Date(releaseDate).getTime();
  const endDateOfNewReleaseMs = releaseDateMilliseconds + THIRTY_SEVEN_DAYS;
  const isNew = now > releaseDateMilliseconds && now < endDateOfNewReleaseMs;

  return isNew;
}

export async function getStaticProps() {
  try {
    const { wasSuccessful } = await connectToMongodb();

    if (!wasSuccessful) {
      throw new Error("Failed to connect to the database.");
    }

    let lessons = await Lessons.find({}, PROJECTED_LESSONS_FIELDS)
      .sort({ ReleaseDate: -1 })
      .lean();

    if (!lessons?.length) {
      throw new Error("No lessons were retrieved from the database.");
    }

    let gpVideos = getGpVids(lessons);
    gpVideos = gpVideos.map((vid) =>
      vid?.ReleaseDate
        ? { ...vid, ReleaseDate: JSON.stringify(vid.ReleaseDate) }
        : vid
    );
    let lessonPartsForUI = [];
    let webApps = [];
    const todaysDate = new Date();
    const now = todaysDate.getTime();

    // getting the lessons and web-apps from each unit
    for (let lesson of lessons) {
      if (
        !lesson?.LsnStatuses?.length ||
        !STATUSES_OF_SHOWABLE_LESSONS.includes(lesson.PublicationStatus)
      ) {
        continue;
      }

      const multiMediaArr = lesson.Section?.preview?.Multimedia;
      const multiMediaWebAppNoFalsyVals = multiMediaArr?.length
        ? multiMediaArr.filter((multiMedia) => multiMedia)
        : [];
      const isThereAWebApp = multiMediaWebAppNoFalsyVals?.length
        ? multiMediaWebAppNoFalsyVals.some(
          ({ type }) => type === "web-app" || type === "video"
        )
        : false;

      // retrieve the web apps of the units
      if (isThereAWebApp) {
        for (let index = 0; index < multiMediaArr.length; index++) {
          let multiMediaItem = multiMediaArr[index];

          if (multiMediaItem?.type === "web-app") {
            const isPresentInWebApps = webApps.find(
              (webApp) => webApp.webAppLink === multiMediaItem.mainLink
            );

            if (isPresentInWebApps) {
              continue;
            }

            const { errMsg, images, title } = await getLinkPreviewObj(
              multiMediaItem.mainLink
            );

            if (errMsg && !images?.length) {
              console.error(
                "Failed to get the image preview of web app. Error message: ",
                errMsg
              );
              continue;
            }

            multiMediaItem = {
              lessonIdStr: multiMediaItem.forLsn,
              unitNumID: lesson.numID,
              webAppLink: multiMediaItem.mainLink,
              title: multiMediaItem.title,
              unitTitle: lesson.Title,
              description: multiMediaItem.lessonRelevance,
              webAppPreviewImg: errMsg || !images?.length ? null : images[0],
              webAppImgAlt:
                errMsg || !images?.length ? null : `${title}'s preview image`,
              pathToFile:
                WEB_APP_PATHS.find(({ name }) =>
                  multiMediaItem.title.toLowerCase().includes(name)
                )?.path ?? (images?.length ? images[0] : null),
            };

            webApps.push(multiMediaItem);
          }
        }
      }

      console.log("webApps, bacon: ", webApps.length);

      let lessonParts = lesson?.Section?.["teaching-materials"]?.Data?.lesson;
      let lessonPartsFromClassRoomObj =
        lesson?.Section?.["teaching-materials"]?.Data?.classroom?.resources?.[0]
          ?.lessons;

      // retrieve the individual lessons
      if (lessonParts?.length) {
        for (let lsnStatus of lesson.LsnStatuses) {
          const wasLessonReleased =
            moment(todaysDate).format("YYYY-MM-DD") >
            moment(lsnStatus.unit_release_date).format("YYYY-MM-DD");

          if (!wasLessonReleased) {
            continue;
          }

          if (!STATUSES_OF_SHOWABLE_LESSONS.includes(lsnStatus.status)) {
            continue;
          }

          const lessonPart = lessonParts.find(
            ({ lsnNum }) => lsnNum === lsnStatus.lsn
          );
          const isLessonInLessonPartsForUIArr =
            lessonPartsForUI.length && lessonPart
              ? lessonPartsForUI.some(
                ({ lessonPartTitle }) =>
                  lessonPartTitle === lessonPart.lsnTitle
              )
              : false;

          if (lessonPart && !isLessonInLessonPartsForUIArr) {
            const lessonPartFromClassroomObj = lessonPartsFromClassRoomObj.find(
              ({ lsn }) => lsn == lsnStatus.lsn
            );
            let tags = Array.isArray(lessonPartFromClassroomObj?.tags?.[0])
              ? lessonPartFromClassroomObj?.tags.flat()
              : lessonPartFromClassroomObj?.tags;
            tags = tags?.length ? tags.filter((tag) => tag) : tags;
            const lessonPartForUI = {
              tags: tags ?? null,
              lessonPartPath: `/lessons/${lesson.locale}/${lesson.numID}#lesson_part_${lessonPart.lsnNum}`,
              tile:
                lessonPartFromClassroomObj?.tile ??
                "https://storage.googleapis.com/gp-cloud/icons/Missing_Lesson_Tile_Icon.png",
              lessonPartTitle: lessonPart.lsnTitle,
              dur: lessonPart.lsnDur,
              preface: lessonPart.lsnPreface,
              lessonPartNum: lessonPart.lsnNum,
              lessonTitle: lesson.Title,
              subject: lesson.TargetSubject,
              grades: lesson.ForGrades,
              gradesOrYears: lesson.GradesOrYears,
              status: lsnStatus.status,
            };

            lessonPartsForUI.push(lessonPartForUI);
          }
        }
      }
    }

    const units = getShowableUnits(lessons).map((lesson) => {
      const individualLessonsNum = lesson?.LsnStatuses?.length
        ? lesson.LsnStatuses.filter(({ status }) => status !== "Hidden")?.length
        : 0;
      const lessonObj = {
        ...lesson,
        individualLessonsNum,
        ReleaseDate: moment(lesson.ReleaseDate).format("YYYY-MM-DD"),
        isNew: getIsUnitNew(lesson.ReleaseDate, now),
      };

      delete lessonObj.LsnStatuses;

      return lessonObj;
    });
    let firstPgOfLessons = structuredClone(lessonPartsForUI);

    if (firstPgOfLessons?.length) {
      firstPgOfLessons = firstPgOfLessons
        .sort(
          (
            { sort_by_date: sortByDateLessonA },
            { sort_by_date: sortByDateLessonB }
          ) => {
            let _sortByDateLessonA = new Date(sortByDateLessonA);
            let _sortByDateLessonB = new Date(sortByDateLessonB);

            if (_sortByDateLessonA > _sortByDateLessonB) {
              return -1;
            }

            if (_sortByDateLessonA < _sortByDateLessonB) {
              return 1;
            }

            return 0;
          }
        )
        .slice(0, DATA_PER_PG);
    }

    let gpVideosFirstPg = gpVideos?.length
      ? gpVideos
        .sort(
          (videoA, videoB) =>
            JSON.parse(videoB.ReleaseDate) - JSON.parse(videoA.ReleaseDate)
        )
        .slice(0, DATA_PER_PG)
      : [];
    gpVideosFirstPg = gpVideosFirstPg?.length
      ? gpVideosFirstPg.map((vid) => ({ ...vid, id: nanoid() }))
      : gpVideosFirstPg;

    return {
      props: {
        units,
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
      revalidate: 30,
    };
  } catch (error) {
    console.error(
      "An error has occurred while fetching for lessons. Error message: ",
      error.message
    );

    return {
      props: {
        units: null,
        lessonsObj: null,
        gpVideosObj: null,
        webAppsObj: null,
        didErrorOccur: true,
      },
      revalidate: 30,
    };
  }
}

export default LessonsPage;
