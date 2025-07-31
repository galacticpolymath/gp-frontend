/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-unused-vars */

import React, {
  Dispatch,
  JSX,
  ReactNode,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import toast, { ToastOptions, ToastPosition } from "react-hot-toast";
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
import {
  CONTACT_SUPPORT_EMAIL,
  UNVIEWABLE_LESSON_STR,
} from "../../../globalVars";
import Link from "next/link";
import Sparkles from "../../SparklesAnimation";
import { useUserContext } from "../../../providers/UserProvider";
import { useRouter } from "next/router";
import {
  createGDriveAuthUrl,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "../../../shared/fns";
import { TCopyFilesMsg } from "../../../pages/api/gp-plus/copy-unit";
import useSiteSession from "../../../customHooks/useSiteSession";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import Image from "next/image";
import CopyingUnitToast from "../../CopyingUnitToast";
import { refreshGDriveToken } from "../../../apiServices/user/crudFns";
import { nanoid } from "nanoid";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";
import GpPlusBanner from "../../GpPlus/GpPlusBanner";
import { Spinner } from "react-bootstrap";

export type TUnitPropsForTeachItSec = Partial<
  Pick<INewUnitSchema, "GdrivePublicID" | "Title" | "MediumTitle">
>;

export type THandleOnChange<TResourceVal extends object = ILesson> = (
  selectedGrade: IResource<TResourceVal> | IResource<INewUnitLesson<IItem>>
) => void;
export interface ITeachItServerProps {
  unitCopyFolderLink?: string;
}
export interface TeachItUIProps<
  TResourceVal extends object = ILesson,
  TSelectedGrade extends object = IResource<ILessonForUI>
> extends TUnitPropsForTeachItSec,
    ITeachItServerProps {
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

// GOAL: display the folder link of the latest copy for the unit

// NOTES:
// -the user may have copied the unit multiple times
// -get the userId from the jwt
// -when querying the unit, within the server side props, using the userId, the numId, the locale of the unit, and the latest date
// to get the latest copy unit link
// -the latest copy unit link was retrieved
// -send it to the client

// GOAL A: render the link onto the ui
// GOAL B: create the mongoose schema for the copy unit history tracker
// GOAL C: retrieve the copy unit history document from the database if it exist within the server side function

const TeachItUI = <
  TLesson extends object,
  TSelectedGrade extends IResource<ILessonForUI> = IResource<ILessonForUI>
>(
  props: TeachItUIProps<TLesson, TSelectedGrade>
) => {
  const {
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
    GdrivePublicID,
    Title,
    MediumTitle,
    unitCopyFolderLink,
  } = props;
  const didInitialRenderOccur = useRef(false);
  const copyUnitBtnRef = useRef<HTMLButtonElement | null>(null);
  const { _isDownloadModalInfoOn } = useModalContext();
  const {
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
  } = useUserContext();
  const areThereGradeBands =
    !!gradeVariations?.length &&
    gradeVariations.every((variation) => !!variation.grades);
  const [
    numsOfLessonPartsThatAreExpanded,
    setNumsOfLessonPartsThatAreExpanded,
  ] = useState<number[]>([]);
  const [, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const [isGpPlusMember] = _isGpPlusMember;
  const [didAttemptRetrieveUserData] = _didAttemptRetrieveUserData;
  const session = useSiteSession();
  const { getCookies, setAppCookie } = useCustomCookies();
  const queriedCookies = getCookies([
    "gdriveAccessToken",
    "gdriveAccessTokenExp",
    "gdriveRefreshToken",
  ]);
  const { gdriveAccessToken, gdriveAccessTokenExp, gdriveRefreshToken } =
    queriedCookies;
  const { status, token, user } = session;
  const [isCopyingUnitBtnDisabled, setIsCopyingUnitBtnDisabled] =
    _isCopyUnitBtnDisabled;
  const { openCanAccessContentModal } = useCanUserAccessMaterial(false);
  const router = useRouter();

  useEffect(() => {
    didInitialRenderOccur.current = true;
  }, []);

  const [toastId, setToastId] = useState<string | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const displayToast = (
    copyingUnitToastCompProps: Parameters<typeof CopyingUnitToast>["0"],
    toastId?: string
  ) => {
    const options: ToastOptions = toastId
      ? {
          position: "bottom-right",
          duration: Infinity,
          id: toastId,
        }
      : {
          position: "bottom-right",
          duration: Infinity,
        };

    return toast.custom(
      <CopyingUnitToast {...copyingUnitToastCompProps} />,
      options
    );
  };

  const copyUnit = async () => {
    console.log("Copy unit function called");

    setIsCopyingUnitBtnDisabled(true);

    if (!gdriveAccessToken) {
      console.log("Redirecting to Google Drive authentication URL");

      setLocalStorageItem(
        "gpPlusFeatureLocation",
        `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
      );
      const url = createGDriveAuthUrl();
      removeLocalStorageItem("didGpSignInAttemptOccur");
      window.location.href = url;
      setIsCopyingUnitBtnDisabled(false);
      return;
    }

    console.log("Starting copy unit job");
    console.log("GdrivePublicID: ", GdrivePublicID);
    console.log("user.userId: ", user.userId);
    console.log("gdriveRefreshToken: ", gdriveRefreshToken);

    if (!GdrivePublicID || !user.userId || !gdriveRefreshToken) {
      console.log(
        "Copy unit function called with all necessary props: user ID, unit title, GDrive public ID, and GDrive refresh token"
      );
      const _toastId = toastId ?? nanoid();

      setToastId(_toastId);

      const handleOnCancel = () => {
        toastRef.current?.remove();
        toast.dismiss(_toastId);
        setToastId(null);
      };

      displayToast(
        {
          jobStatus: "failure",
          onCancel: handleOnCancel,
          onCancelBtnTxt: "Close",
          title: "Failed to start job.",
          subtitle: "Please refresh the page and try again.",
          ref: toastRef,
        },
        _toastId
      );
      setIsCopyingUnitBtnDisabled(false);
      return;
    }

    let currentAccessToken = gdriveAccessToken;

    if (gdriveAccessTokenExp && gdriveRefreshToken) {
      console.log("Starting job...");

      // Check if token is about to expire (less than 5 minutes)
      const currentTime = new Date().getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      const timeUntilExpiry = gdriveAccessTokenExp - currentTime;

      if (timeUntilExpiry < fiveMinutesInMs) {
        console.log("Token expires soon, refreshing...");
        const refreshResult = await refreshGDriveToken(gdriveRefreshToken);

        if (refreshResult) {
          currentAccessToken = refreshResult.access_token;
          // Update cookies with new token and expiry
          setAppCookie("gdriveAccessToken", refreshResult.access_token, {
            expires: new Date(
              new Date().getTime() + 1_000 * 60 * 60 * 24 * 180
            ),
            secure: true,
          });
          setAppCookie("gdriveAccessTokenExp", refreshResult.expires_at, {
            expires: new Date(
              new Date().getTime() + 1_000 * 60 * 60 * 24 * 180
            ),
            secure: true,
          });
          console.log("Token refreshed successfully");
        } else {
          console.error("Failed to refresh token, redirecting to auth");
          setLocalStorageItem(
            "gpPlusFeatureLocation",
            `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
          );
          const url = createGDriveAuthUrl();

          removeLocalStorageItem("didGpSignInAttemptOccur");

          window.location.href = url;
          return;
        }
      }
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "gdrive-token": currentAccessToken,
      "gdrive-token-refresh": gdriveRefreshToken,
      "user-id": user.userId,
    };

    console.log("MediumTitle: ", MediumTitle);

    const url = new URL(`${window.location.origin}/api/gp-plus/copy-unit`);
    const unitNum = new URL(window.location.href).pathname
      .split("/")
      .at(-1) as string;
    url.searchParams.append("unitDriveId", GdrivePublicID);
    url.searchParams.append(
      "unitName",
      MediumTitle ?? `${Title ?? `Unit ${unitNum}`} COPY`
    );

    const eventSource = new EventSourcePolyfill(url.href, {
      headers,
      withCredentials: true,
    });
    const _toastId = toastId ?? nanoid();

    setToastId(_toastId);

    const stopJob = () => {
      console.log("Will stop job.");
      eventSource.close();

      const closeToast = () => {
        toastRef.current?.remove();
        toast.dismiss(_toastId);
        setToastId(null);
      };

      setIsCopyingUnitBtnDisabled(false);

      displayToast(
        {
          jobStatus: "canceled",
          onCancel: closeToast,
          title: "Job CANCELED.",
          subtitle: "Job has been canceled.",
          onCancelBtnTxt: "Close",
          ref: toastRef,
        },
        _toastId
      );
    };

    displayToast(
      {
        jobStatus: "ongoing",
        onCancel: stopJob,
        title: "Copying unit...",
        subtitle: "Gathering files and folders...",
        ref: toastRef,
      },
      _toastId
    );
    let filesCopied = 0;
    let foldersCreated = 0;
    let totalItemsToCopy = 0;
    let showProgressBar = false;
    let targetFolderId: string | undefined = undefined;

    eventSource.onmessage = (event) => {
      try {
        const dataParsable = event.data as string;
        const data = JSON.parse(dataParsable) as TCopyFilesMsg;

        console.log("message retrieved, sup there: ", data);

        if (data.isJobDone) {
          eventSource.close();
          const jobStatus = data.wasSuccessful ? "success" : "failure";
          const title = data.wasSuccessful
            ? "Unit successfuly copied"
            : "Failed to copy unit";
          const subtitle = data.wasSuccessful
            ? "Successfully copied unit into your drive."
            : "An error has occurred. Please try again.";
          const btnTxt = "Close";

          const handleBtnClick = () => {
            console.log("_toastId, sup there: ", _toastId);
            toastRef.current?.remove();
            toast.dismiss(_toastId);
            setToastId(null);
          };

          displayToast(
            {
              jobStatus,
              onCancel: handleBtnClick,
              title,
              subtitle,
              progress: filesCopied + foldersCreated,
              total: totalItemsToCopy,
              showProgressBar,
              onCancelBtnTxt: btnTxt,
              targetFolderId,
              ref: toastRef,
            },
            _toastId
          );
          setIsCopyingUnitBtnDisabled(false);
          return;
        }

        // Update progress based on the message type
        let progressMessage = "Copying unit...";
        if (data.folderCreated) {
          progressMessage = `Folder created: '${data.folderCreated}'.`;
          foldersCreated += 1;
        } else if (data.fileCopied) {
          progressMessage = `File copied: '${data.fileCopied}'.`;
          filesCopied += 1;
        } else if (data.foldersToCopy) {
          progressMessage = `Will copy ${data.foldersToCopy} folders`;
          totalItemsToCopy += data.foldersToCopy;
        } else if (data.filesToCopy) {
          progressMessage = `Will copy ${data.filesToCopy} files.`;
          totalItemsToCopy += data.filesToCopy;
        } else if (data.msg) {
          progressMessage = data.msg;
        }

        console.log("progressMessage: ", progressMessage);

        if (!showProgressBar) {
          showProgressBar = !!data.didRetrieveAllItems;
        }

        if (!targetFolderId && data.folderCopyId) {
          targetFolderId = data.folderCopyId;
        }

        const toastIdNew = displayToast(
          {
            jobStatus: "ongoing",
            onCancel: stopJob,
            title: "Copying unit...",
            subtitle: progressMessage,
            progress: filesCopied + foldersCreated,
            total: totalItemsToCopy,
            showProgressBar: showProgressBar,
            targetFolderId,
            ref: toastRef,
          },
          _toastId
        );

        console.log("_toastId: ", _toastId);
        console.log("toastIdNew: ", toastIdNew);

        console.log("data: ", data);
      } catch (error) {
        console.error(
          "Failed to process the message received from the server. Reason: ",
          error
        );
      }
    };

    eventSource.onerror = (event) => {
      console.log("error event: ", event);
      // toast.dismiss();
    };
  };

  // if the user is not a gp plus member, then take the user to the sign up page
  const takeUserToSignUpPg = () => {
    console.log("status, takeUserToSignUpPg: ", status);
    if (status === "unauthenticated") {
      openCanAccessContentModal();
      return;
    }

    setLocalStorageItem(
      "gpPlusFeatureLocation",
      `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
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
    <>
      <CollapsibleLessonSection
        SectionTitle={SectionTitle}
        highlighted
        initiallyExpanded
        _sectionDots={_sectionDots}
        sectionBanner={
          !isGpPlusMember &&
          status !== "loading" &&
          didAttemptRetrieveUserData ? (
            <GpPlusBanner />
          ) : null
        }
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
              <div className="row flex-nowrap align-items-center justify-content-center position-relative">
                <BootstrapBtn
                  ref={copyUnitBtnRef}
                  onClick={isGpPlusMember ? copyUnit : takeUserToSignUpPg}
                  style={{
                    pointerEvents: isCopyingUnitBtnDisabled ? "none" : "auto",
                    minHeight: "51px",
                    backgroundColor: "white",
                    border: "solid 3px #2339C4",
                    borderRadius: "2em",
                    textTransform: "none",
                    minWidth: "300px",
                  }}
                  className={`px-3 py-2 col-8 col-md-12 ${
                    isCopyingUnitBtnDisabled ? "opacity-25" : "opacity-100"
                  }`}
                  disabled={
                    !didInitialRenderOccur.current || isCopyingUnitBtnDisabled
                  }
                >
                  {didInitialRenderOccur.current ? (
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-center gap-2">
                      {isCopyingUnitBtnDisabled ? (
                        <Spinner className="text-black" />
                      ) : (
                        <>
                          <Image
                            alt="gp_plus_logo"
                            src="/plus/plus.png"
                            width={32}
                            height={32}
                          />
                          <div
                            style={{ lineHeight: "23px", fontSize: "18px" }}
                            className="d-inline text-black"
                          >
                            {isGpPlusMember && !gdriveAccessToken && (
                              <>Authenticate w/ Google Drive & Copy Unit</>
                            )}
                            {isGpPlusMember &&
                              gdriveAccessToken &&
                              "Copy Unit to my Google Drive"}
                            {!isGpPlusMember && (
                              <>
                                Subscribe to copy this whole unit to Google
                                Drive
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      className="spinner-border spinner-border-sm text-light"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                </BootstrapBtn>
                <Link href={"#"}>
                  https://github.com/galacticpolymath/gp-frontend/tree/backend-development
                </Link>
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
                    isAccordionExpandable={
                      part.status !== UNVIEWABLE_LESSON_STR
                    }
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
    </>
  );
};

export default TeachItUI;
