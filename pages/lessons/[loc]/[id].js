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
import { lessonsUrl } from '../../../apiGlobalVals';

const isOnProduction = process.env.NODE_ENV === 'production';
const NAV_CLASSNAMES = ['sectionNavDotLi', 'sectionNavDot', 'sectionTitleParent', 'sectionTitleLi', 'sectionTitleSpan']

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  if (!versionSection) {
    return null;
  }

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

  useEffect(() => {
    if (willGoToTargetSection) {
      scrollSectionIntoView(sectionDots.clickedSectionId)
      setWillGoToTargetSection(false)
    }
  }, [willGoToTargetSection])

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

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick);

    return () => document.body.removeEventListener('click', handleDocumentClick);
  }, [])

  const [wasDotClicked, setWasDotClicked] = useState(false)
  const [isScrollListenerOn, setIsScrollListenerOn] = useScrollHandler(setSectionDots)
  const shareWidgetFixedProps = isOnProduction ? { isOnSide: true, pinterestMedia: lesson.CoverImage.url } : { isOnSide: true, pinterestMedia: lesson.CoverImage.url, developmentUrl: `${lesson.URL}/` }
  const layoutProps = { title: `Lesson Title: ${lesson.Title}`, description: removeHtmlTags(lesson.Section.overview.Description), imgSrc: lesson.CoverImage.url, url: lesson.URL, imgAlt: `${lesson.Title} cover image` }

  return (
    <Layout {...layoutProps}>
      <LessonsSecsNavDots _sectionDots={[sectionDots, setSectionDots]} setWillGoToTargetSection={setWillGoToTargetSection} setIsScrollListenerOn={setIsScrollListenerOn} isScrollListenerOn={isScrollListenerOn} setWasDotClicked={setWasDotClicked} />
      <ShareWidget {...shareWidgetFixedProps} />
      <div id="lessonTitleSec" className="container d-flex justify-content-center pt-4 pb-4">
        <div id="lessonTitleSecId" className="SectionHeading lessonTitleId">
          <div className="col-11 col-md-10">
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
              {lastSubRelease && (
                <p>
                  Version {lastSubRelease.version}{' '}
                  (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
                </p>
              )}
              <LocDropdown
                availLocs={availLocs}
                loc={lesson.locale}
                id={lesson.id}
              />
            </div>
            <h1 id="lessonTitleId" ref={ref} className="mt-2">{lesson.Title}</h1>
            <h4 className='fw-light'>{lesson.Subtitle}</h4>
            {(lesson.CoverImage && lesson.CoverImage.url) && (
              <div className='w-100 position-relative mt-2 mb-2'>
                <Image
                  src={lesson.CoverImage.url}
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
              {isOnProduction ? <ShareWidget pinterestMedia={lesson.CoverImage.url} /> : <ShareWidget developmentUrl={`${lesson.URL}/`} pinterestMedia={lesson.CoverImage.url} />}
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

export const getStaticPaths = async () => {
  const res = await fetch(lessonsUrl);
  const lessons = await res.json();
  const paths = lessons.map(lesson => ({
    params: { id: `${lesson.id}`, loc: `${lesson.locale}` },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params: { id, loc } }) => {
  const res = await fetch(lessonsUrl)
  const lessons = await res.json();
  const lesson = lessons.find(lesson => `${lesson.id}` === `${id}` && `${lesson.locale}` === loc);
  const availLocs = lessons.filter(lesson => `${lesson.id}` === `${id}`).map((lesson) => lesson.locale);

  if (!lesson?.Section?.procedure?.Data) {
    return { props: { lesson, availLocs } };
  }

  lesson.Section['teaching-materials'].Data = {
    ...lesson.Section.procedure.Data,
    ...lesson.Section['teaching-materials'].Data,
  };

  return { props: { lesson, availLocs } };
};

export default LessonDetails;