import React, {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useEffect,
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
  IItemV2,
  ILesson,
  ILessonDetail,
  ILink,
  INewUnitLesson,
  IResource,
  IUnitTeachingMaterialsForUI,
} from "../../../backend/models/Unit/types/teachingMaterials";
import BootstrapBtn from "react-bootstrap/Button";
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
import useSiteSession from "../../../customHooks/useSiteSession";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import Image from "next/image";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";
import GpPlusBanner from "../../GpPlus/GpPlusBanner";
import { useModalContext } from "../../../providers/ModalProvider";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ILessonGDriveId } from "../../../backend/models/User/types";
import { ensureValidToken as _ensureValidToken } from "./CopyLessonBtn";

export type TUnitPropsForTeachItSec = Partial<
  Pick<INewUnitSchema, "GdrivePublicID" | "Title" | "MediumTitle">
>;
export type IUserGDriveLessonId = Required<
  Omit<
    NonNullable<
      Pick<INewUnitLesson, "allUnitLessons">["allUnitLessons"]
    >[number],
    "sharedGDriveId"
  > &
  Pick<INewUnitLesson, "userGDriveLessonFolderId">
>;

export type THandleOnChange<TResourceVal extends object = ILesson> = (
  selectedGrade: IResource<TResourceVal> | IResource<INewUnitLesson<IItemV2>>
) => void;
export interface ITeachItServerProps extends Pick<IUnitTeachingMaterialsForUI, "itemsOfLessons"> {
  unitId?: Pick<INewUnitSchema, "_id">["_id"];
}

type IUserGDriveItemCopy = {
  userGDriveItemCopyId?: string
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
  | IResource<INewUnitLesson<IItemV2>>[]
  | null;
  resources?: IResource<ILesson>;
  selectedGrade: TSelectedGrade;
  setSelectedGrade: Dispatch<
    SetStateAction<IResource<INewUnitLesson<IItemV2>> | IResource<ILessonForUI>>
  >;
  setSelectedGradeResources: Dispatch<SetStateAction<ILink | null>>;
  handleOnChange: (selectedGrade: unknown) => void;
  environments: ("classroom" | "remote")[];
  selectedEnvironment: "classroom" | "remote";
  setSelectedEnvironment: Dispatch<SetStateAction<"classroom" | "remote">>;
  selectedGradeResources: ILink | null;
  parts: (ILessonForUI | INewUnitLesson<IItemV2 & IUserGDriveItemCopy>)[];
  dataLesson: ILessonDetail[];
  GradesOrYears: string | null;
  ForGrades: string | null;
}

const ASSESSMENTS_ID = 100;

