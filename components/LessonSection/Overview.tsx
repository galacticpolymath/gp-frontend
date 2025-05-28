/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import RichText from "../RichText";
import { useMemo, useRef } from "react";
import useLessonElementInView from "../../customHooks/useLessonElementInView";
import Title, { ITitleProps } from "./Title";
import { ISectionDots, TUseStateReturnVal } from "../../types/global";
import { TOverviewForUI } from "../../backend/models/Unit/types/overview";
import { TUnitForUI } from "../../backend/models/Unit/types/unit";
import Standards from "./Standards";
import { ITargetStandardsCode } from "../../backend/models/Unit/types/standards";

interface IOverviewProps
  extends ITitleProps,
    Pick<TOverviewForUI, "TheGist" | "EstUnitTime"> {
  Accessibility: TOverviewForUI["Accessibility"];
  Description: string;
  EstLessonTime: string;
  ForGrades: string[];
  GradesOrYears: string[];
  LearningSummary: string;
  SectionTitle: string;
  TargetStandardsCodes?: TUnitForUI["TargetStandardsCodes"];
  SteamEpaulette: string;
  SteamEpaulette_vert: string;
  Tags: TOverviewForUI["Tags"];
  TargetSubject: string;
  Text: string;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
}

const Overview = ({
  LearningSummary,
  Description,
  EstLessonTime,
  ForGrades,
  TargetSubject,
  SteamEpaulette,
  SteamEpaulette_vert,
  Text,
  Tags,
  GradesOrYears,
  _sectionDots,
  SectionTitle,
  TheGist,
  EstUnitTime,
  TargetStandardsCodes,
  Accessibility,
  ...titleProps
}: IOverviewProps) => {
  console.log("TargetStandardsCodes: ", TargetStandardsCodes);

  const areTargetStandardsValid = TargetStandardsCodes?.every(
    (standard) =>
      typeof standard?.code === "string" &&
      typeof standard?.dim === "string" &&
      typeof standard?.set === "string" &&
      typeof standard?.subject === "string"
  );
  let standards: Record<string, Omit<ITargetStandardsCode, "set">[]> = {};

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    descriptor: Omit<ITargetStandardsCode, "set">
  ) => {
    event.preventDefault();
    const code = (event.target as HTMLAnchorElement).href.split("#")[1];
    console.log("code: ", code);
    console.log("descriptor: ", descriptor);
    const el = document.getElementById(descriptor.code);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center", // This centers the element vertically in the viewport
      });
      el.className += " bounce-animation";
      setTimeout(() => {
        el.className = el.className.replace(" bounce-animation", "");
      }, 3500);
      return;
    }

    const elementDim = document.getElementById(descriptor.dim);

    if (elementDim) {
      elementDim.scrollIntoView({
        behavior: "smooth",
        block: "center", // This centers the element vertically in the viewport
      });
      elementDim.className += " bounce-animation";
      setTimeout(() => {
        elementDim.className = elementDim.className.replace(
          " bounce-animation",
          ""
        );
      }, 3500);
      return;
    }

    console.log("code: ", code);
  };

  if (areTargetStandardsValid && TargetStandardsCodes) {
    standards = TargetStandardsCodes.reduce(
      (accum, stardardCodesProp, index) => {
        console.log("index, yo there: ", index);
        console.log("stardardCodesProp: ", stardardCodesProp);

        const { set, code, dim, subject } = stardardCodesProp;

        if (set in accum) {
          return {
            ...accum,
            [set]: [...accum[set], { code, dim, subject }],
          };
        }

        return {
          ...accum,
          [set]: [{ code, dim, subject }],
        };
      },
      standards
    );
  }

  const ref = useRef(null);
  const { h2Id } = useLessonElementInView(_sectionDots, "0. Overview", ref);
  const _h2Id = SectionTitle.toLowerCase()
    .replace(/[0-9.]/g, "")
    .trim()
    .replace(/ /g, "-");
  const isAccessibilityValid = useMemo(() => {
    return (
      Accessibility?.length &&
      Accessibility.every(
        (val) =>
          typeof val.Description === "string" && typeof val.Link === "string"
      )
    );
  }, []);

  return (
    <div
      id="overview_sec"
      ref={ref}
      className={`SectionHeading container mb-4 px-0 position-relative ${
        SectionTitle?.replace(/[\s!]/gi, "_")?.toLowerCase() ?? ""
      }`}
    >
      <div
        id={h2Id}
        style={{ height: 30, width: 30, transform: "translateY(-45px)" }}
        className="position-absolute"
      />
      <div
        id={_h2Id}
        style={{ height: 30, width: 30, transform: "translateY(-45px)" }}
        className="position-absolute"
      />
      <Title {...titleProps} />
      <div className="d-flex flex-column flex-xxl-row mt-sm-4 mt-md-0 mt-xxl-2 container px-0 mx-0">
        <div className="col-xxl-12 bg-light-gray px-4 py-2 rounded-3 text-center">
          {(LearningSummary || TheGist) && (
            <div className="g-col-12 bg-white p-3 rounded-3 mt-2 text-start  align-items-center">
              <Image
                src="/imgs/gp_logo_gradient_transBG.png"
                alt="Galactic_PolyMath_First_Sec_Mobile_Info"
                style={{ objectFit: "contain" }}
                className="d-inline-flex me-2 mb-2"
                height={30}
                width={30}
              />
              <h5 className="d-inline-flex">The Gist:</h5>
              <div id="unit-learning-summary">
                <RichText content={LearningSummary ?? TheGist} />
              </div>
            </div>
          )}
          <div className="grid mx-auto gap-3 py-3 justify-content-center justify-content-sm-start">
            <div className="d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3">
              <span>
                <i className="fs-3 mb-2 bi-book-half me-2"></i>
                <h5 className="d-inline-block" id="selectedLessonTitle">
                  Target Subject:{" "}
                </h5>
              </span>
              <div id="unit-target-subject">{TargetSubject}</div>
            </div>
            <div className="d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3 ">
              <span>
                <i className="fs-3 mb-2 me-2 bi-person-circle"></i>
                <h5 className="d-inline-block">{GradesOrYears}: </h5>
              </span>
              <div>{ForGrades}</div>
            </div>
            <div className="d-none d-sm-grid g-col g-col-sm-4 bg-white pt-sm-3 pe-sm-4 pb-sm-3 ps-sm-2 p-md-3 rounded-3">
              <span>
                <i className="fs-3 mb-2 me-2 bi-alarm"></i>
                <h5 className="d-inline-block">Estimated Time: </h5>
                <div id="est-time-testing">{EstLessonTime ?? EstUnitTime}</div>
              </span>
            </div>
            <div className="d-sm-none g-col-12 align-items-center justify-content-center">
              <div className="d-grid bg-white rounded-3 col-12 p-3">
                <i className="fs-3 mb-2 d-block bi-book-half"></i>
                <h5>Target Subject: </h5>
                <span>{TargetSubject}</span>
              </div>
            </div>
            <div className="d-sm-none g-col-12 align-items-center justify-content-center">
              <div className="d-grid bg-white rounded-3 col-12 p-3">
                <i className="fs-3 mb-2 d-block bi-person-circle"></i>
                <h5>{GradesOrYears}: </h5>
                <span>{ForGrades}</span>
              </div>
            </div>
            <div className="d-sm-none g-col-12 align-items-center justify-content-center">
              <div className="d-grid bg-white rounded-3 col-12 p-3">
                <i className="fs-3 mb-2 d-block bi-alarm"></i>
                <h5>Estimated Time: </h5>
                <span>{EstLessonTime}</span>
              </div>
            </div>
          </div>
          {SteamEpaulette && SteamEpaulette_vert && (
            <Link passHref href="#heading_standards_sec">
              <div className="position-relative">
                <div className="d-none d-sm-grid">
                  Subject breakdown by standard alignments:
                  <Image
                    src={SteamEpaulette}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={160}
                    width={2200}
                    style={{
                      objectFit: "contain",
                      height: "auto",
                      width: "100%",
                    }}
                  />
                </div>
                <div className="d-sm-flex d-sm-none  row justify-content-start pb-2">
                  <Image
                    src={SteamEpaulette_vert}
                    alt="Subject breakdown by standard alignments"
                    priority
                    height={1320}
                    width={320}
                    style={{
                      objectFit: "contain",
                      height: "80vw",
                      width: "auto",
                    }}
                    className="col p-0 d-flex align-self-end"
                  />
                  <div className="col text-start align-content-center mt-3">
                    <i className="bi bi-arrow-90deg-left fs-2 mb-0 d-flex "></i>
                    <div
                      className="rounded p-1 mt-0 d-flex"
                      style={{ border: "2px solid " }}
                    >
                      <h5>Subject breakdown by standard alignments</h5>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
      {TargetStandardsCodes && areTargetStandardsValid && (
        <section className="d-flex flex-column">
          <h3>Target standards: </h3>
          {Object.entries(standards).map(([stardard, standardDescriptors]) => {
            return (
              <>
                <h5>{stardard}</h5>
                <ul className="row row-cols-1 row-cols-sm-2">
                  {standardDescriptors.map((standardDescriptor, index) => {
                    console.log("standardDescriptor: ", standardDescriptor);

                    return (
                      <li key={index} className="col">
                        <Link
                          href={`#${standardDescriptor.dim}`}
                          onClick={(event) =>
                            handleLinkClick(event, standardDescriptor)
                          }
                        >
                          {standardDescriptor.code}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })}
        </section>
      )}
      <RichText className="mt-4" content={Text} />

      <h5 className="mt-4">Keywords:</h5>
      {!!Tags?.length &&
        Tags.map((tag) => (
          <span
            key={tag.Value}
            className="fs-6 fw-light badge rounded-pill bg-white text-secondary border border-2 border-secondary me-2 mb-2 px-2"
          >
            {tag.Value}
          </span>
        ))}

      {!!Description && (
        <>
          <h3 className="mt-3">Lesson Description</h3>
          <RichText content={Description} />
        </>
      )}
      {isAccessibilityValid && (
        <section className="mt-2">
          <section className="d-flex">
            <div className="d-flex justify-content-center align-items-center">
              <i className="bi bi-universal-access-circle fs-4"></i>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <h5 className="mb-0 mt-0 me-0 ms-2">Accessibility Resources:</h5>
            </div>
          </section>
          <ul className="ps-2">
            {Accessibility?.map((accessibility, index) => {
              return accessibility.Link ? (
                <li key={index} className="ms-sm-4">
                  <Link
                    target="_blank"
                    href={accessibility.Link}
                    style={{
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {accessibility.Description}
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Overview;
