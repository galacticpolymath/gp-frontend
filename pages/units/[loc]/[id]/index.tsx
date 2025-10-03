/* eslint-disable no-debugger */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import Layout from "../../../../components/Layout";
import sanitizeHtml from "sanitize-html";
import { useEffect, useMemo, useRef, useState } from "react";
import ParentLessonSection from "../../../../components/LessonSection/ParentLessonSection";
import { ToastContainer } from "react-toastify";
import LessonsSecsNavDots from "../../../../components/LessonSection/LessonSecsNavDots";
import ShareWidget from "../../../../components/AboutPgComps/ShareWidget";
import { useRouter } from "next/router";
import useScrollHandler from "../../../../customHooks/useScrollHandler";
import { connectToMongodb } from "../../../../backend/utils/connection";
import SendFeedback from "../../../../components/LessonSection/SendFeedback";
import {
  getIsWithinParentElement,
  getLinkPreviewObj,
} from "../../../../globalFns";
import {
  defautlNotifyModalVal,
  useModalContext,
} from "../../../../providers/ModalProvider";
import { CustomNotifyModalFooter } from "../../../../components/Modals/Notify";
import axios from "axios";
import { useUserContext } from "../../../../providers/UserProvider";
import { TSetter } from "../../../../types/global";
import {
  INewUnitSchema,
  ISections,
  TSectionsForUI,
  TUnitForUI,
} from "../../../../backend/models/Unit/types/unit";
import Units from "../../../../backend/models/Unit";
import {
  IItemForUI,
  INewUnitLesson,
  IResource,
  ISharedGDriveLessonFolder,
} from "../../../../backend/models/Unit/types/teachingMaterials";
import { UNITS_URL_PATH } from "../../../../shared/constants";
import { TUserSchemaForClient } from "../../../../backend/models/User/types";
import LessonItemsModal from "../../../../components/LessonSection/Modals/LessonItemsModal";
import GpPlusModal from "../../../../components/LessonSection/Modals/GpPlusModal";
import ThankYouModal from "../../../../components/GpPlus/ThankYouModal";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "../../../../shared/fns";
import useSiteSession from "../../../../customHooks/useSiteSession";
import { getUnitGDriveChildItems } from "../../../../backend/services/gdriveServices";
import CopyLessonHelperModal from "../../../../components/GpPlus/CopyLessonHelperModal";
import FailedCopiedFilesReportModal from "../../../../components/GpPlus/FailedCopiedFilesReportModal";

const IS_ON_PROD = process.env.NODE_ENV === "production";
const GOOGLE_DRIVE_THUMBNAIL_URL = "https://drive.google.com/thumbnail?id=";
const NAV_CLASSNAMES = [
  "sectionNavDotLi",
  "sectionNavDot",
  "sectionTitleParent",
  "sectionTitleLi",
  "sectionTitleSpan",
];
const NAV_CLASSNAMES_SET = new Set(NAV_CLASSNAMES);

const getSectionDotsDefaultVal = <T extends TSectionsForUI>(
  sectionComps: (T | null)[]
) =>
  sectionComps.map((section, index: number) => {
    const _sectionTitle = `${index}. ${
      section && "SectionTitle" in section ? section.SectionTitle : "Overview"
    }`;
    const sectionId = _sectionTitle.replace(/[\s!]/gi, "_").toLowerCase();

    return {
      isInView: index === 0,
      sectionTitleForDot:
        section && "SectionTitle" in section
          ? section.SectionTitle
          : "Overview",
      sectionId: sectionId,
      willShowTitle: false,
      sectionDotId: `sectionDot-${sectionId}`,
    };
  });

const getLessonSections = <T extends TSectionsForUI>(
  sectionComps: (T | null)[]
): any[] =>
  sectionComps.map((section: TSectionsForUI | null, index: number) => {
    const sectionClassNameForTesting = "section-testing";

    console.log("section, sup there: ", section);

    return {
      ...section,
      sectionClassNameForTesting,
      SectionTitle: `${index}. ${
        section && "SectionTitle" in section ? section.SectionTitle : "Overview"
      }`,
    };
  });
const addGradesOrYearsProperty = (
  sectionComps: any,
  ForGrades: string,
  GradesOrYears: string
) => {
  return sectionComps.map((section: any) => {
    if (section?.SectionTitle?.includes("Teaching Materials")) {
      return {
        ...section,
        ForGrades: ForGrades,
        GradesOrYears: GradesOrYears,
      };
    }

    if (["lesson-plan.standards"]?.includes(section.__component)) {
      return {
        ...section,
        GradesOrYears: GradesOrYears,
      };
    }

    return section;
  });
};

interface IProps {
  lesson?: any;
  unit?: TUnitForUI;
  unitGDriveChildItems: Awaited<ReturnType<typeof getUnitGDriveChildItems>>;
}

