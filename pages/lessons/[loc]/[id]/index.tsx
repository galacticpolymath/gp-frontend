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
import Layout from "../../../../components/Layout";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  ModalContext,
  useModalContext,
} from "../../../../providers/ModalProvider";
import { CustomNotifyModalFooter } from "../../../../components/Modals/Notify";
import { getUserAccountData } from "../../../account";
import axios from "axios";
import {
  UserContext,
  useUserContext,
} from "../../../../providers/UserProvider";
import {
  ILessonForUI,
  ISectionDot,
  ISectionDots,
  IUserSession,
} from "../../../../types/global";
import { ILesson } from "../../../../backend/models/Unit/types/teachingMaterials";
import { IOldUnit } from "../../../../backend/models/Unit/types/oldUnit";
import { INewUnitSchema } from "../../../../backend/models/Unit/types/unit";
import { Session } from "next-auth";

const IS_ON_PROD = process.env.NODE_ENV === "production";
const GOOGLE_DRIVE_THUMBNAIL_URL = "https://drive.google.com/thumbnail?id=";
const NAV_CLASSNAMES = [
  "sectionNavDotLi",
  "sectionNavDot",
  "sectionTitleParent",
  "sectionTitleLi",
  "sectionTitleSpan",
];

const getSectionDotsDefaultVal = (sectionComps) =>
  sectionComps.map((section, index) => {
    const _sectionTitle = `${index}. ${section.SectionTitle}`;
    const sectionId = _sectionTitle.replace(/[\s!]/gi, "_").toLowerCase();

    return {
      isInView: index === 0,
      sectionTitleForDot: section.SectionTitle,
      sectionId: sectionId,
      willShowTitle: false,
      sectionDotId: `sectionDot-${sectionId}`,
    };
  });

const getLessonSections = (sectionComps) =>
  sectionComps.map((section, index) => ({
    ...section,
    SectionTitle: `${index}. ${section.SectionTitle}`,
  }));
