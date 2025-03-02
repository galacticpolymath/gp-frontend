/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
import { AiOutlineQuestionCircle } from "react-icons/ai";
import {
  ModalContext,
  useModalContext,
} from "../../../providers/ModalProvider";
import {
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import PropTypes from "prop-types";
import CollapsibleLessonSection from "../../CollapsibleLessonSection";
import LessonPart from "./LessonPart";
import useLessonElementInView from "../../../customHooks/useLessonElementInView";
import RichText from "../../RichText";
import Image from "next/image";
import Pill from "../../Pill";
import SendFeedback, { SIGN_UP_FOR_EMAIL_LINK } from "../SendFeedback";
import Link from "next/link";
import Button from "../../General/Button";
import { getIsValObj, getObjVals } from "../../../globalFns";
import { UNVIEWABLE_LESSON_STR } from "../../../globalVars";
import ClickMeArrow from "../../ClickMeArrow";
import throttle from "lodash.throttle";
import useCanUserAccessMaterial from "../../../customHooks/useCanUserAccessMaterial";
import { TeachItProps } from "./types";
import {
  ILesson,
  ILink,
  IResource,
} from "../../../backend/models/Unit/types/teachingMaterials";

const GRADE_VARIATION_ID = "gradeVariation";

const LessonTile = ({
  lessonTileUrl,
  imgContainerClassNameStr,
  imgStyle = { objectFit: "contain" },
  imgContainerStyle = { width: 150, height: 150 },
  Pill = null,
  id = {},
}) => {
  return (
    <div style={imgContainerStyle} className={imgContainerClassNameStr}>
      {Pill}
      {lessonTileUrl && (
        <Image
          {...id}
          src={lessonTileUrl}
          alt="lesson_tile"
          fill
          style={imgStyle}
          sizes="130px"
          className="img-optimize rounded w-100 h-100"
        />
      )}
    </div>
  );
};

interface IDisplayLessonTileProps {
  status: string;
  imgContainerClassNameStr: string;
  lessonTileUrl: string;
  id?: { id: string };
}

const DisplayLessonTile = ({
  status,
  imgContainerClassNameStr,
  lessonTileUrl,
  id,
}: IDisplayLessonTileProps) => {
  const tileId = id ? { id } : {};

  if (status === "Beta") {
    return (
      <LessonTile
        {...tileId}
        imgStyle={{ objectFit: "contain" }}
        lessonTileUrl={lessonTileUrl}
        imgContainerClassNameStr={`${imgContainerClassNameStr}`}
        Pill={<Pill zIndex={10} />}
      />
    );
  }

  return (
    <LessonTile
      {...tileId}
      imgStyle={{ objectFit: "contain", border: "solid 2px #C0BFC1" }}
      lessonTileUrl={lessonTileUrl}
      imgContainerClassNameStr={imgContainerClassNameStr}
    />
  );
};

const TeachIt = (props: TeachItProps) => {
  let { index, Data, _sectionDots, SectionTitle, ForGrades, GradesOrYears } =
    props;
  console.log("TeachIt props: ", props);
  const { _isDownloadModalInfoOn } = useModalContext();
  const { handleRestrictedItemBtnClick, session } =
    useCanUserAccessMaterial(false);
  const [, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const [arrowContainer, setArrowContainer] = useState({
    isInView: true,
    canTakeOffDom: false,
  });
  const [
    numsOfLessonPartsThatAreExpanded,
    setNumsOfLessonPartsThatAreExpanded,
  ] = useState<number[]>([]);
  const [, setSectionDots] = _sectionDots;
  const ref = useRef(null);
  useLessonElementInView(_sectionDots, SectionTitle, ref);

  const environments = useMemo(() => {
    const dataKeys = Data && typeof Data === "object" ? Object.keys(Data) : [];
    const environments = dataKeys.length
      ? (["classroom", "remote"] as const).filter((setting) =>
          dataKeys.includes(setting)
        )
      : [];

    return environments;
  }, []);
  const gradeVariations = Data?.classroom?.resources ?? [];
  const [selectedGrade, setSelectedGrade] = useState(
    gradeVariations?.length ? gradeVariations[0] : ({} as IResource)
  );
  const [selectedEnvironment, setSelectedEnvironment] = useState(
    environments[0]
  );
  const allResources = Data?.[selectedEnvironment]?.resources
    ? Data[selectedEnvironment].resources
    : [];
  const [selectedGradeResources, setSelectedGradeResources] = useState(
    allResources?.[0]?.links ?? ({} as ILink)
  );
  let resources = allResources?.length
    ? allResources.find(
        ({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix
      )
    : ({} as IResource);

  if (!Data) {
    return <div>No lessons to display.</div>;
  }

  console.log("resources, yo there: ", resources);

  const areThereMoreThan1Resource = Data.classroom?.resources?.length
    ? Data.classroom?.resources?.length > 1
    : false;
  ForGrades = areThereMoreThan1Resource ? selectedGrade.grades : ForGrades;
  const dataLesson = Data.lesson;
  let parts = selectedGrade.lessons ?? [];

  useEffect(() => {
    console.log("parts, yo there: ", parts);
  });

  const handleIconClick = () => {
    setIsDownloadModalInfoOn(true);
  };

  const removeClickToSeeMoreTxt = () => {
    setArrowContainer({ isInView: true, canTakeOffDom: true });
  };

  const handleOnChange = (selectedGrade: IResource) => {
    setSelectedGradeResources(selectedGrade.links as ILink);
    setSelectedGrade(selectedGrade);
  };

  let timer: NodeJS.Timeout;

  const handleElementVisibility = (inViewPort: boolean) =>
    throttle(() => {
      clearTimeout(timer);

      if (inViewPort) {
        setArrowContainer((state) => ({ ...state, isInView: true }));

        timer = setTimeout(() => {
          setArrowContainer((state) => ({ ...state, isInView: false }));
        }, 3500);
      }
    }, 200)();

  useEffect(() => {
    const lessonPartPath = window.location.href.split("#").at(-1);
    let lessonPartNum: number | null = null;

    if (
      typeof lessonPartPath === "string" &&
      typeof lessonPartPath.split("_").at(-1) === "string"
    ) {
      const lessonPartNumRetrieved = lessonPartPath.split("_").at(-1) as string;
      lessonPartNum = Number.parseInt(lessonPartNumRetrieved);
    }

    if (
      lessonPartPath &&
      lessonPartPath.includes("lesson_part_") &&
      typeof lessonPartNum === "number" &&
      parts.length >= 0 &&
      lessonPartNum > 0
    ) {
      setSectionDots((sectionDotsObj) => ({
        ...sectionDotsObj,
        dots: sectionDotsObj.dots.map((dot) => {
          if (dot.sectionTitleForDot === "Teaching Materials") {
            return {
              ...dot,
              isInView: true,
            };
          }

          return {
            ...dot,
            isInView: false,
          };
        }),
      }));
    }
  }, []);

  return (
    <CollapsibleLessonSection
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div ref={ref}>
        <div className="container-fluid mt-4">
          {!!Data.lessonDur && (
            <div className="row">
              <div className="row mx-auto justify-content-center">
                <div className="infobox rounded-3 p-2 fs-5 my-2 fw-light w-auto">
                  <h3 className="fs-5">
                    <i className="bi-alarm fs-5 me-2" />
                    {Data.lessonDur}
                  </h3>
                  {!!Data.lessonPreface && (
                    <RichText
                      content={Data.lessonPreface}
                      className="flex-column d-flex justify-content-center quickPrep"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="container row mx-auto py-4">
          <div className="col w-1/2">
            <h3 id={GRADE_VARIATION_ID} className="fs-5">
              Available {GradesOrYears} Bands
            </h3>
            {!!gradeVariations.length &&
              gradeVariations.map((variation, i) => (
                <label key={i} className="text-capitalize d-block mb-1">
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    name="gradeVariation"
                    id={variation.grades}
                    value={variation.grades}
                    checked={variation.grades === selectedGrade.grades}
                    onChange={() => handleOnChange(variation)}
                  />
                  {variation.grades}
                </label>
              ))}
          </div>
          <div className="col w-1/2">
            <h3 className="fs-5">Available Teaching Environments</h3>
            {!!environments.length &&
              environments.map((env) => (
                <label className="text-capitalize d-block mb-1" key={env}>
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    name="environment"
                    id={env}
                    value={env}
                    checked={env === selectedEnvironment}
                    onChange={() => setSelectedEnvironment(env)}
                  />
                  {env}
                </label>
              ))}
          </div>
        </div>
        {selectedGradeResources && (
          <div className="d-flex container justify-content-center mb-5 mt-0 col-md-12 col-lg-11">
            <div className="row flex-nowrap align-items-center justify-content-center col-md-8 position-relative">
              <a
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleRestrictedItemBtnClick}
                style={{
                  pointerEvents: session.status === "loading" ? "none" : "auto",
                }}
                href={
                  session.status === "authenticated"
                    ? selectedGradeResources.url
                    : ""
                }
                className={`btn btn-primary px-3 py-2 col-8 col-md-12 ${
                  session.status === "loading" ? "opacity-25" : "opacity-100"
                }`}
              >
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-center gap-2 ">
                  <div className="d-flex justify-content-center align-items-center">
                    <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{" "}
                  </div>
                  <span
                    style={{ lineHeight: "23px" }}
                    className="d-none d-sm-inline"
                  >
                    {selectedGradeResources.linkText}
                  </span>
                  <span
                    style={{ lineHeight: "17px", fontSize: "14px" }}
                    className="d-inline d-sm-none"
                  >
                    {selectedGradeResources.linkText}
                  </span>
                </div>
              </a>
              <div
                style={{ width: "2rem" }}
                className="p-0 ms-1 mt-0 d-flex justify-content-center align-items-center"
              >
                <Button
                  classNameStr="no-btn-styles d-flex justify-content-center align-items-center"
                  handleOnClick={handleIconClick}
                >
                  <AiOutlineQuestionCircle
                    className="downloadTipIcon"
                    style={{
                      width: "25px",
                      heigth: "25px",
                      zIndex: -1,
                      pointerEvents: "none",
                    }}
                  />
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="container lessonsPartContainer px-0 pe-sm-1 px-md-2 pb-4">
          {!!parts.length &&
            parts.every((part) => part !== null) &&
            parts.map((part, index, self) => {
              let {
                lsn,
                lsnTitle,
                partTitle,
                title,
                lsnPreface,
                partPreface,
                preface,
                chunks,
                learningObj,
                itemList,
                lessonTile,
                tile,
                lsnExt,
              } = part;
              let secondTitle = null;

              if (lsnTitle === "Procedure not documented yet") {
                secondTitle =
                  lsnTitle === "Procedure not documented yet" ? title : null;
              }

              let targetLessonInDataLesson = null;

              if (
                dataLesson?.length &&
                dataLesson.every((val) => val !== null)
              ) {
                targetLessonInDataLesson = dataLesson.find(
                  ({ lsnNum }) => lsnNum == lsn
                );
              }

              if (
                !learningObj &&
                lsn !== "last" &&
                targetLessonInDataLesson?.learningObj
              ) {
                const { learningObj: _learningObj } = targetLessonInDataLesson;
                learningObj = _learningObj;
              }

              if (!chunks && lsn !== "last" && targetLessonInDataLesson) {
                chunks = targetLessonInDataLesson.chunks;
              }

              if (!lsnExt && dataLesson && typeof dataLesson === "object") {
                const { lsnExt: lsnExtBackup } =
                  Object.values(dataLesson).find(
                    ({ lsnNum: lsnNumDataLesson }) => {
                      return lsnNumDataLesson && lsn == lsnNumDataLesson;
                    }
                  ) ?? {};
                lsnExt = lsnExtBackup;
              }

              let lessonTilesObj: {
                lessonTileForDesktop: ReactNode | null;
                lessonTileForMobile: ReactNode | null;
              } = {
                lessonTileForDesktop: null,
                lessonTileForMobile: null,
              };

              if (
                part &&
                typeof part === "object" &&
                "status" in part &&
                tile &&
                typeof tile === "string"
              ) {
                lessonTilesObj = {
                  lessonTileForDesktop: (
                    <DisplayLessonTile
                      status={part.status}
                      imgContainerClassNameStr="d-none d-lg-block position-relative me-4"
                      lessonTileUrl={tile}
                      id={{ id: `${lsn}-tile` }}
                    />
                  ),
                  lessonTileForMobile: (
                    <DisplayLessonTile
                      status={part.status}
                      imgContainerClassNameStr="d-flex my-3 my-lg-0 d-lg-none position-relative"
                      lessonTileUrl={tile}
                    />
                  ),
                };
              }

              return (
                <LessonPart
                  {...lessonTilesObj}
                  GradesOrYears={GradesOrYears}
                  removeClickToSeeMoreTxt={removeClickToSeeMoreTxt}
                  key={`${index}_part`}
                  ClickToSeeMoreComp={
                    index === 0 ? (
                      <ClickMeArrow
                        handleElementVisibility={handleElementVisibility}
                        willShowArrow={arrowContainer.isInView}
                        containerStyle={{
                          zIndex: 1000,
                          bottom: "60px",
                          right: "50px",
                          display: arrowContainer.canTakeOffDom
                            ? "none"
                            : "block",
                        }}
                      />
                    ) : null
                  }
                  FeedbackComp={
                    part.status === "Beta" ? (
                      <SendFeedback
                        parentDivStyles={{
                          backgroundColor: "#EBD0FF",
                          zIndex: 100,
                          border: "1px solid #B7B6C2",
                        }}
                        CloseBtnComp={null}
                        txtSectionStyle={{ width: "100%" }}
                        txtSectionClassNameStr="px-sm-3 pt-1 pt-sm-0"
                        containerClassName="mt-3"
                      />
                    ) : null
                  }
                  partsArr={self}
                  resources={resources}
                  _numsOfLessonPartsThatAreExpanded={[
                    numsOfLessonPartsThatAreExpanded,
                    setNumsOfLessonPartsThatAreExpanded,
                  ]}
                  lsnNum={lsn}
                  lsnTitle={secondTitle ?? lsnTitle ?? partTitle ?? title}
                  lsnPreface={lsnPreface ?? partPreface ?? preface}
                  lsnExt={lsnExt}
                  chunks={chunks}
                  ForGrades={ForGrades}
                  learningObjectives={learningObj}
                  partsFieldName="lessons"
                  lessonTileUrl={tile}
                  itemList={itemList}
                  isAccordionExpandable={part.status !== UNVIEWABLE_LESSON_STR}
                  accordionBtnStyle={
                    part.status === UNVIEWABLE_LESSON_STR
                      ? { cursor: "default" }
                      : {}
                  }
                  ComingSoonLessonEmailSignUp={
                    part.status === UNVIEWABLE_LESSON_STR ? (
                      <div className="w-100 px-2 my-2">
                        <SendFeedback
                          parentDivStyles={{
                            backgroundColor: "#FFF4E2",
                            zIndex: 100,
                            border: "1px solid #B7B6C2",
                          }}
                          CloseBtnComp={null}
                          txtSectionStyle={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                          }}
                          parentDivClassName="w-100 px-2 d-flex"
                          IconSectionForTxtDesktop={
                            <section
                              style={{ width: "2.5%", marginTop: "1.8px" }}
                              className="h-100 d-none d-sm-flex pt-3 pt-sm-0 justify-content-sm-center align-items-sm-center"
                            >
                              <i
                                style={{
                                  height: "fit-content",
                                  fontSize: "28px",
                                }}
                                className="bi bi-envelope-plus"
                              />
                            </section>
                          }
                          txt={
                            <>
                              <Link
                                style={{ wordWrap: "break-word" }}
                                className="no-link-decoration text-decoration-underline"
                                href={SIGN_UP_FOR_EMAIL_LINK}
                              >
                                Sign up for emails
                              </Link>{" "}
                              to get early access to this lesson!
                            </>
                          }
                        />
                      </div>
                    ) : null
                  }
                />
              );
            })}
        </div>
      </div>
    </CollapsibleLessonSection>
  );
};

TeachIt.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default TeachIt;
