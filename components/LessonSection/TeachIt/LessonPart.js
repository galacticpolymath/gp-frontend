/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable indent */

import PropTypes from "prop-types";
import Accordion from "../../Accordion";
import LessonChunk from "./LessonChunk";
import RichText from "../../RichText";
import { memo, useContext, useState } from "react";
import Link from "next/link";
import CopyableTxt from "../../CopyableTxt";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { ModalContext } from "../../../providers/ModalProvider";
import { UserContext } from "../../../providers/UserProvider";

const LESSON_PART_BTN_COLOR = "#2C83C3";

const SignInSuggestion = ({ children, txt }) => {
  if (!txt) {
    txt = "For teachers guides, sign in with a free account!";
  }

  return (
    <div
      style={{ zIndex: 100 }}
      className="center-absolutely d-flex flex-column justify-content-center col-12 mt-4"
    >
      <span className="text-center fw-bold">{txt}</span>
      {children}
    </div>
  );
};

const LessonPart = ({
  lsnNum,
  lsnTitle,
  lsnPreface,
  lsnExt,
  itemList,
  learningObjectives,
  partsFieldName,
  partsArr,
  chunks = [],
  resources,
  ForGrades,
  GradesOrYears,
  _numsOfLessonPartsThatAreExpanded,
  removeClickToSeeMoreTxt,
  lessonTileForDesktop = null,
  lessonTileForMobile = null,
  ClickToSeeMoreComp = null,
  FeedbackComp = null,
  ComingSoonLessonEmailSignUp = null,
  accordionBtnStyle = {},
  isAccordionExpandable = true,
}) => {
  const { _isLoginModalDisplayed } = useContext(ModalContext);
  const { _isUserTeacher } = useContext(UserContext);
  const [isUserTeacher] = _isUserTeacher;
  const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
  const router = useRouter();
  const { status } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [
    numsOfLessonPartsThatAreExpanded,
    setNumsOfLessonPartsThatAreExpanded,
  ] = _numsOfLessonPartsThatAreExpanded;
  const isOnAssessments = lsnTitle === "Assessments";
  const durList = isOnAssessments
    ? null
    : chunks && chunks.map(({ chunkDur }) => chunkDur);
  let _itemList = itemList;
  const targetLessonsResources = resources?.[0]?.[partsFieldName]
    ? Object.values(resources?.[0]?.[partsFieldName]).find(({ lsn }) => {
      if (lsn) {
        return lsnNum.toString() === lsn.toString();
      }
    }) ?? {}
    : {};
  let { tags: allTags, itemList: linkResources } = targetLessonsResources;
  _itemList = _itemList ?? linkResources;
  let previewTags = null;
  let restOfTags = null;
  const _accordionId = `part_${lsnNum}`;

  const handleClipBoardIconClick = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#lesson_${_accordionId}`;
    }

    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    const lessonPartIdInUrl = window.location.href.split("#").at(-1);

    if (
      lessonPartIdInUrl === `lesson_${_accordionId}` &&
      !ComingSoonLessonEmailSignUp
    ) {
      const previousLessonPartNum =
        lsnNum === "last" ? partsArr.length - 1 : lsnNum - 1;

      setNumsOfLessonPartsThatAreExpanded((prevState) => {
        if (!isExpanded) {
          return previousLessonPartNum
            ? [...prevState, previousLessonPartNum]
            : prevState;
        }

        return prevState.filter((num) => num !== previousLessonPartNum);
      });
      setIsExpanded(true);
    }
  }, []);

  const checkIfElementClickedWasClipboard = (parentElement) => {
    if (parentElement.nodeName.toLowerCase() === "body") {
      console.log("Clip board icon wasn't clicked...");
      return false;
    }

    if (parentElement.id === "clipboardIconWrapper") {
      console.log("clip board icon was clicked...");
      return true;
    }

    return checkIfElementClickedWasClipboard(parentElement.parentElement);
  };

  const handleAccordionBtnOnClick = (event) => {
    if (removeClickToSeeMoreTxt) {
      removeClickToSeeMoreTxt();
    }

    if (!checkIfElementClickedWasClipboard(event.target)) {
      const previousLessonPartNum =
        lsnNum === "last" ? partsArr.length - 1 : lsnNum - 1;

      setNumsOfLessonPartsThatAreExpanded((prevState) => {
        if (!isExpanded) {
          return previousLessonPartNum
            ? [...prevState, previousLessonPartNum]
            : prevState;
        }

        return prevState.filter((num) => num !== previousLessonPartNum);
      });

      setIsExpanded(!isExpanded);
    }
  };
  const handleSignInBtnClick = () => {
    setIsLoginModalDisplayed(true);
  };
  const handleUpdateProfileBtnClick = () => {
    router.push("/account?show_about_user_form=true");
  };

  if (allTags?.length && Array.isArray(allTags)) {
    allTags = allTags.flat().filter((tag) => !!tag);
    previewTags = allTags?.length > 3 ? allTags.slice(0, 3) : allTags;
    restOfTags = allTags?.length > 3 ? allTags.slice(3) : [];
  }

  const defaultBorder = "solid 2.5px rgb(222, 226, 230)";
  const highlightedBorderColor = "#3987C5";
  const highlightedBorder = `solid 2.5px ${highlightedBorderColor}`;
  const highlightedGlow = "inset 0px 0px 20px 0px rgba(44,131,195,0.25)";
  let _borderTop = "none";

  if (isExpanded && lsnNum == 1) {
    _borderTop = "none";
  }

  if (!isExpanded && lsnNum == 1) {
    _borderTop = defaultBorder;
  }

  const _borderBottom =
    numsOfLessonPartsThatAreExpanded.find((num) => num == lsnNum) || isExpanded
      ? "none"
      : defaultBorder;
  const accordionStyle = {
    borderLeft: isExpanded ? "none" : defaultBorder,
    borderRight: isExpanded ? "none" : defaultBorder,
    borderTop: _borderTop,
    borderBottom: _borderBottom,
    boxShadow: isExpanded ? highlightedGlow : "none",
  };

  let _borderTopAccordionWrapper = "none";

  if (isExpanded && lsnNum == 1) {
    _borderTopAccordionWrapper = highlightedBorder;
  }

  if (!isExpanded && lsnNum == 1) {
    _borderTopAccordionWrapper = "none";
  }

  const _borderBottomAccordionWrapper =
    numsOfLessonPartsThatAreExpanded.find((num) => num == lsnNum) || isExpanded
      ? highlightedBorder
      : "none";
  const accordionStyleAccordionWrapper = {
    borderLeft: isExpanded ? highlightedBorder : "none",
    borderRight: isExpanded ? highlightedBorder : "none",
    borderTop: _borderTopAccordionWrapper,
    borderBottom: _borderBottomAccordionWrapper,
    boxShadow: isExpanded ? highlightedGlow : "none",
  };

  return (
    <div style={accordionStyleAccordionWrapper}>
      <Accordion
        buttonClassName={`w-100 text-start border-0 p-0 ${isExpanded ? "" : "bg-white"
          }`}
        key={lsnNum}
        btnStyle={
          isExpanded
            ? { background: "none", ...accordionBtnStyle }
            : { ...accordionBtnStyle }
        }
        id={_accordionId}
        accordionChildrenClasses="px-3 pb-2 w-100 accordion-transition"
        style={accordionStyle}
        dataBsToggle={{}}
        accordionContentStyle={{ display: isExpanded ? "block" : "none" }}
        initiallyExpanded={isExpanded}
        button={
          <div
            onClick={
              isAccordionExpandable ? handleAccordionBtnOnClick : () => { }
            }
            className="position-relative"
          >
            <div
              style={{
                height: "10px",
                width: "100%",
                top: "-50%",
                zIndex: -1,
              }}
              className="position-absolute"
              id={`lesson_${_accordionId}`}
            />
            {/* keep the spacing  for the image, when moving the image out of its container */}
            <div className="position-relative px-3 pt-3 pb-2 w-100 d-flex">
              <div className="d-flex flex-column w-100">
                <div className="d-flex justify-content-between w-100 position-relative">
                  <div className="d-flex flex-column w-100 align-items-stretch mt-0 pe-sm-3">
                    <div className="lessonPartHeaderContainer d-flex position-relative justify-content-between">
                      <h3
                        style={{ color: LESSON_PART_BTN_COLOR }}
                        className="fs-5 fw-bold text-left px-md-0 pe-1"
                      >
                        {isOnAssessments
                          ? "Assessments"
                          : `Lesson ${lsnNum}: ${lsnTitle ?? ""}`}
                      </h3>
                      <div className="d-flex align-items-center flex-column position-relative">
                        <div
                          className="rounded d-flex d-lg-none justify-content-center align-items-center position-relative"
                          style={{
                            width: 30,
                            height: 30,
                            border: `solid 2.3px ${isExpanded ? highlightedBorderColor : "#DEE2E6"
                              }`,
                          }}
                        >
                          {ClickToSeeMoreComp}
                          <i
                            style={{ color: "#DEE2E6" }}
                            className="fs-4 bi-chevron-down"
                          />
                          <i
                            style={{ color: highlightedBorderColor }}
                            className="fs-4 bi-chevron-up"
                          />
                        </div>
                        <div
                          id="clipboardIconWrapper"
                          className="d-flex d-lg-none justify-content-center align-items-center"
                        >
                          <CopyableTxt
                            additiveYCoord={-20}
                            copyTxtIndicator="Copy link to lesson."
                            txtCopiedIndicator="Lesson link copied ✅!"
                            implementLogicOnClick={handleClipBoardIconClick}
                            parentClassName="pointer d-flex"
                            copyTxtModalDefaultStyleObj={{
                              position: "fixed",
                              width: "150px",
                              backgroundColor: "#212529",
                              textAlign: "center",
                            }}
                            pointerContainerStyle={{ zIndex: 1 }}
                          >
                            <i
                              className="bi bi-clipboard"
                              style={{ fontSize: "30px", color: "#A2A2A2" }}
                            />
                          </CopyableTxt>
                        </div>
                      </div>
                    </div>
                    {lessonTileForMobile}
                    <div className="d-flex mt-2">
                      <RichText className="text-start" content={lsnPreface} />
                    </div>
                    {!!previewTags?.length && (
                      <div className="d-flex tagPillContainer flex-wrap">
                        {previewTags.map((tag, index) => (
                          <div
                            key={index}
                            style={{
                              border: `solid .5px ${LESSON_PART_BTN_COLOR}`,
                            }}
                            className="rounded-pill badge bg-white p-2 mt-2"
                          >
                            <span
                              style={{
                                color: LESSON_PART_BTN_COLOR,
                                fontWeight: 450,
                              }}
                            >
                              {tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="d-none arrow-down-lesson-part-container d-lg-flex">
                    {lessonTileForDesktop}
                    <div className="h-100 d-none d-sm-block">
                      <div
                        className="rounded d-flex justify-content-center align-items-center position-relative"
                        style={{
                          width: 35,
                          height: 35,
                          border: `solid 2.3px ${isExpanded ? highlightedBorderColor : "#DEE2E6"
                            }`,
                        }}
                      >
                        {ClickToSeeMoreComp}
                        <i
                          style={{ color: "#DEE2E6" }}
                          className="fs-4 bi-chevron-down"
                        />
                        <i
                          style={{ color: highlightedBorderColor }}
                          className="fs-4 bi-chevron-up"
                        />
                      </div>
                      <div
                        id="clipboardIconWrapper"
                        className="d-flex justify-content-center align-items-center mt-3"
                      >
                        <CopyableTxt
                          additiveYCoord={-20}
                          copyTxtIndicator="Copy link to lesson."
                          txtCopiedIndicator="Lesson link copied ✅!"
                          implementLogicOnClick={handleClipBoardIconClick}
                          copyTxtModalDefaultStyleObj={{
                            position: "fixed",
                            width: "150px",
                            backgroundColor: "#212529",
                            textAlign: "center",
                          }}
                          pointerContainerStyle={{ zIndex: 1 }}
                        >
                          <i
                            className="bi bi-clipboard"
                            style={{ fontSize: "30px", color: "#A2A2A2" }}
                          />
                        </CopyableTxt>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {ComingSoonLessonEmailSignUp}
          </div>
        }
      >
        <div className="p-0 lessonPartContent">
          {!!restOfTags?.length && (
            <div className="d-flex mt-0 mt-md-1 justify-content-sm-start tagPillContainer flex-wrap">
              {restOfTags.map((tag, index) => (
                <div
                  key={index}
                  style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                  className="rounded-pill badge bg-white p-2"
                >
                  <span
                    style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}
                  >
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* put the feedback component here */}
          {FeedbackComp}
          {Array.isArray(learningObjectives) && (
            <div className="mt-4 d-col col-12 col-lg-8">
              <div className="d-flex align-items-start">
                <h5 className="fw-bold">
                  <i className="bi bi-emoji-sunglasses me-2"></i>
                  Learning Objectives
                </h5>
              </div>
              <p className="lead mb-0">Students will be able to...</p>
              <ol className="mt-0">
                {learningObjectives.map((objectiveStr, index) => (
                  <li key={index}>
                    <RichText content={objectiveStr} />
                  </li>
                ))}
              </ol>
            </div>
          )}
          {typeof learningObjectives === "string" && (
            <div className="mt-4 d-col col-12 col-lg-8">
              <div className="d-flex align-items-start">
                <h5 className="fw-bold">
                  <i className="bi bi-emoji-sunglasses me-2"></i>
                  Learning Objectives
                </h5>
              </div>
              <p className="lead mb-0">Students will be able to...</p>
              <ol className="mt-0">
                <li>
                  <RichText content={learningObjectives} />
                </li>
              </ol>
            </div>
          )}
          <div className="mt-4 pb-1">
            <div className="d-flex align-items-start">
              <i className="bi bi-ui-checks-grid me-2 fw-bolder"></i>
              <h5 className="fw-bold">
                Materials for {GradesOrYears} {ForGrades}
              </h5>
            </div>
            <ol className="mt-2 materials-list">
              {!!_itemList?.length &&
                _itemList.map((item, itemIndex) => {
                  const {
                    itemTitle,
                    itemDescription,
                    links,
                    filePreviewImg,
                    itemCat,
                  } = item;
                  const _links = links
                    ? Array.isArray(links)
                      ? links
                      : [links]
                    : null;
                  const imgLink =
                    itemCat === "web resource"
                      ? _links?.[0]?.url ?? ""
                      : _links?.[1]?.url ?? "";
                  const isTeacherItem = itemTitle
                    .toLowerCase()
                    .includes("teacher");
                  let blurTxt = "";
                  let btnTxt = "Sign in";
                  let handleBtnClick = handleSignInBtnClick;

                  if (!isUserTeacher && (status === "authenticated")) {
                    blurTxt = "You must be a teacher to view this item.";
                    btnTxt = "Update Profile";
                    handleBtnClick = handleUpdateProfileBtnClick;
                  }

                  return (
                    <li
                      key={itemIndex}
                      className={`${itemIndex === 0 ? "mt-2" : "mt-4"} mb-0`}
                    >
                      <div className="d-flex flex-column flex-md-row">
                        <section className="col-12 col-md-8 col-lg-6 col-xl-6 position-relative">
                          {isTeacherItem && !isUserTeacher && (
                            <SignInSuggestion txt={blurTxt}>
                              <div className="d-flex justify-content-center align-items-center">
                                <Button
                                  onClick={handleBtnClick}
                                  className="mt-2 sign-in-teacher-materials-btn d-flex justify-content-center align-items-center underline-on-hover"
                                >
                                  {btnTxt}
                                </Button>
                              </div>
                            </SignInSuggestion>
                          )}
                          <strong>
                            <RichText content={itemTitle} />
                          </strong>
                          <section
                            style={{
                              filter:
                                isTeacherItem && !isUserTeacher
                                  ? "blur(12px)"
                                  : "none",
                            }}
                            className="d-flex justify-content-between position-relative bg-white flex-sm-row flex-column"
                          >
                            <section>
                              <div
                                className="fst-italic mb-1"
                                style={{ color: "#353637" }}
                              >
                                <RichText
                                  content={itemDescription}
                                  css={{ color: "red" }}
                                />
                              </div>
                              <ul
                                style={{ listStyle: "none" }}
                                className="links-list p-0"
                              >
                                {!!_links &&
                                  _links.map(({ url, linkText }, linkIndex) => {
                                    return (
                                      <li
                                        className="mb-0 d-flex"
                                        key={linkIndex}
                                      >
                                        <div className="d-flex justify-content-center  align-items-sm-center">
                                          {!!url && (
                                            <Link
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`${isTeacherItem
                                                ? isUserTeacher
                                                  ? ""
                                                  : "link-disabled"
                                                : ""
                                                }`}
                                            >
                                              {linkIndex === 0 ? (
                                                <i
                                                  style={{ color: "#4498CC" }}
                                                  className="bi bi-box-arrow-up-right"
                                                />
                                              ) : (
                                                <i
                                                  style={{ color: "#0273BA" }}
                                                  className="fab fa-google-drive"
                                                />
                                              )}
                                            </Link>
                                          )}
                                        </div>
                                        <div className="d-flex justify-content-center align-items-center ps-2">
                                          {!!url && (
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`${isTeacherItem
                                                ? isUserTeacher
                                                  ? ""
                                                  : "link-disabled"
                                                : ""
                                                }`}
                                            >
                                              {linkText}
                                            </a>
                                          )}
                                        </div>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </section>
                            {!!filePreviewImg && (
                              <section className="pt-1 ps-sm-1 ps-md-4 d-flex col-3">
                                <div className="border align-content-start my-auto">
                                  <a
                                    href={
                                      isTeacherItem
                                        ? isUserTeacher
                                          ? imgLink
                                          : ""
                                        : imgLink
                                    }
                                    target="_blank"
                                    className={`${isTeacherItem
                                      ? isUserTeacher
                                        ? ""
                                        : "link-disabled"
                                      : imgLink
                                      }`}
                                  >
                                    <img
                                      src={filePreviewImg}
                                      alt="lesson_tile"
                                      className="h-auto w-auto"
                                      style={{
                                        objectFit: "contain",
                                        maxHeight: "100px",
                                        maxWidth: "100px",
                                        border: "1px solid gray",
                                      }}
                                    />
                                  </a>
                                </div>
                              </section>
                            )}
                          </section>
                        </section>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>
          {!isOnAssessments && durList && chunks && (
            <div className="mt-4">
              <h5 className="d-flex align-items-start fw-bold mb-3">
                <i className="bi bi-stars me-2"></i>
                Steps &amp; Flow
              </h5>
              {chunks.map((chunk, i) => (
                <LessonChunk
                  key={i}
                  chunkNum={i}
                  chunkDur={durList[i]}
                  durList={durList}
                  partInfo={resources?.[partsFieldName]?.[lsnNum - 1]}
                  {...chunk}
                />
              ))}
            </div>
          )}
          {!!lsnExt?.length && (
            <div className="d-col col-12 col-lg-9">
              <div>
                <div className="d-flex align-items-start ">
                  <h5 className="fw-bold">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Going Further
                  </h5>
                </div>
                <RichText
                  className="lead"
                  content="Ideas and resources for deepening learning on this topic."
                />
              </div>
              <ol className="mt-2">
                {lsnExt.map(
                  ({ itemTitle, itemDescription, item, itemLink }) => {
                    return (
                      <li
                        key={item}
                        className="fw-bold"
                        style={{ color: "#4397D5" }}
                      >
                        <h6 className="mb-1">
                          {itemLink && (
                            <Link href={itemLink} target="_blank">
                              {itemTitle}
                            </Link>
                          )}
                        </h6>
                        <RichText
                          className="fw-normal text-dark"
                          content={itemDescription}
                        />
                      </li>
                    );
                  }
                )}
              </ol>
            </div>
          )}
        </div>
      </Accordion>
    </div>
  );
};

LessonPart.propTypes = {
  lsnNum: PropTypes.number,
  lsnTitle: PropTypes.string,
  lsnPreface: PropTypes.string,
  lsnExt: PropTypes.arrayOf(PropTypes.string),
  chunks: PropTypes.array,
  resources: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default memo(LessonPart);
