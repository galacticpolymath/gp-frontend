import React, { RefObject } from "react";
import CollapsibleLessonSection from "../../CollapsibleLessonSection";
import { ISectionDots, TUseStateReturnVal } from "../../../types/global";

interface TeachItUIProps {
  SectionTitle: string;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  ref: RefObject<null>;
}

const TeachItUI: React.FC<TeachItUIProps> = ({
  SectionTitle,
  _sectionDots,
  ref,
}) => {
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
              gradeVariations.every((variation) => !!variation.grades) &&
              gradeVariations.map((variation, i) => (
                <label key={i} className="text-capitalize d-block mb-1">
                  <input
                    className="form-check-input me-2"
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
                    ? selectedGradeResources?.url?.[0]
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
            parts.every((part) => part !== null) &&
            parts.map((part, index, self) => {
              let { lsn, title, preface, itemList, tile } = part;
              let targetLessonInDataLesson = null;

              if (
                dataLesson?.length &&
                dataLesson.every((val) => val !== null)
              ) {
                targetLessonInDataLesson = dataLesson.find(
                  ({ lsnNum }) => lsnNum != null && lsnNum.toString() == lsn
                );
              }

              let lsnExt = null;

              if (dataLesson?.length) {
                const { lsnExt: lsnExtBackup } =
                  Object.values(dataLesson).find(
                    ({ lsnNum: lsnNumDataLesson }) => {
                      return (
                        lsnNumDataLesson &&
                        lsn != null &&
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
                  lsnTitle={title}
                  lsnPreface={preface}
                  lsnExt={lsnExt}
                  chunks={
                    lsn !== "last" ? targetLessonInDataLesson?.chunks : []
                  }
                  ForGrades={ForGrades}
                  learningObjectives={
                    lsn !== "last" ? targetLessonInDataLesson?.learningObj : []
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
