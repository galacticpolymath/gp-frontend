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
import { format } from 'date-fns';
import Image from 'next/image';
import Layout from '../../../../components/Layout';
import RichText from '../../../../components/RichText';
import LocDropdown from '../../../../components/LocDropdown';
import { useEffect, useState } from 'react';
import ParentLessonSection from '../../../../components/LessonSection/ParentLessonSection';
import { useInView } from 'react-intersection-observer';
import LessonsSecsNavDots from '../../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../../components/AboutPgComps/ShareWidget';
import { useRouter } from 'next/router';
import useScrollHandler from '../../../../customHooks/useScrollHandler';
import Lessons from '../../../../backend/models/lesson';
import { connectToMongodb } from '../../../../backend/utils/connection';
import { getLinkPreview } from "link-preview-js";

// GOAL: merge the title section with the lesson section 

// GOAL: change the number of dots to 9

// brain dump notes: 
// the lesson dots will be 9 

const IS_ON_PROD = process.env.NODE_ENV === 'production';
const NAV_CLASSNAMES = ['sectionNavDotLi', 'sectionNavDot', 'sectionTitleParent', 'sectionTitleLi', 'sectionTitleSpan']

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;

  if (!versionSection) return null;

  const lastRelease = versionSection.Data[versionSection?.Data?.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease?.length - 1];

  return lastSubRelease;
};

const getSectionTitle = (sectionComps, sectionTitle) => {
  const targetSectionTitleIndex = sectionComps.findIndex(({ SectionTitle }) => SectionTitle === sectionTitle);

  if (targetSectionTitleIndex === -1) return -1;

  return `${targetSectionTitleIndex + 1}. ${sectionTitle}`
}

const removeHtmlTags = str => str.replace(/<[^>]*>/g, '');

const getSectionDotsDefaultVal = (lessonSection, sectionComps) => {
  const _sections = Object.values(lessonSection).filter(({ SectionTitle }) => SectionTitle !== 'Procedure')
  let startingSectionVals = [{ sectionId: 'title', isInView: true, SectionTitle: 'Title' }, ..._sections]
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
}

const LessonDetails = ({ lesson, availLocs }) => {
  const router = useRouter();
  const { ref } = useInView({ threshold: 0.2 });
  let sectionComps = null;

  useEffect(() => {
    console.log("lesson: ", lesson)
  })

  if (lesson) {
    sectionComps = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
    sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
    sectionComps = sectionComps.filter(({ SectionTitle }) => !!SectionTitle)
  }

  const [sectionDots, setSectionDots] = useState({
    dots: sectionComps ? getSectionDotsDefaultVal(lesson.Section, sectionComps) : {},
    clickedSectionId: null
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

  const handleBtnClick = () => {
    if (!document.getElementById('versions-container')?.offsetParent) {
      const headingVersionsElement = document.getElementById('heading_versions');
      headingVersionsElement.querySelector('button').click();
    }

    window.location.href = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#9._version_notes`
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
  const lastSubRelease = getLatestSubRelease(lesson.Section);
  let _sections = getLessonSections(lesson.Section, sectionComps);
  const sponsorLogoImgUrl = lesson?.SponsorImage?.url?.length ? lesson?.SponsorImage?.url : lesson.SponsorLogo
  const shareWidgetFixedProps = IS_ON_PROD ? { isOnSide: true, pinterestMedia: lessonBannerUrl } : { isOnSide: true, pinterestMedia: lessonBannerUrl, developmentUrl: `${lesson.URL}/` }
  const layoutProps = {
    title: `Mini-Unit: ${lesson.Title}`,
    description: lesson?.Section?.overview?.LearningSummary ? removeHtmlTags(lesson.Section.overview.LearningSummary) : `Description for ${lesson.Title}.`,
    imgSrc: lessonBannerUrl,
    url: lesson.URL,
    imgAlt: `${lesson.Title} cover image`,
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
      <div id="lessonTitleSec" className="container d-flex justify-content-center pt-4 pb-4">
        <div id="lessonTitleSecId" className="d-flex justify-content-center align-items-center SectionHeading lessonTitleId">
          <div className="col-11 col-md-10">
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
              {lastSubRelease && (
                <button onClick={handleBtnClick} className='underline-on-hover no-btn-styles' style={{ color: 'black' }}>
                  <span style={{ fontWeight: 'bolder' }}>
                    Version {lastSubRelease.version}{' '}
                    (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
                  </span>
                </button>
              )}
              <LocDropdown
                availLocs={availLocs}
                loc={lesson.locale}
                id={lesson.numID}
              />
            </div>
            <h1 id="lessonTitleId" ref={ref} className="mt-2">{lesson.Title}</h1>
            <h4 className='fw-light'>{lesson.Subtitle}</h4>
            {lessonBannerUrl && (
              <div className='w-100 position-relative mt-2 mb-2'>
                <Image
                  src={lessonBannerUrl}
                  alt={lesson.Subtitle}
                  width={1500}
                  height={450}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: 'contain' }}
                />
              </div>
            )}
            <div className='d-flex d-md-none'>
              <label className='d-flex justify-content-center align-items-center'>Share: </label>
              {IS_ON_PROD ? <ShareWidget pinterestMedia={lessonBannerUrl} /> : <ShareWidget developmentUrl={`${lesson.URL}/`} pinterestMedia={lessonBannerUrl} />}
            </div>
            <div className='row mt-4 d-flex flex-column flex-sm-row align-content-center'>
              <div className="col-12 col-sm-8 col-md-8 col-lg-9 d-grid">
                <h5>Sponsored by:</h5>
                <RichText content={lesson.SponsoredBy} />
              </div>
              <div className="col-6 col-sm-4 col-md-4 col-lg-3 m-auto d-grid">
                {sponsorLogoImgUrl && (
                  <div style={{ height: "180px" }} className='position-relative sponsorImgContainer d-sm-block d-flex justify-content-center align-items-center w-100'>
                    <Image
                      src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                      alt={lesson.Subtitle}
                      className='sponsorImg'
                      sizes="225px"
                      fill
                      style={{ width: "100%", objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-1 px-sm-4 container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
        <div className="col-11 col-md-10 p-0">
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
    const targetLessonLocales = targetLessons.map(({ locale }) => locale)
    let lessonToDisplayOntoUi = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)))
    const multiMediaArr = lessonToDisplayOntoUi?.Section?.preview?.Multimedia;

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

      // GOAL: get the versions from the section object 

      const {
        CoverImage, 
        LessonBanner,
        locale,
        numID,
        Subtitle,
        SponsoredBy,
        Title,
        Section,
        preview,
        SponsorImage,
        SponsorLogo
      } = lessonToDisplayOntoUi ?? {};
      let sponsorLogoImgUrl = SponsorImage?.url?.length ? SponsorImage?.url : SponsorLogo;
      sponsorLogoImgUrl = Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl; 
      lessonToDisplayOntoUi = {
        ...lessonToDisplayOntoUi,
        Section: {
          ...Section,
          overview: {
            ...Section.overview,
            SponsoredBy,
            Subtitle,
            numID,
            locale,
            sponsorLogoImgUrl,
            lessonBannerUrl: CoverImage ?? LessonBanner,
            availLocs: targetLessonLocales,
            lessonTitle: Title,
            versions: Section.versions.Data 
          },
          preview: {
            ...preview,
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
    console.error('Faild to get lesson. Error message: ', error)

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