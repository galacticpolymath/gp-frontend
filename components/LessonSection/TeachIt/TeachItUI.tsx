/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-unused-vars */

import React, {
  Dispatch,
  IframeHTMLAttributes,
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
import BootstrapBtn from "react-bootstrap/Button";
import LessonPart from "./LessonPart";
import ClickMeArrow from "../../ClickMeArrow";
import throttle from "lodash.throttle";
import SendFeedback, { SIGN_UP_FOR_EMAIL_LINK } from "../SendFeedback";
import {
  CONTACT_SUPPORT_EMAIL,
  GOOGLE_DRIVE_PROJECT_CLIENT_ID,
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
import CopyingUnitToast, {
  GDRIVE_FOLDER_ORIGIN_AND_PATH,
} from "../../CopyingUnitToast";
import { refreshGDriveToken } from "../../../apiServices/user/crudFns";
import { nanoid } from "nanoid";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";
import GpPlusBanner from "../../GpPlus/GpPlusBanner";
import { Spinner } from "react-bootstrap";
import { useModalContext } from "../../../providers/ModalProvider";
import useDrivePicker from "react-google-drive-picker";
import axios from "axios";
import { TCopyLessonReqBody } from "../../../pages/api/gp-plus/copy-lesson";
import { useLessonContext } from "../../../providers/LessonProvider";

export type TUnitPropsForTeachItSec = Partial<
  Pick<INewUnitSchema, "GdrivePublicID" | "Title" | "MediumTitle">
>;

export type THandleOnChange<TResourceVal extends object = ILesson> = (
  selectedGrade: IResource<TResourceVal> | IResource<INewUnitLesson<IItem>>
) => void;
export interface ITeachItServerProps {
  unitId?: Pick<INewUnitSchema, "_id">["_id"];
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
// GOAL, TODO: get the id of the unit from the root

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
    MediumTitle,
  } = props;
  const { _lessonToCopy } = useLessonContext();
  const [lessonToCopy] = _lessonToCopy;
  const didInitialRenderOccur = useRef(false);
  const copyUnitBtnRef = useRef<HTMLButtonElement | null>(null);
  const {
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
    _userLatestCopyUnitFolderId,
  } = useUserContext();
  const { _isGpPlusModalDisplayed } = useModalContext();
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const areThereGradeBands =
    !!gradeVariations?.length &&
    gradeVariations.every((variation) => !!variation.grades);
  const [
    numsOfLessonPartsThatAreExpanded,
    setNumsOfLessonPartsThatAreExpanded,
  ] = useState<number[]>([]);
  const [isGpPlusMember] = _isGpPlusMember;
  const [didAttemptRetrieveUserData] = _didAttemptRetrieveUserData;
  const [userLatestCopyUnitFolderId, setUserLatestCopyUnitFolderId] =
    _userLatestCopyUnitFolderId;
  const session = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const {
    status,
    token,
    user,
    gdriveEmail,
    gdriveAccessToken,
    gdriveRefreshToken,
    gdriveAccessTokenExp,
  } = session;
  const [isCopyingUnitBtnDisabled, setIsCopyingUnitBtnDisabled] =
    _isCopyUnitBtnDisabled;
  const router = useRouter();
  const [openPicker, authResult] = useDrivePicker();

  useEffect(() => {
    didInitialRenderOccur.current = true;

    console.log("authResult: ", authResult);
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
      setLocalStorageItem(
        "gpPlusFeatureLocation",
        `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
      );
      window.location.href = createGDriveAuthUrl();
      return;
    }

    openPicker({
      appId: "1095510414161",
      clientId: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY as string,
      // clientId:
      //   "1038023225572-3ir2sqrlbtfcpl3ves15847tbu5li2gv.apps.googleusercontent.com",
      // developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY_HI as string,
      viewId: "DOCS",
      // appId: GOOGLE_DRIVE_PROJECT_ID,
      token: gdriveAccessToken,
      showUploadView: true,
      showUploadFolders: true,
      setIncludeFolders: true,
      customScopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      setSelectFolderEnabled: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: async (data) => {
        try {
          // create the folder structure

          console.log("data, yo there: ", data);
          if (data?.docs?.length) {
            console.log("First document ID, data?.docs: ", data?.docs);
            const fileIds = data.docs.map((file) => file.id);
            const response = await axios.post(
              "/api/gp-plus/copy-lesson",
              {
                fileIds,
                unit: {
                  id: GdrivePublicID,
                  name: MediumTitle 
                },
                lesson: {
                  id: "2",
                  name: "adsffads"
                }
              } as TCopyLessonReqBody,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "gdrive-token": gdriveAccessToken,
                  "gdrive-token-refresh": gdriveRefreshToken,
                },
              }
            );

            console.log("Response: ", response);
          }
        } catch (error) {
          console.error("An error occurred: ", error);
        }
      },
    });

    setIsCopyingUnitBtnDisabled(false);

    return;
  };

  // if the user is not a gp plus member, then take the user to the sign up page
  const takeUserToSignUpPg = () => {
    console.log("status, takeUserToSignUpPg: ", status);
    if (status === "unauthenticated") {
      setIsGpPlusModalDisplayed(true);
      return;
    }

    setLocalStorageItem(
      "gpPlusFeatureLocation",
      `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
    );

    router.push("/gp-plus");
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
              <div className="d-flex flex-nowrap align-items-center justify-content-center position-relative flex-column">
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
                    width: "fit-content",
                  }}
                  className={`px-3 py-2 col-12 ${
                    isCopyingUnitBtnDisabled ? "opacity-25" : "opacity-100"
                  }`}
                  disabled={
                    !didInitialRenderOccur.current || isCopyingUnitBtnDisabled
                  }
                >
                  {didInitialRenderOccur.current ? (
                    <div className="d-flex flex-row align-items-center justify-content-center gap-2">
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
                            className="d-flex flex-column text-black"
                          >
                            {isGpPlusMember && !gdriveAccessToken && (
                              <>Authenticate w/ Google Drive & Copy Unit</>
                            )}
                            {isGpPlusMember &&
                              gdriveAccessToken &&
                              (userLatestCopyUnitFolderId
                                ? "Copy unit again"
                                : "Copy unit to my Google Drive")}
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
                {userLatestCopyUnitFolderId && (
                  <div
                    style={{ maxWidth: "600px", fontSize: "18px" }}
                    className="text-break mx-auto text-center text-lg-start mt-2"
                  >
                    Your latest copy of this unit is linked
                    <Link
                      target="_blank"
                      className="ms-1 text-start text-lg-center"
                      href={`${GDRIVE_FOLDER_ORIGIN_AND_PATH}/${userLatestCopyUnitFolderId}`}
                    >
                      here
                    </Link>
                    .
                  </div>
                )}
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

                console.log("part, program: ", part);

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
                    unitMediumTitle={MediumTitle!}
                    sharedGDriveLessonFolderId={"sharedGDriveLessonFolderId" in part ? part.sharedGDriveLessonFolderId : undefined}
                    sharedGDriveLessonFolderName={"sharedGDriveLessonFolderName" in part ? part.sharedGDriveLessonFolderName : undefined}
                    GdrivePublicID={GdrivePublicID!}
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
                          {/* <Sparkles
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
                          </Sparkles> */}
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
