/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-unused-vars */
import React, {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import CollapsibleLessonSection from "../../CollapsibleLessonSection";
import {
  IItemForClient,
  ILessonForUI,
  ISectionDots,
  TUseStateReturnVal,
} from "../../../types/global";
import RichText from "../../RichText";
import { DisplayLessonTile, GRADE_VARIATION_ID } from ".";
import {
  IItem,
  ILesson,
  ILessonDetail,
  ILink,
  INewUnitLesson,
  IResource,
} from "../../../backend/models/Unit/types/teachingMaterials";
import useCanUserAccessMaterial from "../../../customHooks/useCanUserAccessMaterial";
import Button from "../../General/Button";
import BootstrapBtn from "react-bootstrap/Button";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { useModalContext } from "../../../providers/ModalProvider";
import LessonPart from "./LessonPart";
import ClickMeArrow from "../../ClickMeArrow";
import throttle from "lodash.throttle";
import SendFeedback, { SIGN_UP_FOR_EMAIL_LINK } from "../SendFeedback";
import { UNVIEWABLE_LESSON_STR } from "../../../globalVars";
import Link from "next/link";
import Sparkles from "../../SparklesAnimation";
import { useUserContext } from "../../../providers/UserProvider";
import { useRouter } from "next/router";
import { setLocalStorageItem } from "../../../shared/fns";

export type THandleOnChange<TResourceVal extends object = ILesson> = (
  selectedGrade: IResource<TResourceVal> | IResource<INewUnitLesson<IItem>>
) => void;
interface TeachItUIProps<
  TResourceVal extends object = ILesson,
  TSelectedGrade extends object = IResource<ILessonForUI>
> {
  SectionTitle: string;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  ref: RefObject<null>;
  lessonDur: string | null;
  lessonPreface: string | null;
  gradeVariations?:
    | IResource<TResourceVal>[]
    | IResource<INewUnitLesson<IItem>>[]
    | null;
  resources?: IResource<ILesson>;
  selectedGrade: TSelectedGrade;
  handleOnChange: THandleOnChange<TResourceVal>;
  environments: ("classroom" | "remote")[];
  selectedEnvironment: "classroom" | "remote";
  setSelectedEnvironment: Dispatch<SetStateAction<"classroom" | "remote">>;
  selectedGradeResources: ILink;
  parts: (ILessonForUI | INewUnitLesson)[];
  dataLesson: ILessonDetail[];
  GradesOrYears: string | null;
  ForGrades: string | null;
}

const ASSESSMENTS_ID = 100;

const TeachItUI = <
  TLesson extends object,
  TSelectedGrade extends IResource<ILessonForUI> = IResource<ILessonForUI>
>({
  ForGrades,
  resources,
  SectionTitle,
  _sectionDots,
  ref,
  lessonDur,
  lessonPreface,
  gradeVariations,
  selectedGrade,
  handleOnChange,
  environments,
  selectedEnvironment,
  setSelectedEnvironment,
  selectedGradeResources,
  parts,
  dataLesson,
  GradesOrYears,
}: TeachItUIProps<TLesson, TSelectedGrade>) => {
  const { _isDownloadModalInfoOn } = useModalContext();
  const { _isGpPlusMember } = useUserContext();
  const areThereGradeBands =
    !!gradeVariations?.length &&
    gradeVariations.every((variation) => !!variation.grades);
  const [
    numsOfLessonPartsThatAreExpanded,
    setNumsOfLessonPartsThatAreExpanded,
  ] = useState<number[]>([]);
  const [, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const [isGpPlusMember] = _isGpPlusMember;
  const { handleRestrictedItemBtnClick, session } =
    useCanUserAccessMaterial(false);
  const router = useRouter();

  const copyUnit = () => {
    console.log("will copy unit...");
    // check if the user has a google drive token, check the cookies
    // the user must be a gp plus member (isGpPlsMember: true)
    // LOGIC FOR THIS FUNCTION:
    // show the progress units ui to the user
    // display a toast to notify the user of the progress of the copying of the units
    // STEPS:
    // -send the request to the backend to start copying the unit
    // -send events back to the client to update of the progress
  };

  // if the user is not a gp plus member, then take the user to the sign up page
  const takeUserToSignUpPg = () => {
    setLocalStorageItem(
      "gpPlusFeatureLocation",
      window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "#teaching-materials"
    );

    router.push("/gp-plus");
  };

  const handleIconClick = () => {
    setIsDownloadModalInfoOn(true);
  };

  const [arrowContainer, setArrowContainer] = useState({
    isInView: true,
    canTakeOffDom: false,
  });

  const removeClickToSeeMoreTxt = () => {
    setArrowContainer({ isInView: true, canTakeOffDom: true });
  };

  let timer: NodeJS.Timeout;
  const wasSeenRef = useRef(false);

  const handleElementVisibility = (inViewPort: boolean) =>
    throttle(() => {
      clearTimeout(timer);

      if (inViewPort && !wasSeenRef.current) {
        // wasSeenRef.current = true;
        setArrowContainer((state) => ({ ...state, isInView: true }));

        timer = setTimeout(() => {
          setArrowContainer((state) => ({ ...state, isInView: false }));
        }, 6_000);
      }
    }, 200)();

  return (
    <CollapsibleLessonSection
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div id="teach-it-sec" ref={ref}>
        <div className="container-fluid mt-4">
          {!!lessonDur && (
            <div className="row">
              <div className="row mx-auto justify-content-center">
                <div className="infobox rounded-3 p-2 fs-5 my-2 fw-light w-auto">
                  <h3 className="fs-5">
                    <i className="bi-alarm fs-5 me-2" />
                    {lessonDur}
                  </h3>
                  {!!lessonPreface && (
                    <RichText
                      content={lessonPreface}
                      className="flex-column d-flex justify-content-center quickPrep lessons-preface-testing"
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
              Available Grade Bands
            </h3>
            {areThereGradeBands &&
              gradeVariations.map((variation, i) => (
                <label key={i} className="text-capitalize d-block mb-1">
                  <input
                    className="form-check-input me-2 grade-variation-testing"
                    type="radio"
                    name="gradeVariation"
                    id={variation.grades as string}
                    value={variation.grades as string}
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
                    className="form-check-input me-2 teaching-environment-testing"
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
              <BootstrapBtn
                onClick={isGpPlusMember ? copyUnit : takeUserToSignUpPg}
                style={{
                  pointerEvents: session.status === "loading" ? "none" : "auto",
                }}
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
                    {isGpPlusMember
                      ? "Copy Unit"
                      : `BECOME A MEMBER TO ${selectedGradeResources.linkText}`}
                  </span>
                  <span
                    style={{ lineHeight: "17px", fontSize: "14px" }}
                    className="d-inline d-sm-none"
                  >
                    {selectedGradeResources.linkText}
                  </span>
                </div>
              </BootstrapBtn>
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
                      height: "25px",
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
            parts.filter(Boolean).map((part, index, self) => {
              let learningObjs: string[] | null = [];

              if ("learningObj" in part) {
                learningObjs = part.learningObj;
              }

              let gradeVarNote: string | null = null;

              if ("gradeVarNote" in part && part.gradeVarNote) {
                gradeVarNote = part.gradeVarNote;
              }

              let { lsn, title, preface, itemList, tile, chunks } = part;
              let targetLessonInDataLesson = null;

              if (
                dataLesson?.length &&
                dataLesson.every((val) => val !== null)
              ) {
                targetLessonInDataLesson = dataLesson.find(
                  ({ lsnNum }) => lsnNum != null && lsnNum.toString() == lsn
                );
                learningObjs = targetLessonInDataLesson?.learningObj ?? null;
              }

              let lsnExt = null;

              if ("goingFurther" in part) {
                lsnExt = part.goingFurther;
              } else if (dataLesson?.length) {
                const { lsnExt: lsnExtBackup } =
                  Object.values(dataLesson).find(
                    ({ lsnNum: lsnNumDataLesson }) => {
                      return (
                        lsnNumDataLesson &&
                        lsn != null &&
                        typeof lsn === "string" &&
                        !isNaN(Number(lsn)) &&
                        parseInt(lsn) == lsnNumDataLesson
                      );
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
                typeof part.status === "string" &&
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
                  gradeVarNote={gradeVarNote}
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
                      >
                        <>
                          <Sparkles
                            sparkleWrapperStyle={{
                              height: 40,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            color="purple"
                          >
                            <p style={{ transform: "translateY(20px)" }}>
                              CLICK TO SEE MORE!
                            </p>
                          </Sparkles>
                        </>
                      </ClickMeArrow>
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
                  lsnTitle={title}
                  lsnPreface={preface}
                  lsnExt={lsnExt}
                  chunks={
                    lsn !== ASSESSMENTS_ID
                      ? targetLessonInDataLesson?.chunks ?? chunks
                      : []
                  }
                  ForGrades={ForGrades}
                  learningObjectives={
                    lsn !== ASSESSMENTS_ID ? learningObjs ?? [] : []
                  }
                  partsFieldName="lessons"
                  itemList={itemList as IItemForClient[]}
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
                                target="_blank"
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

export default TeachItUI;
