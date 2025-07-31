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
import { useEffect, useMemo, useRef, useState } from "react";
import ParentLessonSection from "../../../../components/LessonSection/ParentLessonSection";
import LessonsSecsNavDots from "../../../../components/LessonSection/LessonSecsNavDots";
import ShareWidget from "../../../../components/AboutPgComps/ShareWidget";
import { useRouter } from "next/router";
import useScrollHandler from "../../../../customHooks/useScrollHandler";
import { connectToMongodb } from "../../../../backend/utils/connection";
import SendFeedback from "../../../../components/LessonSection/SendFeedback";
import {
  getIsWithinParentElement,
  getLinkPreviewObj,
  removeHtmlTags,
  resetUrl,
} from "../../../../globalFns";
import { useSession } from "next-auth/react";
import {
  defautlNotifyModalVal,
  useModalContext,
} from "../../../../providers/ModalProvider";
import { CustomNotifyModalFooter } from "../../../../components/Modals/Notify";
import axios from "axios";
import { useUserContext } from "../../../../providers/UserProvider";
import { IUserSession, TSetter } from "../../../../types/global";
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
} from "../../../../backend/models/Unit/types/teachingMaterials";
import { UNITS_URL_PATH } from "../../../../shared/constants";
import { TUserSchemaForClient } from "../../../../backend/models/User/types";
import LessonItemModal from "../../../../components/LessonSection/Modals/LessonItemModal";
import GpPlusModal from "../../../../components/LessonSection/Modals/GpPlusModal";
import ThankYouModal from "../../../../components/GpPlus/ThankYouModal";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
} from "../../../../shared/fns";

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

const LessonDetails = ({ lesson, unit }: IProps) => {
  console.log("unit: ", unit);
  const router = useRouter();
  const {
    _isUserTeacher,
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
  } = useUserContext();
  const { status, data } = useSession();
  const { token } = (data ?? {}) as IUserSession;
  const statusRef = useRef(status);

  useMemo(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("isOverLessonPart");
    }
  }, []);

  const {
    _notifyModal,
    _isLoginModalDisplayed,
    _isCreateAccountModalDisplayed,
    _customModalFooter,
    _isGpPlusModalDisplayed,
    _lessonItemModal,
    _isThankYouModalDisplayed,
  } = useModalContext();
  const [, setIsThankYouModalDisplayed] = _isThankYouModalDisplayed;
  const [, setIsUserTeacher] = _isUserTeacher;
  const [isGpPlusMember, setIsGpPlusMember] = _isGpPlusMember;
  const [, setNotifyModal] = _notifyModal;
  const [, setIsCopyUnitBtnDisabled] = _isCopyUnitBtnDisabled;
  const [, setCustomModalFooter] = _customModalFooter;
  const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
  const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
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

    return unitSectionAndTitlePairs.map(([, section]) => section);
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
              custom_projections: "isTeacher",
              willNotRetrieveMailingListStatus: true,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { status, data } = await axios.get<TUserSchemaForClient>(
            `/api/get-user-account-data`,
            paramsAndHeaders
          );

          if (status !== 200) {
            throw new Error(
              "An error has occurred. Failed to check if the user is a teacher."
            );
          }

          setIsUserTeacher(!!data?.isTeacher);
          setIsGpPlusMember(!!data?.isGpPlusMember);

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
      ? removeHtmlTags(_unit.Sections.overview.TheGist)
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
      <LessonItemModal />
      <ThankYouModal />
    </Layout>
  );
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
        const resourcesForUIPromises = resources.map(async (resource) => {
          const lessonsWithFilePreviewImgsPromises = resource.lessons?.map(
            async (lesson) => {
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

            // TODO: add the link to the teaching materials section here, make a request above

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
