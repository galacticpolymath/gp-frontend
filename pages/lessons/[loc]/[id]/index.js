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
import Layout from '../../../../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import ParentLessonSection from '../../../../components/LessonSection/ParentLessonSection';
import LessonsSecsNavDots from '../../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../../components/AboutPgComps/ShareWidget';
import { useRouter } from 'next/router';
import useScrollHandler from '../../../../customHooks/useScrollHandler';
import Lessons from '../../../../backend/models/lesson';
import { connectToMongodb } from '../../../../backend/utils/connection';
import SendFeedback from '../../../../components/LessonSection/SendFeedback';
import { getLinkPreviewObj, removeHtmlTags } from '../../../../globalFns';

const IS_ON_PROD = process.env.NODE_ENV === 'production';
const GOOGLE_DRIVE_THUMBNAIL_URL = 'https://drive.google.com/thumbnail?id='
const NAV_CLASSNAMES = ['sectionNavDotLi', 'sectionNavDot', 'sectionTitleParent', 'sectionTitleLi', 'sectionTitleSpan']

const getSectionDotsDefaultVal = sectionComps => sectionComps.map((section, index) => {
  const _sectionTitle = `${index + 1}. ${section.SectionTitle}`;
  let sectionId = _sectionTitle.replace(/[\s!]/gi, '_').toLowerCase();

  return {
    isInView: index === 0,
    sectionTitleForDot: section.SectionTitle,
    sectionId: sectionId,
    willShowTitle: false,
    sectionDotId: `sectionDot-${sectionId}`,
  }
})

const getLessonSections = sectionComps => sectionComps.map((section, index) => ({
  ...section,
  SectionTitle: `${index + 1}. ${section.SectionTitle}`,
}));
const addGradesOrYearsProperty = (sectionComps, ForGrades, GradesOrYears) => {
  return sectionComps.map(section => {
    if (section?.SectionTitle?.includes("Teaching Materials")) {
      return {
        ...section,
        ForGrades: ForGrades,
        GradesOrYears: GradesOrYears,
      }
    }

    if (['lesson-plan.standards'].includes(section.__component)) {
      return {
        ...section,
        GradesOrYears: GradesOrYears,
      }
    }

    return section;
  });
}