const SECTION_SORT_ORDER: Record<keyof ISections, number> = {
  overview: 0,
  preview: 1,
  teachingMaterials: 2,
  feedback: 3,
  extensions: 4,
  bonus: 5,
  background: 6,
  standards: 7,
  credits: 8,
  acknowledgments: 9,
  versions: 10,
};

const UNIT_DOCUMENT_ORIGINS = new Set([
  "https://storage.googleapis.com",
  "https://docs.google.com",
]);

const LessonDetails: React.FC<IProps> = ({ lesson, unit }) => {
  console.log("UNIT OBJECT: ", unit);

  const router = useRouter();
  const {
    _isUserTeacher,
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
    _userLatestCopyUnitFolderId,
    _willShowGpPlusCopyLessonHelperModal,
  } = useUserContext();
  const session = useSiteSession();
  const { status, token, gdriveAccessToken, gdriveRefreshToken, gdriveEmail } =
    session;
  const statusRef = useRef(status);

  useMemo(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("isOverLessonPart");
    }
  }, []);

  const {
    _notifyModal,
    _customModalFooter,
    _isGpPlusModalDisplayed,
    _lessonItemModal,
    _isThankYouModalDisplayed,
  } = useModalContext();
  const [, setWillShowGpPlusCopyLessonHelperModal] =
    _willShowGpPlusCopyLessonHelperModal;
  const [, setIsThankYouModalDisplayed] = _isThankYouModalDisplayed;
  const [, setIsUserTeacher] = _isUserTeacher;
  const [isGpPlusMember, setIsGpPlusMember] = _isGpPlusMember;
  const [, setNotifyModal] = _notifyModal;
  const [, setIsCopyUnitBtnDisabled] = _isCopyUnitBtnDisabled;
  const [, setCustomModalFooter] = _customModalFooter;
  const [, setUserLatestCopyUnitFolderId] = _userLatestCopyUnitFolderId;
  const [, setDidAttemptRetrieveUserData] = _didAttemptRetrieveUserData;
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const [, setLessonItemModal] = _lessonItemModal;

  useEffect(() => {
    const lessonsContainer = document.querySelector(".lessonsPartContainer");
    if (lessonsContainer) {
      lessonsContainer.addEventListener("mousemove", (event) => {
        localStorage.setItem("isWithinLessons", "true");
      });
      lessonsContainer.addEventListener("mouseleave", (event) => {
        console.log("left element");
        localStorage.setItem("isWithinLessons", "false");
      });
    }
  }, []);
  const lessonSectionObjEntries = lesson?.Section
    ? Object.entries(lesson.Section)
    : [];
  let lessonStandardsIndexesToFilterOut: number[] = [];
  let lessonStandardsSections = lessonSectionObjEntries.filter(
    ([sectionName], index) => {
      if (
        sectionName?.includes("standards") ||
        sectionName === "learning-chart"
      ) {
        lessonStandardsIndexesToFilterOut.push(index);
        return true;
      }

      return false;
    }
  ) as any;
  const isTheLessonSectionInOneObj = lessonSectionObjEntries?.length
    ? lessonStandardsSections?.length === 1
    : false;
  let sectionComps = (
    lesson?.Section &&
    typeof lesson?.Section === "object" &&
    lesson?.Section !== null
      ? Object.values(lesson.Section).filter((section) => {
          return (section as any).SectionTitle !== "Procedure";
        })
      : null
  ) as any;

  if (sectionComps?.length) {
    const firstSection = sectionComps[0] as any;
    sectionComps[0] = { ...firstSection, SectionTitle: "Overview" };
  }

  if (
    lesson &&
    !isTheLessonSectionInOneObj &&
    lessonStandardsSections?.length
  ) {
    lessonStandardsSections = structuredClone(
      lessonStandardsSections.map((section: any) => {
        const [, lessonStandardsObj] = section;

        return lessonStandardsObj;
      })
    );
    let lessonStandardsObj = lessonStandardsSections
      .map((lessonStandards: any) => {
        delete lessonStandards.__component;

        return lessonStandards;
      })
      .reduce((lessonStandardObj: any, lessonStandardsAccumulatedObj: any) => {
        let _lessonStandardsAccumulated = { ...lessonStandardsAccumulatedObj };

        if (
          !lessonStandardsAccumulatedObj?.SectionTitle &&
          lessonStandardObj?.SectionTitle
        ) {
          _lessonStandardsAccumulated = {
            ..._lessonStandardsAccumulated,
            SectionTitle: lessonStandardObj.SectionTitle,
          };
        }

        if (
          !lessonStandardsAccumulatedObj.Footnote &&
          lessonStandardObj.Footnote
        ) {
          _lessonStandardsAccumulated = {
            ..._lessonStandardsAccumulated,
            Footnote: lessonStandardObj.Footnote,
          };
        }

        return _lessonStandardsAccumulated;
      }, {});

    // create the standards section
    lessonStandardsObj = {
      ...lessonStandardsObj,
      __component: "lesson-plan.standards",
      InitiallyExpanded: true,
    };
    sectionComps = sectionComps
      ? sectionComps.filter(
          (_: any, index: number) =>
            !lessonStandardsIndexesToFilterOut?.includes(index)
        )
      : [];
    let lessonsStandardsSectionIndex = sectionComps.findIndex(
      (section: any) => {
        return section.SectionTitle === "Background";
      }
    );

    if (lessonsStandardsSectionIndex === -1) {
      lessonsStandardsSectionIndex = sectionComps.findIndex((section: any) => {
        return section.SectionTitle === "Bonus Content";
      });
    }

    if (lessonsStandardsSectionIndex === -1) {
      lessonsStandardsSectionIndex = sectionComps.findIndex((section: any) => {
        return section.SectionTitle === "Teaching Materials";
      });
    }

    if (lessonsStandardsSectionIndex === -1) {
      console.error("The background section DOES NOT EXIST!");
    }

    //if the background section does not exist, find the index of the bonus content section and place the background seection in front of it
    // else if the bonus content does not exist, find the teaching materials, and place the lesson standards in front it

    sectionComps.splice(
      lessonsStandardsSectionIndex + 1,
      0,
      lessonStandardsObj
    );
  }

  sectionComps = useMemo(() => {
    if (!sectionComps?.length) {
      return [];
    }

    sectionComps = sectionComps.filter((section: any) => {
      if ("Data" in section && !section["Data"]) {
        return false;
      }

      return true;
    });

    return addGradesOrYearsProperty(
      sectionComps,
      lesson.ForGrades,
      lesson.GradesOrYears
    );
  }, []);

  sectionComps = useMemo(() => {
    const sectionCompsCopy = structuredClone(sectionComps);
    const teachingMaterialsSecIndex = sectionCompsCopy.findIndex(
      (sectionComp: any) => {
        const sectionTitle = sectionComp.SectionTitle.replace(
          /[0-9.]/g,
          ""
        ).trim();

        return sectionTitle === "Teaching Materials";
      }
    );
    const feedbackSecIndex = sectionCompsCopy.findIndex((sectionComp: any) => {
      const sectionTitle = sectionComp.SectionTitle.replace(
        /[0-9.]/g,
        ""
      ).trim();

      return sectionTitle === "Feedback";
    });

    if (teachingMaterialsSecIndex === -1 || feedbackSecIndex === -1) {
      console.error(
        "Can't find the Teacher Materials section or the feedback section."
      );

      return sectionCompsCopy;
    }

    const feedBackSec = sectionCompsCopy[feedbackSecIndex];

    sectionCompsCopy.splice(feedbackSecIndex, 1);

    sectionCompsCopy.splice(teachingMaterialsSecIndex + 1, 0, feedBackSec);

    return sectionCompsCopy;
  }, []);

  let _sections = useMemo(
    () => (sectionComps?.length ? getLessonSections(sectionComps) : []),
    []
  );

  const unitSections: (TSectionsForUI | null)[] = useMemo(() => {
    const unitSectionAndTitlePairs = Object.entries(unit?.Sections ?? {}) as [
      keyof TSectionsForUI,
      any | null
    ][];

    unitSectionAndTitlePairs.sort(([sectionAName], [sectionBName]) => {
      const sectionASortNum = SECTION_SORT_ORDER[sectionAName];
      const sectionBSortNum = SECTION_SORT_ORDER[sectionBName];

      return sectionASortNum - sectionBSortNum;
    });

    return unitSectionAndTitlePairs
      .map(([, section]) => section)
      .filter((section) => {
        return section?.__component;
      });
  }, []);

  const _unitSections = useMemo(() => {
    const unitSectionsWithTitles = unitSections?.length
      ? getLessonSections(unitSections.filter(Boolean))
      : [];

    return unitSectionsWithTitles;
  }, []);
  const unitDots = useMemo(
    () =>
      unitSections?.length
        ? getSectionDotsDefaultVal(unitSections.filter(Boolean))
        : [],
    []
  );

  const [unitSectionDots, setUnitSectionDots] = useState<{
    dots: any;
    clickedSectionId: null | string;
  }>({
    dots: unitDots,
    clickedSectionId: null,
  });

  const [willGoToTargetSection, setWillGoToTargetSection] = useState(false);
  const [isScrollListenerOn, setIsScrollListenerOn] =
    useScrollHandler(setUnitSectionDots);

  const scrollSectionIntoView = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);
    let url = router.asPath;

    if (targetSection) {
      url.indexOf("#") !== -1 && router.replace(url.split("#")[0]);
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: sectionId === "lessonTitleId" ? "center" : "start",
      });
    }
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const viewPortWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );

    console.log("viewPortWidth: ", viewPortWidth);
    const isNavElementClicked = NAV_CLASSNAMES_SET.has(
      (event.target as HTMLElement).className
    );

    console.log("isNavElementClicked: ", isNavElementClicked);

    if (!isNavElementClicked && viewPortWidth <= 767) {
      console.log("will make updates");
      setUnitSectionDots((sectionDots) => {
        const _sectionDots = {
          ...sectionDots,
          dots: sectionDots?.dots.map((sectionDot: any) => {
            return {
              ...sectionDot,
              willShowTitle: false,
            };
          }),
        };

        return _sectionDots;
      });
    }
  };
  const handleUserNeedsAnAccountHideModal = () => {
    setNotifyModal(defautlNotifyModalVal);
    setCustomModalFooter(null);
  };

  const handleIsUserEntryModalDisplayed =
    (setIsModalOn: TSetter<boolean>) => () => {
      setNotifyModal((state) => ({ ...state, isDisplayed: false }));

      setTimeout(() => {
        handleUserNeedsAnAccountHideModal();
        setIsModalOn(true);
      }, 250);
    };

  const handleBonusContentDocumentClick = (event: MouseEvent) => {
    const isWithinBonusContentSec = getIsWithinParentElement(
      event.target,
      "Bonus_Content",
      "className"
    );
    const { tagName, origin } = (event.target ?? {}) as {
      tagName: string;
      origin: string;
    } & EventTarget;

    console.log("origin: ", origin);

    if (
      statusRef.current !== "authenticated" &&
      isWithinBonusContentSec &&
      tagName === "A" &&
      UNIT_DOCUMENT_ORIGINS.has(origin)
    ) {
      event.preventDefault();
      setCustomModalFooter(
        <CustomNotifyModalFooter
          // sign in button
          closeNotifyModal={() => {
            router.push("/account");
          }}
          leftBtnTxt="Sign In"
          customBtnTxt="Sign Up"
          footerClassName="d-flex justify-content-center"
          leftBtnClassName="border"
          leftBtnStyles={{ width: "150px", backgroundColor: "#898F9C" }}
          rightBtnStyles={{ backgroundColor: "#007BFF", width: "150px" }}
          // sign up button
          handleCustomBtnClick={() => {
            router.push("/gp-plus");
          }}
        />
      );
      setNotifyModal({
        headerTxt: "You must have an account to access this content.",
        isDisplayed: true,
        handleOnHide: () => {
          setNotifyModal((state) => ({ ...state, isDisplayed: false }));

          setTimeout(() => {
            setNotifyModal(defautlNotifyModalVal);
            setCustomModalFooter(null);
          }, 250);
        },
        bodyTxt: "",
      });
    } else if (
      statusRef.current === "authenticated" &&
      isWithinBonusContentSec &&
      tagName === "A" &&
      UNIT_DOCUMENT_ORIGINS.has(origin) &&
      !isGpPlusMember
    ) {
      event.preventDefault();
      setIsGpPlusModalDisplayed(true);
    }
  };

  useEffect(() => {
    if (willGoToTargetSection && unitSectionDots.clickedSectionId) {
      scrollSectionIntoView(unitSectionDots.clickedSectionId);
      setWillGoToTargetSection(false);
    }
  }, [willGoToTargetSection]);

  useEffect(() => {
    statusRef.current = status;

    (async () => {
      if (status === "authenticated" && token) {
        try {
          setDidAttemptRetrieveUserData(false);
          setIsCopyUnitBtnDisabled(true);
          const paramsAndHeaders = {
            params: {
              willNotRetrieveMailingListStatus: true,
              unitId: unit?._id,
              gdriveEmail,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "gdrive-token": gdriveAccessToken,
              "gdrive-token-refresh": gdriveRefreshToken,
            },
          };

          console.log("paramsAndHeaders: ", paramsAndHeaders);

          const { status, data } = await axios.get<TUserSchemaForClient>(
            `/api/get-user-account-data`,
            paramsAndHeaders
          );

          if (status !== 200) {
            throw new Error(
              "An error has occurred. Failed to check if the user is a teacher."
            );
          }

          console.log("data, from server: ", data);

          setIsUserTeacher(!!data?.isTeacher);
          setIsGpPlusMember(!!data?.isGpPlusMember);
          setLocalStorageItem(
            "willShowGpPlusCopyLessonHelperModal",
            typeof data.willShowGpPlusCopyLessonHelperModal === "boolean"
              ? data.willShowGpPlusCopyLessonHelperModal
              : true
          );

          if (data.viewingUnitFolderCopyId) {
            setUserLatestCopyUnitFolderId(data.viewingUnitFolderCopyId);
          }

          const willShowGpPlusPurchaseThankYouModal = getLocalStorageItem(
            "willShowGpPlusPurchaseThankYouModal"
          );

          if (data.isGpPlusMember && willShowGpPlusPurchaseThankYouModal) {
            setIsThankYouModalDisplayed(true);
            removeLocalStorageItem("willShowGpPlusPurchaseThankYouModal");
          }
        } catch (error) {
          console.error("An error has occurred: ", error);
        } finally {
          setIsCopyUnitBtnDisabled(false);
          setDidAttemptRetrieveUserData(true);
        }
      } else if (status === "unauthenticated") {
        setIsCopyUnitBtnDisabled(false);
        setDidAttemptRetrieveUserData(true);
      }
    })();
  }, [status]);

  useEffect(() => {
    document.body.addEventListener("click", handleDocumentClick);

    document.body.addEventListener("click", handleBonusContentDocumentClick);

    return () => {
      document.body.removeEventListener("click", handleDocumentClick);
      document.body.removeEventListener(
        "click",
        handleBonusContentDocumentClick
      );
      setIsGpPlusModalDisplayed(false);
      setLessonItemModal((state) => {
        return {
          ...state,
          isDisplayed: false,
        };
      });
    };
  }, []);

  if (!unit && !lesson && typeof window === "undefined") {
    return null;
  }

  if (!unit && (!lesson || !_sections?.length)) {
    router.replace("/error");
    return null;
  }

  let unitBanner = unit?.UnitBanner ?? "";

  if (!unit && typeof lesson === "object" && !lesson) {
    const { CoverImage, LessonBanner } = lesson;
    unitBanner = (CoverImage?.url ?? LessonBanner) || "";
  }

  const _unit = (unit ?? lesson) as TUnitForUI;
  const shareWidgetFixedProps = IS_ON_PROD
    ? {
        pinterestMedia: unitBanner,
        shareWidgetStyle: {
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          boxShadow:
            "0 4px 6px 0 rgba(0,0,0,.4), 0 7px 5px -5px rgba(0,0,0,.2)",
          top: 150,
          width: "60px",
        },
      }
    : {
        pinterestMedia: unitBanner,
        developmentUrl: `${_unit.URL}/`,
        shareWidgetStyle: {
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          boxShadow:
            "0 4px 6px 0 rgba(0,0,0,.4), 0 7px 5px -5px rgba(0,0,0,.2)",
          top: 150,
          width: "60px",
        },
      };
  const layoutProps = {
    title: `Mini-Unit: ${_unit.Title}`,
    description: _unit?.Sections?.overview?.TheGist
      ? sanitizeHtml(_unit.Sections.overview.TheGist)
      : `Description for ${_unit.Title}.`,
    imgSrc: unitBanner,
    url: _unit.URL,
    imgAlt: `${_unit.Title} cover image`,
    className: "overflow-hidden selected-unit-pg",
    canonicalLink: `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${_unit.numID}`,
    defaultLink: `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${_unit.numID}`,
    langLinks: _unit.headLinks ?? ([] as TUnitForUI["headLinks"]),
  };

  return (
    <Layout {...layoutProps}>
      <ToastContainer stacked autoClose={false} position="bottom-right" />
      {_unit.PublicationStatus === "Beta" && (
        <SendFeedback
          closeBtnDynamicStyles={{
            position: "absolute",
            top: "30px",
            right: "5px",
            fontSize: "28px",
          }}
          containerClassName="mt-4"
          parentDivStyles={{
            backgroundColor: "#EBD0FF",
            width: "100vw",
          }}
        />
      )}
      <LessonsSecsNavDots
        _sectionDots={[unitSectionDots, setUnitSectionDots]}
        setIsScrollListenerOn={setIsScrollListenerOn as TSetter<boolean>}
        isScrollListenerOn={isScrollListenerOn as boolean}
      />
      <ShareWidget {...shareWidgetFixedProps} />
      <div className="col-12 col-lg-10 col-xxl-12 px-3 px-xxl-0 container min-vh-100">
        <div className="p-sm-3 pt-0">
          {_unitSections ? (
            // TODO: if the user doesn't have an account, then slice the sections starting at the third section
            // -and render those sections around a wrapper div that will be opaque in order to push the user to
            // -to sign up a free account
            _unitSections.map((section: any, index: number) => (
              <ParentLessonSection
                key={index}
                section={section}
                ForGrades={_unit.ForGrades}
                index={index}
                _sectionDots={[unitSectionDots, setUnitSectionDots]}
              />
            ))
          ) : (
            <span className="mt-5">
              DEVELOPMENT ERROR: No sections to display.
            </span>
          )}
        </div>
      </div>
      <GpPlusModal />
      <LessonItemsModal />
      <ThankYouModal />
      <CopyLessonHelperModal />
      <FailedCopiedFilesReportModal />
    </Layout>
  );
};

