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
import Layout from '../../../components/Layout';
import RichText from '../../../components/RichText';
import LocDropdown from '../../../components/LocDropdown';
import { useEffect, useMemo, useState } from 'react';
import ParentLessonSection from '../../../components/LessonSection/ParentLessonSection';
import { useInView } from 'react-intersection-observer';
import LessonsSecsNavDots from '../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../components/AboutPgComps/ShareWidget';
import { useRouter } from 'next/router';
import useScrollHandler from '../../../customHooks/useScrollHandler';
import Link from 'next/link';
import Lessons from '../../../backend/models/lesson';
import { connectToMongodb } from '../../../backend/utils/connection';

const isOnProduction = process.env.NODE_ENV === 'production';
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

const LessonDetails = ({ lesson, availLocs }) => {
  const { CoverImage, LessonBanner } = lesson;
  const LessonBannerImgUrl = CoverImage?.url ?? LessonBanner 
  const lastSubRelease = getLatestSubRelease(lesson.Section);
  const { ref } = useInView({ threshold: 0.2 });
  const router = useRouter()
  let sectionComps = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
  sectionComps[0] = { ...sectionComps[0], SectionTitle: 'Overview' };
  sectionComps = sectionComps.filter(({ SectionTitle }) => !!SectionTitle)
  const _sections = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure').map((section, index) => {
    // can be -1 if the section is not found
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
  });

  const getViewportWidth = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

  const getSectionDotsDefaultVal = () => {
    const _sections = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure')
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

  const _sectionDots = useMemo(() => getSectionDotsDefaultVal(), [])
  const [sectionDots, setSectionDots] = useState({ dots: _sectionDots, clickedSectionId: null })
  const [willGoToTargetSection, setWillGoToTargetSection] = useState(false)

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

  const removeHtmlTags = str => str.replace(/<[^>]*>/g, '');

  const [wasDotClicked, setWasDotClicked] = useState(false)
  const [isScrollListenerOn, setIsScrollListenerOn] = useScrollHandler(setSectionDots)
  const shareWidgetFixedProps = isOnProduction ? { isOnSide: true, pinterestMedia: LessonBannerImgUrl } : { isOnSide: true, pinterestMedia: LessonBannerImgUrl, developmentUrl: `${lesson.URL}/` }
  const layoutProps = { title: `Mini-Unit: ${lesson.Title}`, description: lesson?.Section?.overview?.LearningSummary ? removeHtmlTags(lesson.Section.overview.LearningSummary) : `Description for ${lesson.Title}.`, imgSrc: LessonBannerImgUrl, url: lesson.URL, imgAlt: `${lesson.Title} cover image` }

  useEffect(() => {
    if (willGoToTargetSection) {
      scrollSectionIntoView(sectionDots.clickedSectionId)
      setWillGoToTargetSection(false)
    }
  }, [willGoToTargetSection])

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick);

    return () => document.body.removeEventListener('click', handleDocumentClick);
  }, [])

  return (
    <Layout {...layoutProps}>
      <LessonsSecsNavDots _sectionDots={[sectionDots, setSectionDots]} setWillGoToTargetSection={setWillGoToTargetSection} setIsScrollListenerOn={setIsScrollListenerOn} isScrollListenerOn={isScrollListenerOn} setWasDotClicked={setWasDotClicked} />
      <ShareWidget {...shareWidgetFixedProps} />
      <div id="lessonTitleSec" className="container d-flex justify-content-center pt-4 pb-4">
        <div id="lessonTitleSecId" className="d-flex justify-content-center SectionHeading lessonTitleId">
          <div className="col-11 col-md-10">
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
              {lastSubRelease && (
                <Link passHref href="#versions" style={{ color: 'black' }}>
                  <p>
                    Version {lastSubRelease.version}{' '}
                    (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
                  </p>
                </Link>
              )}
              <LocDropdown
                availLocs={availLocs}
                loc={lesson.locale}
                id={lesson.numID}
              />
            </div>
            <h1 id="lessonTitleId" ref={ref} className="mt-2">{lesson.Title}</h1>
            <h4 className='fw-light'>{lesson.Subtitle}</h4>
            {(LessonBannerImgUrl) && (
              <div className='w-100 position-relative mt-2 mb-2'>
                <Image
                  src={LessonBannerImgUrl}
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
              {isOnProduction ? <ShareWidget pinterestMedia={LessonBannerImgUrl} /> : <ShareWidget developmentUrl={`${lesson.URL}/`} pinterestMedia={LessonBannerImgUrl} />}
            </div>
            <div className='row mt-4 d-flex flex-column flex-sm-row align-content-center'>
              <div className="col-12 col-sm-8 col-md-8 col-lg-9 d-grid">
                <h5>Sponsored by:</h5>
                <RichText content={lesson.SponsoredBy} />
              </div>
              <div className="col-6 col-sm-4 col-md-4 col-lg-3 m-auto d-grid">
                {lesson.SponsorImage && lesson.SponsorImage.url && (
                  <div style={{ height: "180px" }} className='position-relative sponsorImgContainer d-sm-block d-flex justify-content-center align-items-center w-100'>
                    <Image
                      src={Array.isArray(lesson.SponsorImage.url) ? lesson.SponsorImage.url[0] : lesson.SponsorImage.url}
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
      <div className="container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
        <div className="col-11 col-md-10 p-0">
          {_sections.map((section, index) => (
            <ParentLessonSection
              key={index}
              section={section}
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

// should use the axios library to make the get request.

export const getStaticPaths = async () => {
  try {
    await connectToMongodb()

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

export const getStaticProps = async ({ params: { id, loc } }) => {
  await connectToMongodb();

  const targetLessons = await Lessons.find({ numID: id }, { __v: 0 }).lean();
  const targetLessonLocales = targetLessons.map(({ locale }) => locale)
  const targetLesson = targetLessons.find(({ numID, locale }) => ((numID === parseInt(id)) && (locale === loc)))

  return {
    props: {
      lesson: JSON.parse(JSON.stringify(targetLesson)),
      availLocs: targetLessonLocales,
    },
  };
};

export default LessonDetails;