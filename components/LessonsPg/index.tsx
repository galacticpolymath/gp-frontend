/* eslint-disable quotes */

import Image from "next/image";
import UnitIconSvg from "../../assets/img/gp-unit-icon.svg";
import LessonSvg from "../../assets/img/gp-lesson-icon.svg";
import Layout from "../Layout";
import GpWebApps from "./sections/GpWebApps";
import { GiShipWheel } from "react-icons/gi";
import { ICurrentUnits } from "../../types/global";
import Sponsors from "../Sponsors";
import JobVizIcon from "../JobViz/JobVizIcon";
import React, { useEffect, useState } from "react";
import GpUnitVideos from "./sections/GpUnitVideos";
import GpUnitLessons from "./sections/GpUnitLessons";
import SelectedGpVideo from "./modals/SelectedGpVideo";
import SelectedGpWebApp from "../Modals/SelectedGpWebApp";
import CurrentGpUnits from "./sections/CurrentGpUnits";
import { TWebAppForUI } from "../../backend/models/WebApp";

const handleJobVizCardClick = () => {
  window.location.href = "/jobviz";
};

const UnitsPg: React.FC<ICurrentUnits & { didErrorOccur?: boolean }> = ({
  units,
  gpVideos,
  lessons,
  webApps,
  didErrorOccur,
}) => {
  useEffect(() => {
    console.log({ webApps });
  });

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedGpWebApp, setSelectedGpWebApp] = useState<null | TWebAppForUI>(
    null
  );
  const [isWebAppModalShown, setIsWebAppModalShown] = useState(false);
  const [isGpVideoModalShown, setIsGpVideoModalShown] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const handleGpWebAppCardClick = (app: TWebAppForUI) => {
    setSelectedGpWebApp(app);
    setIsWebAppModalShown(true);
  };

  return (
    <Layout
      url="https://www.galacticpolymath.com/lessons"
      style={{}}
      langLinks={[]}
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
          paddingTop: "4rem",
        }}
        className="pb-5 d-flex justify-content-center"
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
          <CurrentGpUnits
            units={units?.data ?? []}
            didErrorOccur={!!didErrorOccur}
          />
          <section className="my-4 my-md-3 d-flex justify-content-center align-items-center img-background-container lessons-section-border-top lessons-section-border-bottom">
            <div
              style={{ width: "86%", maxWidth: "1240px" }}
              className="sponsors-container-lessons"
            >
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
                      <JobVizIcon isOnJobVizPg={false} />
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
                {webApps?.data?.length && (
                  <GpWebApps
                    webApps={webApps.data}
                    handleGpWebAppCardClick={handleGpWebAppCardClick}
                  />
                )}
              </section>
            </section>
          </section>
          <GpUnitVideos
            isLast={gpVideos?.isLast}
            data={gpVideos?.data}
            setIsGpVideoModalShown={setIsGpVideoModalShown}
            setSelectedVideo={setSelectedVideo}
            totalItemsNum={gpVideos?.totalItemsNum}
            didErrorOccur={!!didErrorOccur}
          />
        </div>
      </section>
      <section className="d-flex justify-content-center align-items-center">
        <GpUnitLessons
          isLast={!!lessons?.isLast}
          data={lessons?.data ?? []}
          didErrorOccur={!!didErrorOccur}
          totalItemsNum={lessons?.totalItemsNum ?? 0}
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

export default UnitsPg;
