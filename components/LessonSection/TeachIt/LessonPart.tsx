/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable indent */
import { PiArrowsSplit } from "react-icons/pi";
import PropTypes from "prop-types";
import Accordion from "../../Accordion";
import LessonChunk from "./LessonChunk";
import RichText from "../../RichText";
import { CSSProperties, memo, ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import CopyableTxt from "../../CopyableTxt";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { useModalContext } from "../../../providers/ModalProvider";
import { useUserContext } from "../../../providers/UserProvider";
import {
  IChunk,
  IGoingFurtherVal,
  IItemV2,
  IItemV2Props,
  ILsnExt,
  INewUnitLesson,
  IResource,
  IStep,
} from "../../../backend/models/Unit/types/teachingMaterials";
import {
  IItemForClient,
  ILessonForUI,
  TSetter,
  TUseStateReturnVal,
} from "../../../types/global";
import { checkIfElementClickedWasClipboard } from "../../../shared/fns";
import { LAST_LESSON_NUM_ID, UNITS_URL_PATH } from "../../../shared/constants";
import CopyLessonBtn, { ICopyLessonBtnProps } from "./CopyLessonBtn";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";

const LESSON_PART_BTN_COLOR = "#2C83C3";

const SignInSuggestion = ({
  children,
  txt,
}: {
  children: ReactNode;
  txt?: string;
}) => {
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

export interface ILessonPartProps
  extends Pick<
      INewUnitLesson,
      | "allUnitLessons"
      | "lessonsFolder"
      | "userGDriveLessonFolderId"
      | "sharedGDriveLessonFolders"
    >,
    Pick<ICopyLessonBtnProps, "isRetrievingLessonFolderIds"> {
  resources?: IResource;
  GradesOrYears?: string | null;
  removeClickToSeeMoreTxt: () => void;
  selectedGrade: IResource<ILessonForUI>;
  ClickToSeeMoreComp?: ReactNode;
  FeedbackComp?: ReactNode;
  partsArr: any[];
  _numsOfLessonPartsThatAreExpanded: TUseStateReturnVal<number[]>;
  lsnNum?: string | null | number;
  learningObjectives?: string[] | null;
  partsFieldName?: string;
  chunks?: IChunk[] | null;
  lessonTileForDesktop?: ReactNode;
  lessonTileForMobile?: ReactNode;
  ComingSoonLessonEmailSignUp?: ReactNode;
  lsnTitle?: string | null;
  ForGrades?: string | null;
  lsnPreface?: string | null;
  lsnExt?: ILsnExt[] | null;
  goingFurther?: IGoingFurtherVal[] | null;
  itemList?: IItemForClient[] | null;
  isAccordionExpandable: boolean;
  accordionBtnStyle?: CSSProperties;
  gradeVarNote?: string | null;
  unitMediumTitle?: string | null;
  GdrivePublicID?: string | null;
  unitId: Pick<INewUnitSchema, "_id">["_id"];
  unitTitle?: string | null;
  setParts: TSetter<(INewUnitLesson<IItemV2> | ILessonForUI)[]>;
}

const LessonPart: React.FC<ILessonPartProps> = (props) => {
  const {
    unitMediumTitle,
    isRetrievingLessonFolderIds,
    allUnitLessons,
    GdrivePublicID,
    lsnNum,
    lsnTitle,
    lsnPreface,
    lsnExt,
    itemList,
    goingFurther,
    learningObjectives,
    partsArr,
    chunks = [],
    resources,
    userGDriveLessonFolderId,
    gradeVarNote,
    _numsOfLessonPartsThatAreExpanded,
    removeClickToSeeMoreTxt,
    lessonTileForDesktop = null,
    lessonTileForMobile = null,
    ClickToSeeMoreComp = null,
    unitId,
    FeedbackComp = null,
    ComingSoonLessonEmailSignUp = null,
    accordionBtnStyle = {},
    isAccordionExpandable = true,
    setParts,
    sharedGDriveLessonFolders,
    selectedGrade,
    
  } = props;

  const sharedGDriveLessonFolder = useMemo(() => {
    if (!sharedGDriveLessonFolders) {
      console.log("No shared Google Drive lesson folders available");
      return undefined;
    }

    console.log("sharedGDriveLessonFolders: ", sharedGDriveLessonFolders);

    const targetLessonFolder = sharedGDriveLessonFolders.find((folder) => {
      if (lsnNum == 100) {
        return folder.name === "assessments";
      }

      const parentFolderGradeType = folder.parentFolder?.name
        ?.split("_")
        ?.at(-1)
        ?.toLowerCase();

      console.log("parentFolderGradeType: ", parentFolderGradeType);

      console.log("selectedGrade: ", selectedGrade);

      return (
        parentFolderGradeType &&
          ((selectedGrade.gradePrefix &&
          parentFolderGradeType === selectedGrade.gradePrefix.toLowerCase()) ||
        (selectedGrade.grades &&
          parentFolderGradeType === selectedGrade.grades.toLowerCase()))
      );
    });

    console.log("targetLessonFolder, yo there: ", targetLessonFolder);

    return targetLessonFolder;
  }, [selectedGrade]);

  useEffect(() => {
    console.log("sharedGDriveLessonFolders: ", sharedGDriveLessonFolders);

    console.log("sharedGDriveLessonFolder: ", sharedGDriveLessonFolder);
  });

  const { _isUserTeacher } = useUserContext();
  const { _isLoginModalDisplayed, _lessonItemModal } = useModalContext();
  const [isUserTeacher] = _isUserTeacher;
  const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
  const [, setLessonItemModal] = _lessonItemModal;
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
  const targetLessonsResources = resources?.lessons?.find((lesson) => {
    return lesson?.lsn == lsnNum;
  });
  let { tags: allTags, itemList: linkResources } = targetLessonsResources ?? {};
  _itemList = (_itemList ?? linkResources) as IItemForClient[];
  let previewTags = null;
  let restOfTags = null;
  let lsnNumParsed = NaN;

  if (typeof lsnNum === "string" && !isNaN(Number(lsnNum))) {
    lsnNumParsed = parseInt(lsnNum);
  } else if (typeof lsnNum === "number" && !isNaN(Number(lsnNum))) {
    lsnNumParsed = lsnNum;
  }

  const _accordionId = `part_${lsnNum}`;

  const handlePreviewDownloadBtnClick = (
    item: IItemV2Props & Pick<IItemV2, "itemCat" | "links">
  ) => {
    console.log("handlePreviewDownloadBtnClick: item: ", item);

    setLessonItemModal((state) => ({
      ...state,
      ...item,
      externalUrl: item.externalUrl ?? item.links?.[0]?.url,
      isDisplayed: true,
      docUrl:
        item.itemType === "presentation"
          ? `${item.gdriveRoot}/view`
          : `${item.gdriveRoot}/preview`,
    }));
  };

  const handleClipBoardIconClick = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}#lesson_${_accordionId}`;
    }

    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    const lessonPartIdInUrl = window.location.href.split("#").at(-1);

    if (
      lessonPartIdInUrl === `lesson_${_accordionId}` &&
      !ComingSoonLessonEmailSignUp &&
      typeof lsnNum === "string" &&
      lsnNum === LAST_LESSON_NUM_ID.toString()
    ) {
      const previousLessonPartNum = partsArr.length - 1;

      setNumsOfLessonPartsThatAreExpanded((prevState) => {
        if (!isExpanded) {
          return previousLessonPartNum
            ? [...prevState, previousLessonPartNum]
            : prevState;
        }

        return prevState.filter((num) => num !== previousLessonPartNum);
      });
      setIsExpanded(true);
    } else if (
      lessonPartIdInUrl === `lesson_${_accordionId}` &&
      !ComingSoonLessonEmailSignUp &&
      typeof lsnNum === "string" &&
      !isNaN(Number(lsnNum))
    ) {
      const previousLessonPartNum = parseInt(lsnNum) - 1;

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

  const handleAccordionBtnOnClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (removeClickToSeeMoreTxt) {
      removeClickToSeeMoreTxt();
    }

    if (!checkIfElementClickedWasClipboard(event.target)) {
      const previousLessonPartNum =
        lsnNum === LAST_LESSON_NUM_ID ? partsArr.length - 1 : lsnNumParsed - 1;

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

  if (isExpanded && lsnNumParsed == 1) {
    _borderTop = "none";
  } else if (!isExpanded && lsnNumParsed == 1) {
    _borderTop = defaultBorder;
  }

  const _borderBottom =
    numsOfLessonPartsThatAreExpanded.find((num) => num === lsnNumParsed) ||
    isExpanded
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

  if (isExpanded && lsnNumParsed == 1) {
    _borderTopAccordionWrapper = highlightedBorder;
  }

  if (!isExpanded && lsnNumParsed == 1) {
    _borderTopAccordionWrapper = "none";
  }

  const _borderBottomAccordionWrapper =
    numsOfLessonPartsThatAreExpanded.find((num) => num == lsnNumParsed) ||
    isExpanded
      ? highlightedBorder
      : "none";
  const accordionStyleAccordionWrapper = {
    borderLeft: isExpanded ? highlightedBorder : "none",
    borderRight: isExpanded ? highlightedBorder : "none",
    borderTop: _borderTopAccordionWrapper,
    borderBottom: _borderBottomAccordionWrapper,
    boxShadow: isExpanded ? highlightedGlow : "none",
    pointerEvent: "none",
  };
  const lessonsFolder =
    lsnNum == 100
      ? // will use the assessments folder itself as the parent folder
        {
          name: sharedGDriveLessonFolder?.name,
          sharedGDriveId: sharedGDriveLessonFolder?.id,
        }
      : {
          name: sharedGDriveLessonFolder?.parentFolder.name,
          sharedGDriveId: sharedGDriveLessonFolder?.parentFolder.id,
        };

  return (
    <div style={accordionStyleAccordionWrapper}>
      <Accordion
        isExpandability={false}
        handleOnClick={undefined}
        highlighted={undefined}
        setContentId={undefined}
        buttonClassName={`w-100 text-start border-0 p-0 ${
          isExpanded ? "" : "bg-white"
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
        dataBsToggle={undefined}
        initiallyExpanded={isExpanded}
        button={
          <div
            onClick={
              isAccordionExpandable ? handleAccordionBtnOnClick : () => {}
            }
            className="position-relative lesson-part-btn"
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
                            border: `solid 2.3px ${
                              isExpanded ? highlightedBorderColor : "#DEE2E6"
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
                              zIndex: 0,
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
                      <RichText
                        className="text-start lesson-preface-testing"
                        content={lsnPreface}
                      />
                    </div>
                    {!!previewTags?.length && (
                      <div className="d-flex tagPillContainer flex-wrap">
                        {previewTags.map((tag: string, index) => (
                          <div
                            key={index}
                            style={{
                              border: `solid .5px ${LESSON_PART_BTN_COLOR}`,
                            }}
                            id={`${lsnNum}-${tag.split(" ").join("-")}`}
                            className="rounded-pill badge bg-white p-2 mt-2"
                          >
                            <span
                              style={{
                                color: LESSON_PART_BTN_COLOR,
                                fontWeight: 450,
                              }}
                              className="tag-testing"
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
                          border: `solid 2.3px ${
                            isExpanded ? highlightedBorderColor : "#DEE2E6"
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
                            zIndex: 0,
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
        <div className="p-0 lessonPartContent pb-3">
          {!!restOfTags?.length && (
            <div className="d-flex mt-0 mt-md-1 justify-content-sm-start tagPillContainer flex-wrap">
              {restOfTags.map((tag: string, index) => (
                <div
                  key={index}
                  id={`${lsnNum}-${tag.split(" ").join("-")}`}
                  style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                  className="rounded-pill badge bg-white p-2"
                >
                  <span
                    style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}
                    className="tag-testing"
                  >
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}
          {FeedbackComp}
          {Array.isArray(learningObjectives) && !!learningObjectives.length && (
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
                  // check if the given li is not empty, it should have text in it.
                  <li id={`objective-${lsnNum}-${index}`} key={index}>
                    <RichText
                      className="lesson-learning-obj"
                      content={objectiveStr}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}
          {typeof learningObjectives === "string" && (
            <div className="mt-4 d-col col-12 col-lg-8">
              <div className="d-flex align-items-start">
                <h5 className="fw-bold">
                  <i className="bi bi-emoji-sunglasses me-2" />
                  Learning Objectives
                </h5>
              </div>
              <p className="lead mb-0">Students will be able to...</p>
              <ol className="mt-0">
                <li id={`objective-${lsnNum}-0`}>
                  <RichText
                    className="lesson-learning-obj"
                    content={learningObjectives}
                  />
                </li>
              </ol>
            </div>
          )}
          <div className="mt-4 pb-1">
            <div className="d-flex align-items-start">
              <i className="bi bi-ui-checks-grid me-2 fw-bolder"></i>
              <h5 className="fw-bold" id="materials-title">
                Materials for{" "}
                {lsnNum == 100
                  ? `Assessments`
                  : `${selectedGrade.gradePrefix} (Lesson ${lsnNum})`}
              </h5>
            </div>
            {lsnNum && lsnTitle && GdrivePublicID && unitMediumTitle && (
              <CopyLessonBtn
                setParts={setParts}
                unitId={unitId!}
                isRetrievingLessonFolderIds={isRetrievingLessonFolderIds}
                GdrivePublicID={GdrivePublicID}
                MediumTitle={unitMediumTitle}
                lessonId={lsnNum}
                lessonName={lsnTitle}
                sharedGDriveLessonFolderId={sharedGDriveLessonFolder?.id}
                allUnitLessons={allUnitLessons}
                lessonsFolder={lessonsFolder}
                lessonsGrades={selectedGrade.grades}
                lessonSharedDriveFolderName={sharedGDriveLessonFolder?.name}
                userGDriveLessonFolderId={userGDriveLessonFolderId}
              />
            )}
            <ol className="mt-2 materials-list">
              {!!_itemList?.length &&
                _itemList.map((item, itemIndex: number) => {
                  const {
                    itemTitle,
                    itemDescription,
                    links,
                    filePreviewImg,
                    itemCat,
                    gdriveRoot,
                    isExportable,
                    mimeType,
                    externalUrl,
                    itemType,
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
                    ? itemTitle.toLowerCase().includes("teacher")
                    : false;
                  let blurTxt = "";
                  let btnTxt = "Sign in";
                  let handleBtnClick = handleSignInBtnClick;

                  if (!isUserTeacher && status === "authenticated") {
                    blurTxt = "You must be a teacher to view this item.";
                    btnTxt = "Update Profile";
                    handleBtnClick = handleUpdateProfileBtnClick;
                  }

                  let filePreviewImgLink = "";

                  if (
                    !isTeacherItem ||
                    (isTeacherItem &&
                      isUserTeacher &&
                      status === "authenticated")
                  ) {
                    filePreviewImgLink =
                      typeof imgLink === "string"
                        ? imgLink
                        : imgLink?.[0] ?? "";
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
                            <RichText
                              content={itemTitle}
                              className={`item-title-${lsnNum}-${itemIndex} lesson-item-title`}
                            />
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
                                  className="lesson-item-description"
                                  content={itemDescription}
                                />
                              </div>
                              <ul
                                style={{ listStyle: "none" }}
                                className="links-list p-0"
                              >
                                {itemCat === "presentation" && (
                                  <li className="mb-0 d-flex">
                                    <div className="d-flex justify-content-center align-items-sm-center">
                                      <button
                                        className={`${
                                          isTeacherItem
                                            ? isUserTeacher
                                              ? ""
                                              : "link-disabled"
                                            : ""
                                        } no-btn-styles no-hover-color-change`}
                                      >
                                        <i
                                          style={{ color: "#4498CC" }}
                                          className="bi bi-box-arrow-up-right"
                                        />
                                      </button>
                                    </div>
                                    <div className="d-flex justify-content-center align-items-center ps-2">
                                      <a
                                        href={`${gdriveRoot}/present`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: "#2c83c3",
                                        }}
                                        className={`${
                                          isTeacherItem
                                            ? isUserTeacher
                                              ? ""
                                              : "link-disabled"
                                            : ""
                                        }`}
                                      >
                                        Present
                                      </a>
                                    </div>
                                  </li>
                                )}
                                <li className="mb-0 d-flex">
                                  <div className="d-flex justify-content-center align-items-sm-center">
                                    <button
                                      className={`${
                                        isTeacherItem
                                          ? isUserTeacher
                                            ? ""
                                            : "link-disabled"
                                          : ""
                                      } no-btn-styles no-hover-color-change`}
                                      onClick={() => {
                                        handlePreviewDownloadBtnClick({
                                          links,
                                          gdriveRoot,
                                          isExportable,
                                          mimeType,
                                          externalUrl,
                                          itemCat,
                                          itemType,
                                        });
                                      }}
                                    >
                                      <i
                                        style={{ color: "#0273BA" }}
                                        className="fab fa-google-drive"
                                      />
                                    </button>
                                  </div>
                                  <div className="d-flex justify-content-center align-items-center ps-2">
                                    <button
                                      style={{
                                        color: "#2c83c3",
                                      }}
                                      className={`${
                                        isTeacherItem
                                          ? isUserTeacher
                                            ? ""
                                            : "link-disabled"
                                          : ""
                                      } fw-bolder no-btn-styles no-hover-color-change underline-on-hover`}
                                      onClick={() => {
                                        handlePreviewDownloadBtnClick({
                                          links,
                                          gdriveRoot,
                                          mimeType,
                                          externalUrl,
                                          itemCat,
                                          isExportable,
                                          itemType,
                                        });
                                      }}
                                    >
                                      {itemType === "presentation"
                                        ? "Preview/Download"
                                        : "Preview"}
                                    </button>
                                  </div>
                                </li>
                              </ul>
                            </section>
                            {!!filePreviewImg && (
                              <section className="pt-1 ps-sm-1 ps-md-4 d-flex col-3">
                                <div className="border align-content-start my-auto">
                                  <img
                                    src={filePreviewImg}
                                    alt="lesson_tile"
                                    className="h-auto w-auto lesson-file-img-testing cursor-pointer"
                                    style={{
                                      objectFit: "contain",
                                      maxHeight: "100px",
                                      maxWidth: "100px",
                                      cursor: "pointer",
                                      border: "1px solid gray",
                                      pointerEvents: isTeacherItem
                                        ? isUserTeacher
                                          ? "auto"
                                          : "none"
                                        : "auto",
                                    }}
                                    onClick={() => {
                                      handlePreviewDownloadBtnClick({
                                        links,
                                        gdriveRoot,
                                        mimeType,
                                        externalUrl,
                                        itemCat,
                                        isExportable,
                                        itemType,
                                      });
                                    }}
                                  />
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
          {/* put grade var notes here */}
          {gradeVarNote && (
            <div className="mt-4">
              <h5 className="d-flex align-items-start fw-bold mb-1">
                <PiArrowsSplit className="me-2" />
                Grade Variant Notes
              </h5>
              <section className="pe-5 ps-2">
                <RichText content={gradeVarNote} />
              </section>
            </div>
          )}
          {!isOnAssessments && durList && chunks && (
            <div className="mt-4">
              <h5 className="d-flex align-items-start fw-bold mb-3">
                <i className="bi bi-stars me-2" />
                Steps &amp; Flow
              </h5>
              {chunks.map((chunk, i) => (
                <LessonChunk
                  key={i}
                  chunkNum={i}
                  chunkDur={durList[i]}
                  durList={durList.filter((dur) => dur != null)}
                  lessonNum={lsnNum as number}
                  chunkTitle={chunk.chunkTitle}
                  steps={chunk.steps as IStep[]}
                />
              ))}
            </div>
          )}
          {(!!lsnExt?.length || !!goingFurther?.length) && (
            <div className="d-col col-12 col-lg-9">
              <div>
                <div className="d-flex align-items-start ">
                  <h5 className="fw-bold">
                    <i className="bi bi-rocket-takeoff me-2" />
                    Going Further
                  </h5>
                </div>
                <RichText
                  className="lead"
                  content="Ideas and resources for deepening learning on this topic."
                />
              </div>
              <ol className="mt-2">
                {(lsnExt || goingFurther)?.map(
                  ({ itemTitle, itemDescription, item, itemLink }) => {
                    let itemClassNameTitle = "";
                    let itemClassNameDescription = "";

                    if (itemTitle) {
                      const itemClassNameRoot = itemTitle
                        .split(" ")
                        .join("-")
                        .replace(/[^a-zA-Z]/g, "");
                      itemClassNameTitle = `${itemClassNameRoot}-title`;
                      itemClassNameDescription = `${itemClassNameRoot}-description`;
                    }

                    return (
                      <li
                        key={item}
                        className="fw-bold"
                        style={{ color: "#4397D5" }}
                      >
                        <h6 className="mb-1">
                          {itemLink && (
                            <Link
                              className={`${itemClassNameTitle}`}
                              href={itemLink}
                              target="_blank"
                            >
                              {itemTitle}
                            </Link>
                          )}
                        </h6>
                        <RichText
                          className={`fw-normal text-dark ${itemClassNameDescription}`}
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
