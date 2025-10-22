/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable comma-dangle */

import React from "react";
import Link from "next/link";
import RichText from "../RichText";
import { useMemo, useRef } from "react";
import useLessonElementInView from "../../customHooks/useLessonElementInView";
import Title, { ITitleProps } from "./Title";
import { ISectionDots, TUseStateReturnVal } from "../../types/global";
import { TOverviewForUI } from "../../backend/models/Unit/types/overview";
import { TUnitForUI } from "../../backend/models/Unit/types/unit";
import { ITargetStandardsCode } from "../../backend/models/Unit/types/standards";
import GistCard from "./GistCard";

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
    standards = TargetStandardsCodes.reduce((accum, stardardCodesProp) => {
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
    }, standards);
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
        <GistCard
          LearningSummary={TheGist}
          EstLessonTime={EstUnitTime}
          ForGrades={ForGrades}
          SteamEpaulette={SteamEpaulette}
          SteamEpaulette_vert={SteamEpaulette_vert}
          TargetSubject={TargetSubject}
          isOnPreview={false}
          standards={standards}
          areTargetStandardsValid={!!areTargetStandardsValid}
          TargetStandardsCodes={TargetStandardsCodes}
          className="col-xxl-12 bg-light-gray px-4 py-2 rounded-3 text-center"
        />
      </div>
      <RichText className="mt-4" content={Text} />
      <h5 className="mt-4">Keywords:</h5>
      {!!Tags?.length &&
        Tags.map((tag) => (
          <span
            key={tag}
            className="fs-6 fw-light badge rounded-pill bg-white text-secondary border border-2 border-secondary me-2 mb-2 px-2"
          >
            {tag}
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
