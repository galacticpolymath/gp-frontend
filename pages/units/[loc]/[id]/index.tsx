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
import Lessons from "../../../../backend/models/lesson";
import { connectToMongodb } from "../../../../backend/utils/connection";
import SendFeedback from "../../../../components/LessonSection/SendFeedback";
import {
  getIsWithinParentElement,
  getLinkPreviewObj,
  removeHtmlTags,
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
  const router = useRouter();
  const { _isUserTeacher } = useUserContext();
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
  } = useModalContext();
  const [, setIsUserTeacher] = _isUserTeacher;
  const [, setNotifyModal] = _notifyModal;
  const [, setCustomModalFooter] = _customModalFooter;
  const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
  const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;

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
  const _dots = useMemo(
    () => (sectionComps?.length ? getSectionDotsDefaultVal(sectionComps) : []),
    []
  );

  const [unitSectionDots, setUnitSectionDots] = useState<{
    dots: any;
    clickedSectionId: null | string;
  }>({
    dots: unitDots,
    clickedSectionId: null,
  });

  useEffect(() => {
    console.log("unitSectionDots, sup there, unitDots: ", unitDots);
    console.log("unitSectionDots, sup there: ", unitSectionDots);
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

        console.log("_sectionDots: ", _sectionDots);

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
          closeNotifyModal={handleIsUserEntryModalDisplayed(
            setIsLoginModalDisplayed
          )}
          leftBtnTxt="Sign In"
          customBtnTxt="Sign Up"
          footerClassName="d-flex justify-content-center"
          leftBtnClassName="border"
          leftBtnStyles={{ width: "150px", backgroundColor: "#898F9C" }}
          rightBtnStyles={{ backgroundColor: "#007BFF", width: "150px" }}
          handleCustomBtnClick={handleIsUserEntryModalDisplayed(
            setIsCreateAccountModalDisplayed
          )}
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
          const paramsAndHeaders = {
            params: {
              custom_projections: "isTeacher",
              willNotRetrieveMailingListStatus: true,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const origin = window.location.origin;
          const { status, data } = await axios.get(
            `${origin}/api/get-user-account-data`,
            paramsAndHeaders
          );

          if (status !== 200) {
            throw new Error(
              "An error has occurred. Failed to check if the user is a teacher."
            );
          }

          setIsUserTeacher(!!data?.isTeacher);
        } catch (error) {
          console.error("An error has occurred: ", error);
        }
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
    className: "overflow-hidden",
    canonicalLink: `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${_unit.numID}`,
    defaultLink: `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${_unit.numID}`,
    langLinks: _unit.headLinks ?? ([] as TUnitForUI["headLinks"]),
  };

  console.log("_unit.headLinks: ", _unit.headLinks);

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
          parentDivStyles={{
            position: "relative",
            backgroundColor: "#EBD0FF",
            zIndex: 100,
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
          {(unit ? _unitSections : _sections) ? (
            (unit ? _unitSections : _sections).map(
              (section: any, index: number) => (
                <ParentLessonSection
                  key={index}
                  section={section}
                  ForGrades={_unit.ForGrades}
                  index={index}
                  _sectionDots={[unitSectionDots, setUnitSectionDots]}
                />
              )
            )
          ) : (
            <span className="mt-5">
              DEVELOPMENT ERROR: No sections to display.
            </span>
          )}
        </div>
      </div>
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

const updateLessonWithGoogleDriveFiledPreviewImg = (
  lesson: any,
  lessonToDisplayOntoUi: any
) => {
  let lessonObjUpdated = JSON.parse(JSON.stringify(lesson));

  // getting the thumbnails for the google drive file handouts for each lesson
  if (lesson?.itemList?.length) {
    const itemListUpdated = lesson.itemList.map((itemObj: any) => {
      const googleDriveFileId = itemObj?.links[0]?.url
        ? getGoogleDriveFileIdFromUrl(itemObj.links[0].url)
        : null;

      if (googleDriveFileId) {
        return {
          ...itemObj,
          filePreviewImg: `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`,
        };
      }

      return itemObj;
    });

    lessonObjUpdated = {
      ...lesson,
      itemList: itemListUpdated,
    };
  }

  // getting the status for each lesson
  let lsnStatus =
    Array.isArray(lessonToDisplayOntoUi?.LsnStatuses) &&
    lessonToDisplayOntoUi?.LsnStatuses?.length
      ? lessonToDisplayOntoUi.LsnStatuses.find(
          (lsnStatus: any) => lsnStatus?.lsn == lesson.lsn
        )
      : null;

  if (!lesson.tile && lsnStatus?.status === "Upcoming") {
    lessonObjUpdated = {
      ...lessonObjUpdated,
      tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
    };
  }

  return {
    ...lessonObjUpdated,
    status: lsnStatus?.status ?? "Proto",
  };
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

        const sectionsEntries = Object.entries(targetUnitForUI.Sections) as [
          keyof ISections,
          any
        ][];
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
    }

    const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
    let lessonToDisplayOntoUi = targetLessons.find(
      ({ numID, locale }) => numID === parseInt(id) && locale === loc
    );

    if (
      !targetUnitForUI &&
      (!lessonToDisplayOntoUi || typeof lessonToDisplayOntoUi !== "object")
    ) {
      throw new Error("Lesson is not found.");
    } else if (
      !lessonToDisplayOntoUi ||
      typeof lessonToDisplayOntoUi !== "object"
    ) {
      console.log("Only the target unit is available.");
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
    const headLinks = targetLessons.map(({ locale, numID }) => [
      `https://www.galacticpolymath.com/${UNITS_URL_PATH}/${locale}/${numID}`,
      locale,
    ]);
    lessonToDisplayOntoUi = {
      ...lessonToDisplayOntoUi,
      headLinks,
    };
    let lessonParts = null;
    const resources =
      lessonToDisplayOntoUi?.Section?.["teaching-materials"]?.Data?.classroom
        ?.resources;

    if (resources?.every((resource: any) => resource.lessons)) {
      lessonParts = [];

      // get all of preview images of google drive files
      for (const resource of resources) {
        const resourceLessons = [];

        for (const lesson of resource.lessons) {
          let lessonObjUpdated = JSON.parse(JSON.stringify(lesson));

          if (lesson?.itemList?.length) {
            const itemListUpdated = [];

            for (const itemObj of lesson.itemList) {
              const { links, itemCat } = itemObj;

              if (!itemObj?.links?.length) {
                itemListUpdated.push(itemObj);
                continue;
              }

              if (itemObj?.links?.length) {
                itemObj.links = links.filter(
                  ({ linkText, url }: { linkText: string; url: string }) =>
                    linkText !== "Not shareable on GDrive" || url
                );
              }

              // get the image preview link for the lesson documents
              const isWebResource = itemCat === "web resource";
              const url = links.find((link: any) => link?.url)?.url;
              const googleDriveFileId =
                url && !isWebResource ? getGoogleDriveFileIdFromUrl(url) : null;

              if (googleDriveFileId) {
                const filePreviewImg = `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`;
                const itemObjUpdated = {
                  ...itemObj,
                  filePreviewImg,
                };

                itemListUpdated.push(itemObjUpdated);
                continue;
              }

              const webAppPreview =
                url && isWebResource ? await getLinkPreviewObj(url) : null;

              if (
                webAppPreview &&
                "images" in webAppPreview &&
                webAppPreview?.images &&
                typeof webAppPreview.images[0] === "string"
              ) {
                itemListUpdated.push({
                  ...itemObj,
                  filePreviewImg: webAppPreview.images[0],
                });
                continue;
              }

              itemListUpdated.push(itemObj);
            }

            lessonObjUpdated = {
              ...lesson,
              itemList: itemListUpdated,
            };
          }

          let lsnStatus =
            Array.isArray(lessonToDisplayOntoUi?.LsnStatuses) &&
            lessonToDisplayOntoUi?.LsnStatuses?.length
              ? lessonToDisplayOntoUi.LsnStatuses.find(
                  (lsnStatus: any) => lsnStatus?.lsn == lesson.lsn
                )
              : null;

          if (!lesson.tile && lsnStatus?.status === "Upcoming") {
            lessonObjUpdated = {
              ...lessonObjUpdated,
              tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
            };
          }

          resourceLessons.push({
            ...lessonObjUpdated,
            status: lsnStatus?.status ?? "Proto",
          });
        }

        lessonParts.push(resourceLessons);
      }

      lessonParts = lessonParts.filter((lesson: any) => {
        if (lesson.title === "Assessments") {
          return true;
        }

        return lesson?.status !== "Proto";
      });

      lessonParts.forEach((lessonPartsArr, index) => {
        if (lessonToDisplayOntoUi) {
          lessonToDisplayOntoUi.Section[
            "teaching-materials"
          ].Data.classroom.resources[index].lessons = lessonPartsArr;
        }
      });
    } else if (
      resources?.length > 1 &&
      resources?.every((resource: any) => resource?.lessons)
    ) {
      lessonToDisplayOntoUi.Section[
        "teaching-materials"
      ].Data.classroom.resources = resources.map((resource: any) => {
        const lessonsUpdated = resource.lessons.map((lesson: any) =>
          updateLessonWithGoogleDriveFiledPreviewImg(
            lesson,
            lessonToDisplayOntoUi
          )
        );

        return {
          ...resource,
          lessons: lessonsUpdated,
        };
      });
    }

    const targetLessonLocales = targetLessons.map(({ locale }) => locale);
    const multiMediaArr = lessonToDisplayOntoUi?.Section?.preview?.Multimedia;
    let sponsorLogoImgUrl = lessonToDisplayOntoUi.SponsorImage?.url?.length
      ? lessonToDisplayOntoUi.SponsorImage?.url
      : lessonToDisplayOntoUi.SponsorLogo;
    sponsorLogoImgUrl = Array.isArray(sponsorLogoImgUrl)
      ? sponsorLogoImgUrl[0]
      : sponsorLogoImgUrl;
    const titleProperties = {
      SponsoredBy: lessonToDisplayOntoUi.SponsoredBy,
      Subtitle: lessonToDisplayOntoUi.Subtitle,
      numID: lessonToDisplayOntoUi.numID,
      locale: lessonToDisplayOntoUi.locale,
      sponsorLogoImgUrl: sponsorLogoImgUrl,
      lessonBannerUrl:
        lessonToDisplayOntoUi.CoverImage ?? lessonToDisplayOntoUi.LessonBanner,
      availLocs: targetLessonLocales,
      lessonTitle: lessonToDisplayOntoUi.Title,
      versions: lessonToDisplayOntoUi.Section.versions.Data,
    };
    lessonToDisplayOntoUi = {
      ...lessonToDisplayOntoUi,
      Section: {
        ...lessonToDisplayOntoUi.Section,
        overview: {
          ...lessonToDisplayOntoUi.Section.overview,
          ...titleProperties,
        },
      },
    };

    const multiMediaFalsyValsFilteredOut = multiMediaArr?.length
      ? multiMediaArr.filter((multiMedia: any) => multiMedia?.mainLink)
      : [];
    const isVidOrWebAppPresent = multiMediaFalsyValsFilteredOut?.length
      ? multiMediaFalsyValsFilteredOut.some(
          ({ type }: { type: string }) => type === "web-app" || type === "video"
        )
      : false;

    // preview image for all of the web apps and external videos
    if (isVidOrWebAppPresent) {
      const multiMediaArrUpdated = [];

      for (let multiMediaItem of multiMediaFalsyValsFilteredOut) {
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
          multiMediaArrUpdated.push(multiMediaItem);
          continue;
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
        }

        multiMediaArrUpdated.push(multiMediaItem);
      }

      lessonToDisplayOntoUi = {
        ...lessonToDisplayOntoUi,
        Section: {
          ...lessonToDisplayOntoUi.Section,
          preview: {
            ...lessonToDisplayOntoUi?.Section?.preview,
            Multimedia: multiMediaArrUpdated,
          },
        },
      };
    }

    // get the preview image for the shorts
    if (lessonToDisplayOntoUi?.Section?.preview?.Multimedia?.length) {
      for (const multiMedia of lessonToDisplayOntoUi.Section.preview
        .Multimedia) {
        if (multiMedia?.mainLink?.includes("www.youtube.com/shorts")) {
          multiMedia.mainLink = multiMedia.mainLink.replace("shorts", "embed");
        }
      }
    }

    if (
      lessonToDisplayOntoUi.Section &&
      typeof lessonToDisplayOntoUi.Section === "object"
    ) {
      const sectionEntries = Object.entries(lessonToDisplayOntoUi.Section);
      lessonToDisplayOntoUi.Section = sectionEntries.reduce(
        (sectionAccum, [sectionKey, sectionVal]) => {
          if (!sectionVal) {
            return sectionAccum;
          }

          return {
            ...sectionAccum,
            [sectionKey]: sectionVal,
          };
        },
        {}
      );
    }

    return {
      props: {
        lesson: JSON.parse(JSON.stringify(lessonToDisplayOntoUi)),
        unit: targetUnitForUI
          ? JSON.parse(JSON.stringify(targetUnitForUI))
          : null,
        availLocs: targetLessonLocales,
      },
      revalidate: 30,
    };
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