const getUserLessonsGDriveFolderIds = async (
  token: string,
  gdriveRefreshToken: string,
  unitId: string,
  lessonNumIds: string[],
  gradesRange: string,
  ensureValidToken: () => ReturnType<typeof _ensureValidToken>
) => {
  try {
    const url = new URL(
      `${window.location.origin}/api/gp-plus/get-gdrive-lesson-ids`
    );

    const gdriveAccessToken = await ensureValidToken();

    if (!gdriveAccessToken) {
      console.error("Token is not valid");
      return null;
    }

    lessonNumIds.forEach((lessonNumId) => {
      url.searchParams.append("lessonNumIds", lessonNumId);
    });
    url.searchParams.append("unitId", unitId!);
    url.searchParams.append("grades", gradesRange);

    const { data, status } = await axios.get<ILessonGDriveId[] | null>(
      url.href,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "gdrive-token": gdriveAccessToken,
          "gdrive-token-refresh": gdriveRefreshToken,
        },
      }
    );

    if (status !== 200) {
      throw new Error(
        `Failed to get drive Ids for the lessons. Status code: ${status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error in getUserLessonsGDriveFolderIds: ", error);

    alert(
      "Failed to get your lesson folder links. Please refresh the page and try again."
    );

    return null;
  }
};

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
    Title,
    environments,
    selectedEnvironment,
    setSelectedEnvironment,
    selectedGradeResources,
    parts: _parts,
    dataLesson,
    GradesOrYears,
    GdrivePublicID,
    MediumTitle,
    unitId,
    handleOnChange,
  } = props;

  const didInitialRenderOccur = useRef(false);
  const copyUnitBtnRef = useRef<HTMLButtonElement | null>(null);
  const {
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
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
  const session = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const {
    status,
    token,
    gdriveAccessToken,
    gdriveRefreshToken,
    gdriveAccessTokenExp,
  } = session;
  const [parts, setParts] = useState(_parts);

  useEffect(() => {
    console.log('parts within useEffect: ', parts);
  });

  const ensureValidToken = async () =>
    await _ensureValidToken(gdriveAccessTokenExp!, setAppCookie);

  const { isFetching } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [status, isGpPlusMember, selectedGrade],
    queryFn: async () => {
      const lessonNumIds =
        status === "authenticated" && isGpPlusMember
          ? _parts.filter(Boolean).map((part) => {
            return typeof part.lsn === "number"
              ? part.lsn.toString()
              : part.lsn!;
          })
          : [];

      if (
        status === "authenticated" &&
        isGpPlusMember &&
        gdriveAccessToken &&
        gdriveRefreshToken &&
        lessonNumIds?.length &&
        selectedGrade.grades
      ) {
        try {
          console.log(
            "selectedGrade.grades, will get lesson folder ids: ",
            selectedGrade.grades
          );

          const userGDriveLessonFolderIds = await getUserLessonsGDriveFolderIds(
            token,
            gdriveRefreshToken,
            unitId!,
            lessonNumIds,
            selectedGrade.grades,
            ensureValidToken
          );

          console.log(
            "userGDriveLessonFolderIds, after req: ",
            userGDriveLessonFolderIds
          );

          if (userGDriveLessonFolderIds?.length) {
            const _parts = parts.map((part) => {
              const targetLessonGDriveUserFolderId =
                userGDriveLessonFolderIds.find((gDriveLessonFolderId) => {
                  return gDriveLessonFolderId.lessonNum == part.lsn;
                });

              if (targetLessonGDriveUserFolderId) {
                return {
                  ...part,
                  userGDriveLessonFolderId:
                    targetLessonGDriveUserFolderId.lessonDriveId,
                };
              }

              return {
                ...part,
                userGDriveLessonFolderId: undefined,
              };
            });
            setParts(_parts);

            // prevent runtime error
            return 1;
          }

          setParts((parts) => {
            return parts.map((part) => {
              return {
                ...part,
                userGDriveLessonFolderId: undefined,
              };
            });
          });

          // prevent runtime error
          return 1;
        } catch (error) {
          console.error(
            "Error in getting the drive Ids for the lessons.",
            error
          );

          // prevent runtime error
          return 1;
        }
      }

      // prevent runtime error
      return 1;
    },
  });
  const router = useRouter();

  useEffect(() => {
    didInitialRenderOccur.current = true;
  }, []);

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
                      id={variation.gradePrefix as string}
                      value={variation.gradePrefix as string}
                      checked={
                        variation.gradePrefix === selectedGrade.gradePrefix
                      }
                      onChange={() => handleOnChange(variation)}
                    />
                    {variation.gradePrefix}
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
                  onClick={
                    !isGpPlusMember || status === "unauthenticated"
                      ? takeUserToSignUpPg
                      : () => {
                        window.open(
                          `https://drive.google.com/drive/folders/${GdrivePublicID}`,
                          "_"
                        );
                      }
                  }
                  style={{
                    minHeight: "51px",
                    backgroundColor: "white",
                    border: "solid 3px #2339C4",
                    borderRadius: "2em",
                    textTransform: "none",
                    minWidth: "270px",
                    width: "fit-content",
                  }}
                  className="px-sm-3 py-sm-2 col-10 col-sm-12"
                >
                  <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
                    <Image
                      alt="gp_plus_logo"
                      src="/plus/plus.png"
                      width={32}
                      height={32}
                    />
                    <h6
                      style={{
                        lineHeight: "23px",
                        fontSize: "18px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                      className="d-inline text-black text-break mb-0"
                    >
                      {!isGpPlusMember || status === "unauthenticated" ? (
                        <>
                          Subscribe to Browse Unit Files on
                          <em
                            style={{ paddingLeft: "2px", paddingRight: "6px" }}
                          >
                            Our
                          </em>
                          Google Drive
                        </>
                      ) : (
                        <>
                          <span>
                            Browse the Entire Unit on
                            <em
                              style={{
                                paddingLeft: "2px",
                                paddingRight: "6px",
                              }}
                            >
                              Our
                            </em>
                            Drive (View Only)
                          </span>
                        </>
                      )}
                    </h6>
                  </div>
                </BootstrapBtn>
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
                    unitTitle={Title}
                    setParts={setParts}
                    isRetrievingLessonFolderIds={isFetching}
                    userGDriveLessonFolderId={
                      "userGDriveLessonFolderId" in part &&
                        part.userGDriveLessonFolderId
                        ? part.userGDriveLessonFolderId
                        : undefined
                    }
                    unitId={unitId!}
                    unitMediumTitle={MediumTitle!}
                    sharedGDriveLessonFolders={
                      "sharedGDriveLessonFolders" in part
                        ? part.sharedGDriveLessonFolders
                        : undefined
                    }
                    lessonsFolder={
                      "lessonsFolder" in part ? part.lessonsFolder : undefined
                    }
                    allUnitLessons={
                      "allUnitLessons" in part && part.allUnitLessons?.length
                        ? part.allUnitLessons
                        : undefined
                    }
                    selectedGrade={selectedGrade}
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
                          <p style={{ transform: "translateY(20px)" }}>
                            CLICK TO SEE MORE!
                          </p>
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