const addGradesOrYearsProperty = (sectionComps, ForGrades, GradesOrYears) => {
  return sectionComps.map((section) => {
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
  lesson: IOldUnit;
  lessonFromDb: any;
  unit?: INewUnitSchema;
}

const LessonDetails = ({ lesson, lessonFromDb, unit }: IProps) => {
  console.log("the lesson itself: ", lesson);
  console.log("the lesson itself, yo there: ", lessonFromDb);
  const router = useRouter();
  const { _isUserTeacher } = useUserContext();
  const { status, data } = useSession();
  const { token } = (data ?? {}) as unknown as IUserSession;
  const statusRef = useRef(status);
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
  // TODO: this needs to be deleted when the schema is updated (BELOW).
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
  );
  const isTheLessonSectionInOneObj = lessonSectionObjEntries?.length
    ? lessonStandardsSections?.length === 1
    : false;
  let sectionComps =
    lesson?.Section &&
    typeof lesson?.Section === "object" &&
    lesson?.Section !== null
      ? Object.values(lesson.Section).filter(section => {
        if("SectionTitle" in section){
          return section.SectionTitle !== "Procedure";
        }

        return false;
      })
      : null;

  if (sectionComps?.length) {
    sectionComps[0] = { ...sectionComps[0], SectionTitle: "Overview" };
  }

  if (
    lesson &&
    !isTheLessonSectionInOneObj &&
    lessonStandardsSections?.length
  ) {
    const lessonStandardsSectionsObjs = structuredClone(
      lessonStandardsSections.map(
        ([, lessonStandardsObj]) => lessonStandardsObj
      )
    );
    type TLessonStandardsSectionsObj = typeof lessonStandardsSectionsObjs;
    let lessonStandardsObj = lessonStandardsSectionsObjs
      .map((lessonStandards) => {
        delete lessonStandards.__component;

        return lessonStandards;
      })
      .reduce((lessonStandardObj, lessonStandardsAccumulatedObj) => {
        let _lessonStandardsAccumulated = { ...lessonStandardsAccumulatedObj };

        if (
          // check if SectionTitle exist
          "SectionTitle" in lessonStandardsAccumulatedObj &&
          !lessonStandardsAccumulatedObj.SectionTitle &&
          "SectionTitle" in lessonStandardObj &&
          typeof lessonStandardObj.SectionTitle === "string"
        ) {
          _lessonStandardsAccumulated = {
            ..._lessonStandardsAccumulated,
            SectionTitle: lessonStandardObj.SectionTitle,
          };
        }

        if (
          "Footnote" in lessonStandardsAccumulatedObj &&
          !lessonStandardsAccumulatedObj.Footnote &&
          "Footnote" in lessonStandardObj &&
          lessonStandardObj.Footnote &&
          typeof lessonStandardObj.Footnote === "string" &&
        ) {
          _lessonStandardsAccumulated = {
            ..._lessonStandardsAccumulated,
            Footnote: lessonStandardObj.Footnote,
          };
        }

        return _lessonStandardsAccumulated;
      }, {} as TLessonStandardsSectionsObj);

    // create the stanards section section
    lessonStandardsObj = {
      ...lessonStandardsObj,
      __component: "lesson-plan.standards",
      InitiallyExpanded: true,
    };
    sectionComps = sectionComps.filter(
      (_, index) => !lessonStandardsIndexesToFilterOut?.includes(index)
    );
    let lessonsStandardsSectionIndex = sectionComps.findIndex(
      ({ SectionTitle }) => SectionTitle === "Background"
    );

    if (lessonsStandardsSectionIndex === -1) {
      lessonsStandardsSectionIndex = sectionComps.findIndex(
        ({ SectionTitle }) => SectionTitle === "Bonus Content"
      );
    }

    if (lessonsStandardsSectionIndex === -1) {
      lessonsStandardsSectionIndex = sectionComps.findIndex(
        ({ SectionTitle }) => SectionTitle === "Teaching Materials"
      );
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

  // TODO: this needs to be deleted when the schema is updated (ABOVE).

  sectionComps = useMemo(() => {
    if (!sectionComps?.length) {
      return [];
    }

    sectionComps = sectionComps.filter((section) => {
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
      (sectionComp) => {
        const sectionTitle = sectionComp.SectionTitle.replace(
          /[0-9.]/g,
          ""
        ).trim();

        return sectionTitle === "Teaching Materials";
      }
    );
    const feedbackSecIndex = sectionCompsCopy.findIndex((sectionComp) => {
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

  console.log("_sections, hey there: ", _sections);

  const _dots = useMemo(
    () => (sectionComps?.length ? getSectionDotsDefaultVal(sectionComps) : []),
    []
  );

  // Get the lesson from the database, compare each section, and view what fields do not appear in the original
  // object found in the database

  const [sectionDots, setSectionDots] = useState<ISectionDots>({
    dots: _dots,
    clickedSectionId: null,
  });

  useEffect(() => {
    console.log("sectionDots, yo there: ", sectionDots);
  }, []);

  const [willGoToTargetSection, setWillGoToTargetSection] = useState(false);
  const [wasDotClicked, setWasDotClicked] = useState(false);
  const [isScrollListenerOn, setIsScrollListenerOn] =
    useScrollHandler(setSectionDots);

  const scrollSectionIntoView = (sectionId) => {
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

  const handleDocumentClick = (event) => {
    const wasANavDotElementClicked = NAV_CLASSNAMES.some((className) =>
      event.target.classList.contains(className)
    );
    const viewPortWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );

    if (!wasANavDotElementClicked && viewPortWidth <= 767) {
      setSectionDots((sectionDots) => {
        return {
          ...sectionDots,
          dots: sectionDots?.dots.map((sectionDot) => {
            return {
              ...sectionDot,
              willShowTitle: false,
            };
          }),
        };
      });
    }
  };
  const handleUserNeedsAnAccountHideModal = () => {
    setNotifyModal(defautlNotifyModalVal);
    setCustomModalFooter(null);
  };

  const handleIsUserEntryModalDisplayed = (setIsModalOn) => () => {
    setNotifyModal((state) => ({ ...state, isDisplayed: false }));

    setTimeout(() => {
      handleUserNeedsAnAccountHideModal();
      setIsModalOn(true);
    }, 250);
  };

  const handleBonusContentDocumentClick = (event) => {
    const isWithinBonusContentSec = getIsWithinParentElement(
      event.target,
      "Bonus_Content",
      "className"
    );
    const { tagName, origin } = event.target ?? {};

    if (
      statusRef.current !== "authenticated" &&
      isWithinBonusContentSec &&
      tagName === "A" &&
      origin === "https://storage.googleapis.com"
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
      });
    }
  };

  useEffect(() => {
    if (willGoToTargetSection) {
      scrollSectionIntoView(sectionDots.clickedSectionId);
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

  if (!lesson && typeof window === "undefined") {
    return null;
  }

  if (!lesson || !_sections?.length) {
    router.replace("/error");
    return null;
  }

  const { CoverImage, LessonBanner } = lesson;
  const lessonBannerUrl = CoverImage?.url ?? LessonBanner;
  const shareWidgetFixedProps = IS_ON_PROD
    ? {
        pinterestMedia: lessonBannerUrl,
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
        pinterestMedia: lessonBannerUrl,
        developmentUrl: `${lesson.URL}/`,
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
    title: `Mini-Unit: ${lesson.Title}`,
    description: lesson?.Section?.overview?.LearningSummary
      ? removeHtmlTags(lesson.Section.overview.LearningSummary)
      : `Description for ${lesson.Title}.`,
    imgSrc: lessonBannerUrl,
    url: lesson.URL,
    imgAlt: `${lesson.Title} cover image`,
    className: "overflow-hidden",
    canonicalLink: `https://www.galacticpolymath.com/lessons/${lesson.numID}`,
    defaultLink: `https://www.galacticpolymath.com/lessons/${lesson.numID}`,
    langLinks: lesson.headLinks,
  };

  return (
    <Layout {...layoutProps}>
      {lesson.PublicationStatus === "Beta" && (
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
        _sectionDots={[sectionDots, setSectionDots]}
        setWillGoToTargetSection={setWillGoToTargetSection}
        setIsScrollListenerOn={setIsScrollListenerOn}
        isScrollListenerOn={isScrollListenerOn}
        setWasDotClicked={setWasDotClicked}
      />
      <ShareWidget {...shareWidgetFixedProps} />
      <div className="col-12 col-lg-10 col-xxl-12 px-3 px-xxl-0 container">
        <div className="p-sm-3 pt-0">
          {_sections.map((section, index) => (
            <ParentLessonSection
              key={index}
              section={section}
              ForGrades={lesson.ForGrades}
              index={index}
              _sectionDots={[sectionDots, setSectionDots]}
              _wasDotClicked={[wasDotClicked, setWasDotClicked]}
              _isScrollListenerOn={[isScrollListenerOn, setIsScrollListenerOn]}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  try {
    await connectToMongodb(15_000, 0, true);

    const lessons = await Lessons.find(
      {},
      { numID: 1, defaultLocale: 1, _id: 0, locale: 1 }
    ).lean();

    return {
      paths: lessons.map(({ numID, locale }) => ({
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

const getGoogleDriveFileIdFromUrl = (url) => {
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
  lesson: ILessonForUI,
  unit: IOldUnit
) => {
  let lessonObjUpdated: ILessonForUI = JSON.parse(JSON.stringify(lesson));

  // getting the thumbnails for the google drive file handouts for each lesson
  if (lesson?.itemList?.length) {
    const itemListUpdated = lesson.itemList.map((itemObj) => {
      const googleDriveFileId = itemObj?.links?.[0]?.url
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
    Array.isArray(unit?.LsnStatuses) && unit?.LsnStatuses?.length
      ? unit.LsnStatuses.find((lsnStatus) => lsnStatus?.lsn == lesson.lsn)
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

    const { wasSuccessful } = await connectToMongodb(15_000, 0, true);

    if (!wasSuccessful) {
      throw new Error("Failed to connect to the database.");
    }

    const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
    let lessonToDisplayOntoUi = targetLessons.find(
      ({ numID, locale }) => numID === parseInt(id) && locale === loc
    );
    const lessonFromDb = structuredClone(lessonToDisplayOntoUi);

    if (!lessonToDisplayOntoUi || typeof lessonToDisplayOntoUi !== "object") {
      throw new Error("Lesson is not found.");
    }

    const headLinks = targetLessons.map(({ locale, numID }) => [
      `https://www.galacticpolymath.com/lessons/${locale}/${numID}`,
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

    if (resources?.every((resource) => resource.lessons)) {
      lessonParts = [];

      // get all of preview images of google drive files for the teaching materials section
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
                  ({ linkText, url }) =>
                    linkText !== "Not shareable on GDrive" || url
                );
              }

              const isWebResource = itemCat === "web resource";
              const url = links.find((link) => link?.url)?.url;
              const googleDriveFileId =
                url && !isWebResource ? getGoogleDriveFileIdFromUrl(url) : null;

              if (googleDriveFileId) {
                const filePreviewImg = `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`;

                itemListUpdated.push({
                  ...itemObj,
                  filePreviewImg,
                });
                continue;
              }

              const webAppPreview =
                url && isWebResource ? await getLinkPreviewObj(url) : null;

              if (
                webAppPreview?.images?.length &&
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
                  (lsnStatus) => lsnStatus?.lsn == lesson.lsn
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

      lessonParts = lessonParts.filter((lesson) => {
        if (lesson.title === "Assessments") {
          return true;
        }

        return lesson?.status !== "Proto";
      });

      lessonParts.forEach((lessonPartsArr, index) => {
        lessonToDisplayOntoUi.Section[
          "teaching-materials"
        ].Data.classroom.resources[index].lessons = lessonPartsArr;
      });
    } else if (
      resources?.length > 1 &&
      resources?.every(({ lessons }) => lessons)
    ) {
      lessonToDisplayOntoUi.Section[
        "teaching-materials"
      ].Data.classroom.resources = resources.map((resource) => {
        const lessonsUpdated = resource.lessons.map((lesson) =>
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
      ? multiMediaArr.filter((multiMedia) => multiMedia?.mainLink)
      : [];
    const isVidOrWebAppPresent = multiMediaFalsyValsFilteredOut?.length
      ? multiMediaFalsyValsFilteredOut.some(
          ({ type }) => type === "web-app" || type === "video"
        )
      : false;

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
          const { errMsg, images, title } = await getLinkPreviewObj(
            multiMediaItem?.mainLink
          );

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

    if (lessonToDisplayOntoUi?.Section?.preview?.Multimedia?.length) {
      for (const multiMedia of lessonToDisplayOntoUi.Section.preview
        .Multimedia) {
        if (multiMedia?.mainLink?.includes("www.youtube.com/shorts")) {
          multiMedia.mainLink = multiMedia.mainLink.replace("shorts", "embed");
        }
      }
    }

    return {
      props: {
        lesson: JSON.parse(JSON.stringify(lessonToDisplayOntoUi)),
        lessonFromDb: JSON.parse(JSON.stringify(lessonFromDb)),
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
