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
import { useEffect, useState } from 'react';
import ParentLessonSection from '../../../../components/LessonSection/ParentLessonSection';
import LessonsSecsNavDots from '../../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../../components/AboutPgComps/ShareWidget';
import { useRouter } from 'next/router';
import useScrollHandler from '../../../../customHooks/useScrollHandler';
import Lessons from '../../../../backend/models/lesson';
import { connectToMongodb } from '../../../../backend/utils/connection';
import { getLinkPreview } from "link-preview-js";

const IS_ON_PROD = process.env.NODE_ENV === 'production';
const NAV_CLASSNAMES = ['sectionNavDotLi', 'sectionNavDot', 'sectionTitleParent', 'sectionTitleLi', 'sectionTitleSpan']

const getSectionTitle = (sectionComps, sectionTitle) => {
  const targetSectionTitleIndex = sectionComps.findIndex(({ SectionTitle }) => SectionTitle === sectionTitle);

  if (targetSectionTitleIndex === -1) return -1;

  return `${targetSectionTitleIndex + 1}. ${sectionTitle}`
}

const removeHtmlTags = str => str.replace(/<[^>]*>/g, '');

const getSectionDotsDefaultVal = (lessonSection, sectionComps) => {
  const _sections = Object.values(lessonSection).filter(({ SectionTitle }) => SectionTitle !== 'Procedure')
  let startingSectionVals = [..._sections]
  startingSectionVals = startingSectionVals.filter(section => {
    if (((section?.__component === 'lesson-plan.overview') && !section?.SectionTitle)) {
      return true
    }

    return !!section?.SectionTitle
  })

  return startingSectionVals.map((section, index) => {
    const { SectionTitle, __component } = section
    const sectionTitleForDot = (__component === 'lesson-plan.overview') ? 'Overview' : `${SectionTitle}`;
    let _sectionTitle = getSectionTitle(sectionComps, SectionTitle);
    _sectionTitle = (_sectionTitle !== -1) ? _sectionTitle : '1. Overview';
    let sectionId = _sectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
    sectionId = (index === 0) ? 'lessonTitleId' : sectionId

    return {
      isInView: index === 0,
      sectionTitleForDot: sectionTitleForDot,
      sectionId: sectionId,
      willShowTitle: false,
      sectionDotId: `sectionDot-${sectionId}`,
      SectionTitle: index === 0 ? '0. Title' : _sectionTitle,
    }
  })
}

const getLessonSections = (lessonSection, sectionComps) => {
  return Object.values(lessonSection).filter(({ SectionTitle }) => SectionTitle !== 'Procedure').map((section, index) => {
    const sectionTitle = getSectionTitle(sectionComps, section.SectionTitle);

    if (index === 0) {
      return {
        ...section,
        SectionTitle: `${index + 1}. Overview`,
      }
    }

    if (sectionTitle === -1) {
      return {
        ...section,
        SectionTitle: getSectionTitle(sectionComps, 'Learning Standards'),
      }
    }

    return {
      ...section,
      SectionTitle: sectionTitle,
    }
  })
};

const LessonDetails = ({ lesson }) => {
  const router = useRouter();
  let sectionComps = null;

  console.log("process.env: ", process.env.NEXT_PUBLIC_VERCEL_ENV)

  if (lesson) {
    sectionComps = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
    sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
    sectionComps = sectionComps.filter(({ SectionTitle }) => !!SectionTitle)
  }

  const [sectionDots, setSectionDots] = useState({
    dots: sectionComps ? getSectionDotsDefaultVal(lesson.Section, sectionComps) : {},
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

  if (!lesson && typeof window === "undefined") {
    return null;
  }

  if (!lesson) {
    router.replace('/error');
    return null;
  }

  const { CoverImage, LessonBanner } = lesson;
  const lessonBannerUrl = CoverImage?.url ?? LessonBanner
  let _sections = getLessonSections(lesson.Section, sectionComps);
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
      <LessonsSecsNavDots
        _sectionDots={[sectionDots, setSectionDots]}
        setWillGoToTargetSection={setWillGoToTargetSection}
        setIsScrollListenerOn={setIsScrollListenerOn}
        isScrollListenerOn={isScrollListenerOn}
        setWasDotClicked={setWasDotClicked}
      />
      <ShareWidget {...shareWidgetFixedProps} />
      <div className="col-12 col-lg-10 px-3 container">
        <div className="p-3 pt-0">
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

    const lessons = await Lessons.find({}, { numID: 1, locale: 1, _id: 0 }).lean()

    return {
      paths: lessons.map(({ numID, locale }) => ({
        params: { id: `${numID}`, loc: `${locale}` },
      })),
      fallback: false,
    };
  } catch (error) {
    console.error('An error has occurred in getting the available paths for the selected lesson page. Error message: ', error)
  }
};

async function getLinkPreviewObj(url) {
  try {
    const linkPreviewObj = await getLinkPreview(url);

    return linkPreviewObj;
  } catch (error) {
    const errMsg = `An error has occurred in getting the link preview for given url. Error message: ${error}.`;
    console.error(errMsg);

    return { errMsg }
  }
}

export const getStaticProps = async ({ params: { id, loc } }) => {
  try {
    await connectToMongodb();

    const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
    let lessonToDisplayOntoUi = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)))

    if (!lessonToDisplayOntoUi || (typeof lessonToDisplayOntoUi !== 'object')) {
      throw new Error("Lesson is not found.")
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
    }

    if (multiMediaArr?.length && multiMediaArr.some(({ type }) => type === 'web-app')) {
      let multiMediaArrUpdated = []

      for (let numIteration = 0; numIteration < multiMediaArr.length; numIteration++) {
        let multiMediaItem = multiMediaArr[numIteration]

        if (multiMediaItem.type === 'web-app') {
          const { errMsg, images, title } = await getLinkPreviewObj(multiMediaItem.mainLink)

          if (errMsg && !images?.length) {
            console.error('Failed to get the image preview of web app. Error message: ', errMsg)
          }

          multiMediaItem = {
            ...multiMediaItem,
            webAppPreviewImg: (errMsg || !images?.length) ? null : images[0],
            webAppImgAlt: (errMsg || !images?.length) ? null : `${title}'s preview image`,
          }
        }

        multiMediaArrUpdated.push(multiMediaItem)
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