const getGoogleDriveFileIdFromUrl = (url: string) => {
  if (typeof url !== "string") {
    return null;
  }

  const urlSplitted = url.split("/");
  const indexOfDInSplittedUrl = urlSplitted.findIndex((str) => str === "d");

  if (indexOfDInSplittedUrl === -1) {
    return null;
  }

  const id = urlSplitted[indexOfDInSplittedUrl + 1];

  if (!id) {
    return null;
  }

  return id;
};

export const getStaticPaths = async () => {
  try {
    await connectToMongodb(15_000, 0, true);

    const units = [
      await Units.find({}, { numID: 1, _id: 0, locale: 1 }).lean(),
    ].flat();

    return {
      paths: units.map(({ numID, locale }) => ({
        params: { id: `${numID}`, loc: `${locale ?? ""}` },
      })),
      fallback: false,
    };
  } catch (error) {
    console.error(
      "An error has occurred in getting the available paths for the selected lesson page. Error message: ",
      error
    );
  }
};

export const getStaticProps = async (arg: {
  params: { id: string; loc: string };
}) => {
  try {
    const {
      params: { id, loc },
    } = arg;
    const { wasSuccessful } = await connectToMongodb(15_000, 7, true);

    if (!wasSuccessful) {
      throw new Error("Failed to connect to the database.");
    }

    const targetUnits = (await Units.find<INewUnitSchema>(
      { numID: id },
      { __v: 0 }
    ).lean()) as INewUnitSchema[];
    const availUnitLocales = targetUnits
      .map(({ locale }) => locale)
      .filter(Boolean) as string[];
    let targetUnitForUI: TUnitForUI | undefined = undefined;

    if (targetUnits?.length) {
      const availLocs = targetUnits
        .map(({ locale }) => locale)
        .filter(Boolean) as string[];
      const targetUnit = targetUnits.find(({ numID, locale }) => {
        return numID === parseInt(id) && locale === loc;
      });

      if (!targetUnit) {
        throw new Error("Unit is not found.");
      }

      console.log(
        "Will get the child items of the target unit in google drive"
      );

      console.log("targetUnit.GdrivePublicID: ", targetUnit.GdrivePublicID);

      const unitGDriveChildItems = (
        await getUnitGDriveChildItems(targetUnit.GdrivePublicID!)
      )?.filter((item) => item.mimeType?.includes("folder"));

      console.log("unitGDriveChildItems first: ", unitGDriveChildItems);

      const headLinks = targetUnits
        .filter(({ locale, numID }) => locale && numID)
        .map(({ locale, numID }) => [
          `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${locale}/${numID}`,
          locale,
        ]) as [string, string][];
      const resources =
        targetUnit.Sections?.teachingMaterials?.classroom?.resources;
      targetUnitForUI = targetUnit as TUnitForUI;
      targetUnitForUI = {
        ...targetUnitForUI,
        headLinks,
      };

      if (targetUnitForUI.FeaturedMultimedia) {
        targetUnitForUI.FeaturedMultimedia =
          targetUnitForUI.FeaturedMultimedia.map((multiMedia) => {
            if (multiMedia?.mainLink?.includes("www.youtube.com/shorts")) {
              multiMedia.mainLink = multiMedia.mainLink.replace(
                "shorts",
                "embed"
              );
            }

            return multiMedia;
          });
      }

      const isVidOrWebAppPresent = targetUnitForUI?.FeaturedMultimedia?.length
        ? targetUnitForUI.FeaturedMultimedia.some((multiMedia) => {
            return multiMedia.type === "web-app" || multiMedia.type === "video";
          })
        : false;

      // preview images for all of the multimedia content
      if (isVidOrWebAppPresent && targetUnitForUI.FeaturedMultimedia) {
        const featuredMultimediaWithImgPreviewsPromises =
          targetUnitForUI.FeaturedMultimedia.map(async (multiMediaItem) => {
            if (
              multiMediaItem.type === "video" &&
              multiMediaItem?.mainLink?.includes("drive.google")
            ) {
              const videoId = multiMediaItem.mainLink.split("/").at(-2);
              multiMediaItem = {
                ...multiMediaItem,
                webAppPreviewImg: `https://drive.google.com/thumbnail?id=${videoId}`,
                webAppImgAlt: `'${multiMediaItem.title}' video`,
              };
            }

            if (multiMediaItem.type === "web-app" && multiMediaItem?.mainLink) {
              const { errMsg, images, title } = (await getLinkPreviewObj(
                multiMediaItem?.mainLink
              )) as { errMsg: string; images: string[]; title: string };

              if (errMsg && !images?.length) {
                console.error(
                  "Failed to get the image preview of web app. Error message: ",
                  errMsg
                );
              }

              multiMediaItem = {
                ...multiMediaItem,
                webAppPreviewImg: errMsg || !images?.length ? null : images[0],
                webAppImgAlt:
                  errMsg || !images?.length ? null : `${title}'s preview image`,
              };

              return multiMediaItem;
            }

            return multiMediaItem;
          });
        const featuredMultimediaWithImgPreviews = await Promise.all(
          featuredMultimediaWithImgPreviewsPromises
        );

        targetUnitForUI.FeaturedMultimedia = featuredMultimediaWithImgPreviews;
      }

      // get the preview image for the google drive files and check the status of the lesson
      if (
        targetUnitForUI.Sections?.teachingMaterials?.classroom?.resources
          ?.length &&
        resources?.length
      ) {
        console.log("unitGDriveChildItems, second: ", unitGDriveChildItems);

        const resourcesForUIPromises = resources.map(async (resource) => {
          if (resource?.lessons?.length) {
            resource.lessons = resource.lessons.filter((lesson) => {
              if (!lesson.title || lesson?.status?.toLowerCase() === "proto") {
                return false;
              }

              return true;
            });
          }
          const allUnitLessons: Pick<
            INewUnitLesson,
            "allUnitLessons"
          >["allUnitLessons"] = [];

          if (resource.lessons && unitGDriveChildItems?.length) {
            for (const lesson of resource.lessons) {
              const targetUnitGDriveItem = unitGDriveChildItems.find((item) => {
                const itemName = item?.name?.split("_").at(-1);

                return (
                  itemName &&
                  lesson.title &&
                  itemName.toLowerCase() === lesson.title.toLowerCase()
                );
              });

              if (targetUnitGDriveItem?.id && lesson.lsn) {
                allUnitLessons.push({
                  id: lesson.lsn.toString(),
                  sharedGDriveId: targetUnitGDriveItem.id,
                });
              }
            }
          }

          let lessonsFolder:
            | Pick<INewUnitLesson, "lessonsFolder">["lessonsFolder"]
            | undefined = undefined;
          const lessonsWithFilePreviewImgsPromises = resource.lessons?.map(
            async (lesson) => {
              console.log("lesson, sup there: ", lesson.title);

              if (!lessonsFolder && unitGDriveChildItems) {
                for (const unitGDriveChildItem of unitGDriveChildItems) {
                  let lessonTitle = lesson.title?.toLowerCase();

                  if (
                    lessonTitle === "assessments" &&
                    lessonTitle !== unitGDriveChildItem.name?.toLowerCase()
                  ) {
                    continue;
                  }

                  let lessonName = unitGDriveChildItem.name;

                  if (unitGDriveChildItem.name?.includes("_")) {
                    lessonName = unitGDriveChildItem.name
                      ?.split("_")
                      .at(-1)
                      ?.toLowerCase();
                  }

                  if (
                    lessonName &&
                    lesson.title &&
                    lessonName.toLowerCase() === lessonTitle
                  ) {
                    console.log("lesson, hi there: ", lesson.title);
                    console.log(
                      "lessonsFolder found, sup there: ",
                      unitGDriveChildItem.name
                    );

                    const targetUnitGDriveChildItem =
                      unitGDriveChildItems.find((item) => {
                        if (lessonTitle === "assessments") {
                          return item.name === "assessments";
                        }

                        return (
                          item.id &&
                          item.id === unitGDriveChildItem.parentFolderId
                        );
                      }) ?? {};

                    console.log(
                      "targetUnitGDriveChildItem, sup there: ",
                      targetUnitGDriveChildItem
                    );

                    const { name, id } = targetUnitGDriveChildItem;
                    lessonsFolder =
                      name && id
                        ? {
                            name: name,
                            sharedGDriveId: id,
                          }
                        : undefined;
                  }
                }
              }

              const targetGDriveSharedLessonFolders:
                | ISharedGDriveLessonFolder[]
                | undefined = unitGDriveChildItems
                ?.filter((item) => {
                  const lessonName = item?.name?.split("_").at(-1);

                  return (
                    lessonName &&
                    lesson.title &&
                    lessonName.toLowerCase() === lesson.title.toLowerCase()
                  );
                })
                ?.map((itemA) => {
                  console.log("item, sup there: ", itemA);

                  const lessonsFolder = unitGDriveChildItems.find((itemB) => {
                    return itemB.id === itemA.parentFolderId;
                  });

                  console.log("lessonsFolder, python: ", lessonsFolder);

                  // if lessonsFolder.pathFile === '', then the item is located at the root of the google drive folder
                  const parentFolder = lessonsFolder
                    ? { id: lessonsFolder.id!, name: lessonsFolder.name! }
                    : {
                        id: targetUnit.GdrivePublicID!,
                        name: targetUnit.MediumTitle!,
                      };

                  return {
                    id: itemA.id!,
                    name: itemA.name!,
                    parentFolder,
                  };
                });

              console.log(
                "targetGDriveLessonFolder: ",
                targetGDriveSharedLessonFolders
              );

              if (targetGDriveSharedLessonFolders?.length) {
                lesson = {
                  ...lesson,
                  sharedGDriveLessonFolders: targetGDriveSharedLessonFolders,
                  allUnitLessons,
                  lessonsFolder,
                };
              }

              console.log("lesson status: ", lesson.status);

              if (!lesson.tile && lesson.status === "Upcoming") {
                lesson = {
                  ...lesson,
                  tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
                };
              }

              lesson = {
                ...lesson,
                status: lesson.status ?? "Proto",
              };

              const itemListWithFilePreviewImgsPromises = lesson.itemList?.map(
                async (item) => {
                  const { links, itemCat } = item;
                  const linkObj = links?.[0];
                  const url = linkObj?.url?.[0];

                  if (!url) {
                    return item;
                  }

                  if (itemCat === "web resource") {
                    const linkPreviewObj = await getLinkPreviewObj(url);
                    const filePreviewImg =
                      "images" in linkPreviewObj
                        ? linkPreviewObj.images?.[0]
                        : null;

                    return {
                      ...item,
                      filePreviewImg,
                    } as IItemForUI;
                  }

                  const googleDriveFileId = getGoogleDriveFileIdFromUrl(url);

                  if (googleDriveFileId) {
                    const filePreviewImg = `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`;

                    return {
                      ...item,
                      filePreviewImg,
                    } as IItemForUI;
                  }

                  return item as IItemForUI;
                }
              );

              if (itemListWithFilePreviewImgsPromises) {
                const itemListWithFilePreviewImgs = await Promise.all(
                  itemListWithFilePreviewImgsPromises
                );

                return {
                  ...lesson,
                  itemList: itemListWithFilePreviewImgs,
                } as INewUnitLesson<IItemForUI>;
              }

              return lesson as INewUnitLesson<IItemForUI>;
            }
          );

          if (lessonsWithFilePreviewImgsPromises) {
            const lessonsWithFilePreviewImgs = await Promise.all(
              lessonsWithFilePreviewImgsPromises
            );

            return {
              ...resource,
              lessons: lessonsWithFilePreviewImgs,
            } as IResource<INewUnitLesson<IItemForUI>>;
          }

          return resource as IResource<INewUnitLesson<IItemForUI>>;
        });

        const resourcesForUI = await Promise.all(resourcesForUIPromises);

        targetUnitForUI.Sections.teachingMaterials.classroom.resources =
          resourcesForUI;
      }

      const sectionsEntries = Object.entries(
        targetUnitForUI.Sections ?? {}
      ) as [keyof ISections, any][];
      // get the root fields for specific sections that required them
      let sectionsUpdated = sectionsEntries.reduce(
        (sectionsAccum, [sectionKey, section]) => {
          // if the section.Content is null, then return the sectionsAccum
          if (
            !section ||
            (typeof section === "object" &&
              section &&
              (("Content" in section && !section.Content) ||
                ("Data" in section && !section.Data))) ||
            (sectionKey === "preview" && !targetUnitForUI?.FeaturedMultimedia)
          ) {
            return sectionsAccum;
          }

          if (
            targetUnitForUI &&
            typeof section === "object" &&
            section &&
            section?.rootFieldsToRetrieveForUI &&
            Array.isArray(section.rootFieldsToRetrieveForUI)
          ) {
            for (const rootFieldToRetrieveForUI of section.rootFieldsToRetrieveForUI) {
              if (
                rootFieldToRetrieveForUI?.name &&
                typeof rootFieldToRetrieveForUI.name === "string" &&
                rootFieldToRetrieveForUI?.as &&
                typeof rootFieldToRetrieveForUI.as === "string" &&
                targetUnitForUI[
                  rootFieldToRetrieveForUI?.name as keyof TUnitForUI
                ]
              ) {
                const val =
                  targetUnitForUI[
                    rootFieldToRetrieveForUI.name as keyof TUnitForUI
                  ];

                if (!val) {
                  continue;
                }

                section = {
                  ...section,
                  [rootFieldToRetrieveForUI.as as string]: val,
                };
              }
            }

            console.log(`section ${sectionKey} after updates: `, section);

            delete section.rootFieldsToRetrieveForUI;

            return {
              ...sectionsAccum,
              [sectionKey]: section,
            };
          }

          return {
            ...sectionsAccum,
            [sectionKey]: section,
          };
        },
        {} as Record<keyof ISections, any>
      ) as TSectionsForUI;
      sectionsUpdated = {
        ...sectionsUpdated,
        overview: {
          ...sectionsUpdated.overview,
          availLocs,
        },
      };
      const versionsSection = sectionsUpdated.overview?.versions
        ? {
            __component: "lesson-plan.versions",
            SectionTitle: "Version notes",
            InitiallyExpanded: true,
            Data: sectionsUpdated.overview?.versions,
          }
        : null;

      if (versionsSection) {
        sectionsUpdated = {
          ...sectionsUpdated,
          versions: versionsSection,
        };
      }

      targetUnitForUI.Sections = sectionsUpdated;
    }

    console.log(
      "Only the target unit is available. Sections: ",
      targetUnitForUI
    );

    if (targetUnitForUI) {
      return {
        props: {
          lesson: null,
          unit: targetUnitForUI
            ? JSON.parse(JSON.stringify(targetUnitForUI))
            : null,
          availLocs: availUnitLocales,
        },
        revalidate: 30,
      };
    }

    console.error("Target unit not found.");

    throw new Error("Target unit not found.");
  } catch (error) {
    console.error("Failed to get lesson. Error message: ", error);

    return {
      props: {
        lesson: null,
        availLocs: null,
      },
      revalidate: 30,
    };
  }
};

export default LessonDetails;