const LessonDetails = ({ lesson }) => {
  const router = useRouter();
  const lessonSectionObjEntries = lesson?.Section ? Object.entries(lesson.Section) : [];
  let lessonStandardsIndexesToFilterOut = [];
  let lessonStandardsSections = lessonSectionObjEntries.filter(([sectionName], index) => {
    if (sectionName.includes('standards') || sectionName === 'learning-chart') {
      lessonStandardsIndexesToFilterOut.push(index);
      return true;
    }

    return false;
  });
  const isTheLessonSectionInOneObj = lessonSectionObjEntries?.length ? lessonStandardsSections.length === 1 : false;
  let sectionComps = lesson?.Section ?
    Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure')
    :
    null;

  if (sectionComps?.length) {
    sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
  }

  if (lesson && !isTheLessonSectionInOneObj && lessonStandardsSections?.length) {
    lessonStandardsSections = structuredClone(lessonStandardsSections.map(([, lessonStandardsObj]) => lessonStandardsObj));
    let lessonStandardsObj = lessonStandardsSections
      .map(lessonStandards => {
        delete lessonStandards.__component;

        return lessonStandards;
      })
      // construct the object that holds all of the sections of the unit
      .reduce((lessonStandardObj, lessonStandardsAccumulatedObj) => {
        let _lessonStandardsAccumulated = { ...lessonStandardsAccumulatedObj };

        if (!lessonStandardsAccumulatedObj.SectionTitle && lessonStandardObj.SectionTitle) {
          _lessonStandardsAccumulated = { ..._lessonStandardsAccumulated, SectionTitle: lessonStandardObj.SectionTitle };
        }

        if (!lessonStandardsAccumulatedObj.Footnote && lessonStandardObj.Footnote) {
          _lessonStandardsAccumulated = { ..._lessonStandardsAccumulated, Footnote: lessonStandardObj.Footnote };
        }

        return _lessonStandardsAccumulated;
      }, {});

    // create the background section 
    lessonStandardsObj = { ...lessonStandardsObj, __component: 'lesson-plan.standards', InitiallyExpanded: true };
    sectionComps = sectionComps.filter((_, index) => !lessonStandardsIndexesToFilterOut.includes(index));
    const backgroundSectionIndex = sectionComps.findIndex(({ SectionTitle }) => SectionTitle === 'Background');

    if (backgroundSectionIndex === -1) {
      console.error('The background section DOES NOT EXIST!')
    }

    sectionComps.splice(backgroundSectionIndex + 1, 0, lessonStandardsObj)
  }

  sectionComps = useMemo(() => {
    sectionComps = sectionComps.filter(section => {
      if (("Data" in section) && !section['Data']) {
        return false;
      }

      return true;
    });

    return addGradesOrYearsProperty(sectionComps, lesson.ForGrades, lesson.GradesOrYears);
  }, [])

  console.log('sectionComps: ', sectionComps);

  const _dots = useMemo(() => sectionComps ? getSectionDotsDefaultVal(sectionComps) : [], [])
  const [sectionDots, setSectionDots] = useState({
    dots: _dots,
    clickedSectionId: null,
  });
  const [willGoToTargetSection, setWillGoToTargetSection] = useState(false);
  const [wasDotClicked, setWasDotClicked] = useState(false)
  const [isScrollListenerOn, setIsScrollListenerOn] = useScrollHandler(setSectionDots);

  const getViewportWidth = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

  const scrollSectionIntoView = sectionId => {
    const targetSection = document.getElementById(sectionId);
    let url = router.asPath;

    if (targetSection) {
      (url.indexOf("#") !== -1) && router.replace(url.split("#")[0]);
      targetSection.scrollIntoView({ behavior: 'smooth', block: (sectionId === "lessonTitleId") ? 'center' : 'start' });
    }
  }

  const handleDocumentClick = event => {
    const wasANavDotElementClicked = NAV_CLASSNAMES.some(className => event.target.classList.contains(className))
    const viewPortWidth = getViewportWidth()

    if (!wasANavDotElementClicked && (viewPortWidth <= 767)) {
      setSectionDots(sectionDots => {
        return {
          ...sectionDots,
          dots: sectionDots?.dots.map(sectionDot => {
            return {
              ...sectionDot,
              willShowTitle: false,
            };
          }),
        }
      })
    }
  }

  useEffect(() => {
    if (willGoToTargetSection) {
      scrollSectionIntoView(sectionDots.clickedSectionId)
      setWillGoToTargetSection(false)
    }
  }, [willGoToTargetSection])

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick);

    return () => document.body.removeEventListener('click', handleDocumentClick);
  }, []);

  const _sections = useMemo(() => sectionComps ? getLessonSections(sectionComps) : [], []);

  if (!lesson && typeof window === "undefined") {
    return null;
  }

  if (!lesson || !_sections?.length || ((typeof window !== "undefined") && lesson.PublicationStatus === "Proto")) {
    router.replace('/error');
    return null;
  }

  const { CoverImage, LessonBanner } = lesson;
  const lessonBannerUrl = CoverImage?.url ?? LessonBanner
  const shareWidgetFixedProps = IS_ON_PROD ?
    {
      pinterestMedia: lessonBannerUrl,
      shareWidgetStyle: { borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', boxShadow: '0 4px 6px 0 rgba(0,0,0,.4), 0 7px 5px -5px rgba(0,0,0,.2)', top: 150, width: "60px" },
    }
    :
    {
      pinterestMedia: lessonBannerUrl,
      developmentUrl: `${lesson.URL}/`,
      shareWidgetStyle: { borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', boxShadow: '0 4px 6px 0 rgba(0,0,0,.4), 0 7px 5px -5px rgba(0,0,0,.2)', top: 150, width: "60px" },
    }
  const layoutProps = {
    title: `Mini-Unit: ${lesson.Title}`,
    description: lesson?.Section?.overview?.LearningSummary ? removeHtmlTags(lesson.Section.overview.LearningSummary) : `Description for ${lesson.Title}.`,
    imgSrc: lessonBannerUrl,
    url: lesson.URL,
    imgAlt: `${lesson.Title} cover image`,
    className: 'overflow-hidden',
  };

  return (
    <Layout {...layoutProps}>
      {(lesson.PublicationStatus === "Beta") && (
        <SendFeedback
          closeBtnDynamicStyles={{ position: "absolute", top: "30px", right: "5px", fontSize: "28px" }}
          parentDivStyles={{ position: 'relative', backgroundColor: "#EBD0FF", zIndex: 100, width: "100vw" }}
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
          )
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  try {
    await connectToMongodb();

    const lessons = await Lessons.find({}, { numID: 1, defaultLocale: 1, _id: 0, locale: 1 }).lean()

    return {
      paths: lessons.map(({ numID, locale }) => ({
        params: { id: `${numID}`, loc: `${locale ?? ''}` },
      })),
      fallback: false,
    };
  } catch (error) {
    console.error('An error has occurred in getting the available paths for the selected lesson page. Error message: ', error)
  }
};

const getGoogleDriveFileIdFromUrl = url => {
  if (typeof url !== "string") {
    return null;
  }

  const urlSplitted = url.split("/");
  const indexOfDInSplittedUrl = urlSplitted.findIndex(str => str === "d");

  if (indexOfDInSplittedUrl === -1) {
    return null;
  }

  const id = urlSplitted[indexOfDInSplittedUrl + 1];

  if (!id) {
    return null;
  }

  return id;
}

const updateLessonWithGoogleDriveFiledPreviewImg = (lesson, lessonToDisplayOntoUi) => {
  let lessonObjUpdated = JSON.parse(JSON.stringify(lesson));

  // getting the thumbnails for the google drive file handouts for each lesson
  if (lesson?.itemList?.length) {
    const itemListUpdated = lesson.itemList.map(itemObj => {
      console.log('itemObj.itemTitle: ', itemObj.itemTitle);
      const googleDriveFileId = itemObj?.links[0]?.url ? getGoogleDriveFileIdFromUrl(itemObj.links[0].url) : null;

      if (googleDriveFileId) {
        return {
          ...itemObj,
          filePreviewImg: `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`,
        }
      }

      return itemObj;
    });

    lessonObjUpdated = {
      ...lesson,
      itemList: itemListUpdated,
    }
  }

  // getting the status for each lesson
  let lsnStatus = (Array.isArray(lessonToDisplayOntoUi?.LsnStatuses) && lessonToDisplayOntoUi?.LsnStatuses?.length) ? lessonToDisplayOntoUi.LsnStatuses.find(lsnStatus => lsnStatus?.lsn == lesson.lsn) : null;

  if (!lesson.tile && (lsnStatus?.status === "Upcoming")) {
    lessonObjUpdated = {
      ...lessonObjUpdated,
      tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
    }
  }

  return {
    ...lessonObjUpdated,
    status: lsnStatus?.status ?? "Proto",
  };
}

export const getStaticProps = async ({ params: { id, loc } }) => {
  try {
    await connectToMongodb();

    const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
    let lessonToDisplayOntoUi = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)));

    if (!lessonToDisplayOntoUi || (typeof lessonToDisplayOntoUi !== 'object')) {
      throw new Error("Lesson is not found.")
    }

    let lessonParts = null;
    const resources = lessonToDisplayOntoUi?.Section?.['teaching-materials']?.Data?.classroom?.resources;
    console.log("what is up there meng yo...")
    if (resources?.every(resource => resource.lessons)) {
      lessonParts = []

      for (const resource of resources) {
        const resourceLessons = [];
        for (const lesson of resource.lessons) {
          let lessonObjUpdated = JSON.parse(JSON.stringify(lesson));

          if (lesson?.itemList?.length) {
            const itemListUpdated = []

            for (const itemObj of lesson.itemList) {
              const { links = [], itemCat } = itemObj;

              if (itemObj?.links?.length) {
                itemObj.links = links.map(link => ({
                  ...link,
                  url: link.url ?? "",
                }));
              }

              const isWebResource = itemCat === 'web resource'
              const googleDriveFileId = (links?.[0]?.url && !isWebResource) ? getGoogleDriveFileIdFromUrl(links[0].url) : null;

              if (googleDriveFileId) {
                itemListUpdated.push({
                  ...itemObj,
                  filePreviewImg: `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`,
                });
                continue;
              }
              console.log('links?.[0]?.url: ', links?.[0]?.url);
              const webAppPreview = (links?.[0]?.url && isWebResource) ? await getLinkPreviewObj(links[0].url) : null

              console.log('sup there meng: ', webAppPreview.images);

              if (webAppPreview?.images?.length && (typeof webAppPreview.images[0] === 'string')) {
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
            }
          }

          let lsnStatus = (Array.isArray(lessonToDisplayOntoUi?.LsnStatuses) && lessonToDisplayOntoUi?.LsnStatuses?.length) ? lessonToDisplayOntoUi.LsnStatuses.find(lsnStatus => lsnStatus?.lsn == lesson.lsn) : null;

          if (!lesson.tile && (lsnStatus?.status === "Upcoming")) {
            lessonObjUpdated = {
              ...lessonObjUpdated,
              tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
            }
          }

          resourceLessons.push({
            ...lessonObjUpdated,
            status: lsnStatus?.status ?? "Proto",
          });
        }

        // const resourceLessons = resource.lessons.map(async lesson => {

        //   if (lesson?.itemList?.length) {
        //     const itemListUpdated = []

        //     for (const itemObj of lesson.itemList) {
        //       const { links = [], itemCat } = itemObj;

        //       if (itemObj?.links?.length) {
        //         itemObj.links = links.map(link => ({
        //           ...link,
        //           url: link.url ?? "",
        //         }));
        //       }

        //       const isWebResource = itemCat === 'web resource'
        //       const googleDriveFileId = (links?.[0]?.url && !isWebResource) ? getGoogleDriveFileIdFromUrl(links[0].url) : null;

        //       if (googleDriveFileId) {
        //         itemListUpdated.push({
        //           ...itemObj,
        //           filePreviewImg: `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`,
        //         });
        //         continue;
        //       }

        //       const webAppPreview = (links?.[0]?.url && !isWebResource) ? await getLinkPreviewObj(links[0].url) : null

        //       if (webAppPreview?.images?.length && (typeof webAppPreview.images[0] === 'string')) {
        //         itemListUpdated.push({
        //           ...itemObj,
        //           filePreviewImg: webAppPreview.images[0],
        //         });
        //         continue;
        //       }

        //       itemListUpdated.push(itemObj);
        //     }

        //     lessonObjUpdated = {
        //       ...lesson,
        //       itemList: itemListUpdated,
        //     }
        //   }

        //   // getting the status for each lesson
        //   let lsnStatus = (Array.isArray(lessonToDisplayOntoUi?.LsnStatuses) && lessonToDisplayOntoUi?.LsnStatuses?.length) ? lessonToDisplayOntoUi.LsnStatuses.find(lsnStatus => lsnStatus?.lsn == lesson.lsn) : null;

        //   if (!lesson.tile && (lsnStatus?.status === "Upcoming")) {
        //     lessonObjUpdated = {
        //       ...lessonObjUpdated,
        //       tile: "https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png",
        //     }
        //   }

        //   return {
        //     ...lessonObjUpdated,
        //     status: lsnStatus?.status ?? "Proto",
        //   };
        // });

        console.log('yo there: ', resourceLessons);

        lessonParts.push(resourceLessons)
      }

      lessonParts = lessonParts.filter(lesson => {
        if (lesson.title === "Assessments") {
          return true;
        }

        return lesson?.status !== "Proto"
      });

      lessonParts.forEach((lessonPartsArr, index) => {
        lessonToDisplayOntoUi.Section['teaching-materials'].Data.classroom.resources[index].lessons = lessonPartsArr;
      });
    } else if ((resources?.length > 1) && resources?.every(({ lessons }) => lessons)) {
      lessonToDisplayOntoUi.Section['teaching-materials'].Data.classroom.resources = resources.map(resource => {
        const lessonsUpdated = resource.lessons.map(lesson => updateLessonWithGoogleDriveFiledPreviewImg(lesson, lessonToDisplayOntoUi))

        return {
          ...resource,
          lessons: lessonsUpdated,
        }
      });
    }

    const targetLessonLocales = targetLessons.map(({ locale }) => locale)
    const multiMediaArr = lessonToDisplayOntoUi?.Section?.preview?.Multimedia;
    let sponsorLogoImgUrl = lessonToDisplayOntoUi.SponsorImage?.url?.length ? lessonToDisplayOntoUi.SponsorImage?.url : lessonToDisplayOntoUi.SponsorLogo;
    sponsorLogoImgUrl = Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl;
    const titleProperties = {
      SponsoredBy: lessonToDisplayOntoUi.SponsoredBy,
      Subtitle: lessonToDisplayOntoUi.Subtitle,
      numID: lessonToDisplayOntoUi.numID,
      locale: lessonToDisplayOntoUi.locale,
      sponsorLogoImgUrl: sponsorLogoImgUrl,
      lessonBannerUrl: lessonToDisplayOntoUi.CoverImage ?? lessonToDisplayOntoUi.LessonBanner,
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

    const multiMediaWebAppNoFalsyVals = multiMediaArr?.length ? multiMediaArr.filter(multiMedia => multiMedia) : [];
    const isThereAWebApp = multiMediaWebAppNoFalsyVals?.length ? multiMediaWebAppNoFalsyVals.some(({ type }) => (type === 'web-app') || (type === 'video')) : false;

    if (isThereAWebApp) {
      const multiMediaArrUpdated = [];

      for (let multiMediaItem of multiMediaArr) {
        if ((multiMediaItem.type === 'video') && multiMediaItem?.mainLink?.includes("drive.google")) {
          const videoId = multiMediaItem.mainLink.split("/").at(-2);
          multiMediaItem = {
            ...multiMediaItem,
            webAppPreviewImg: `https://drive.google.com/thumbnail?id=${videoId}`,
            webAppImgAlt: `'${multiMediaItem.title}' video`,
          }
          multiMediaArrUpdated.push(multiMediaItem);
          continue;
        }

        if ((multiMediaItem.type === 'web-app') && multiMediaItem?.mainLink) {
          const { errMsg, images, title } = await getLinkPreviewObj(multiMediaItem?.mainLink);

          if (errMsg && !images?.length) {
            console.error('Failed to get the image preview of web app. Error message: ', errMsg)
          }

          multiMediaItem = {
            ...multiMediaItem,
            webAppPreviewImg: (errMsg || !images?.length) ? null : images[0],
            webAppImgAlt: (errMsg || !images?.length) ? null : `${title}'s preview image`,
          }
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
      }
    }

    console.log("lessonToDisplayOntoUi?.Section?.preview?.Multimedia: ",
      lessonToDisplayOntoUi?.Section?.preview?.Multimedia
    )

    if (lessonToDisplayOntoUi?.Section?.preview?.Multimedia?.length) {
      for (const multiMedia of lessonToDisplayOntoUi.Section.preview.Multimedia) {
        if (multiMedia?.mainLink.includes('www.youtube.com/shorts')) {
          multiMedia.mainLink = multiMedia.mainLink.replace('shorts', 'embed');
        }
      }
    }

    return {
      props: {
        lesson: JSON.parse(JSON.stringify(lessonToDisplayOntoUi)),
        availLocs: targetLessonLocales,
      },
      revalidate: 30,
    };
  } catch (error) {
    console.error('Failed to get lesson. Error message: ', error)

    return {
      props: {
        lesson: null,
        availLocs: null,
      },
      revalidate: 30,
    }
  }
};

export default LessonDetails;