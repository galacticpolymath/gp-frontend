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
import { useWindowWidth } from '@react-hook/window-size'
import LessonsSecsNavDots from '../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../components/AboutPgComps/ShareWidget';

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

const percentageSeen = element => {
  // Get the relevant measurements and positions
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY;
  const elementOffsetTop = element.offsetTop;
  const elementHeight = element.offsetHeight;

  // Calculate percentage of the element that's been seen
  const distance = scrollTop + (viewportHeight - elementOffsetTop);
  const percentage = Math.round(distance / ((viewportHeight + elementHeight) / 100));

  // Restrict the range to between 0 and 100
  return Math.min(100, Math.max(0, percentage));
};

const LessonDetails = ({ lesson, availLocs }) => {
  const lastSubRelease = getLatestSubRelease(lesson.Section);
  const { ref, inView } = useInView({ threshold: 0.2 });
  const windowWidth = useWindowWidth()
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
        SectionTitle: _sectionTitle
      }
    })
  }

  const _sectionDots = useMemo(() => getSectionDotsDefaultVal(), [])
  const [sectionDots, setSectionDots] = useState(_sectionDots)

  const handleDocumentClick = event => {
    const wasANavDotElementClicked = NAV_CLASSNAMES.some(className => event.target.classList.contains(className))

    if (!wasANavDotElementClicked && (windowWidth <= 767)) {
      setSectionDots(sectionDots => {
        if (sectionDots?.length) {
          return sectionDots.map(sectionDot => {
            return {
              ...sectionDot,
              willShowTitle: false,
            };
          })
        }

        return sectionDots;
      })
    }
  }

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentClick);

    return () => document.body.removeEventListener('click', handleDocumentClick);
  }, [])

  useEffect(() => {
    // console log when the parent element is in view
    // const parentElement = document.getElementById(parentId);
    // const sections = _sections.map(sectionDot => ({ ...sectionDot, sectionId: `${sectionDot.defaultSectionTitle}-parent`  })) 
    // console.log('sections: ', sections)
    // console.log("sectionDots: ", sectionDots)
    console.log("_sections: ", _sections)
    console.log("_sectionDots: ", _sectionDots)
    // GOAL: insert the sectionDotId for each section
    // for each iteration, using the sectiontitle, get its corresponding sectoinDotID from the _sectionDots array 
    const __sections = _sections.map(section => {
      const _sectionDotTarget = _sectionDots.find(({ SectionTitle }) => SectionTitle === section.SectionTitle) 
      return {
        ...section,
        sectionDotId: _sectionDotTarget.sectionDotId,
      }
    })

    console.log("__sections: ", __sections)

    // WHEN A SECTION IS IN VIEW, get its corresponding dot id and change it to blue
    
    // when a section is in view, change its corresponding dot to blue 

    // what do we have: 
    // _sections being mapped onto the dom 
    // the ids of the sections is SectionTitle-parent
    // _sectionDots are being mapped for the dots in the nav 
    // when a section is in the view, get its sectionDot id and get its corresponding dot and change it to blue 

    document.addEventListener('scroll', () => {
      // get all of the parent elements ids. check if they have a number. If they have a number, that means the element is in view. Get it's corresponding dot and turn it blue. Set all other dots to grey. 
      // change all dots to grey 
      // Using the id, get the element from the dom and change its color to blue 
      // the object that has number for percentageInview is attained. Get it's corresponding dot id  
      // const sectionId = document.getElementById(section.sectionId)
      // console.log('sectionId: ', sectionId)
      let inViewPercentagesSections = _sections.map(sectionDot => {
        const section = document.getElementById(`${sectionDot.SectionTitle}-parent`)
                
        return {
          ...sectionDot,
          percentageInView: percentageSeen(section),
        }
      })
      inViewPercentagesSections = inViewPercentagesSections.filter(section => section.percentageInView > 0)
      console.log('inViewPercentagesSections: ', inViewPercentagesSections)
      
    })
  }, [])

  useEffect(() => {
    if (inView) {
      setSectionDots(sectionDots => {
        if (sectionDots?.length) {
          return sectionDots.map(sectionDot => {
            if ((sectionDot.sectionId === 'lessonTitleId') && inView) {
              return {
                ...sectionDot,
                isInView: true,
              };
            }

            return {
              ...sectionDot,
              isInView: false,
            };
          })
        }

        return sectionDots;
      })
    }
  }, [inView])

  const shareWidgetFixedProps = isOnProduction ? { isOnSide: true, pinterestMedia: lesson.CoverImage.url } : { isOnSide: true, pinterestMedia: lesson.CoverImage.url, developmentUrl: `${lesson.URL}/` }

  return (
    <Layout>
      <LessonsSecsNavDots _sectionDots={[sectionDots, setSectionDots]} />
      <ShareWidget {...shareWidgetFixedProps} />
      <div className="container d-flex justify-content-center pt-4 pb-4">
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
            <div className="col-6 col-sm-4 col-md-4 col-lg-3 m-auto d-grid  ">

              {lesson.SponsorImage && lesson.SponsorImage.url && (
                <div className='position-relative'>
                  <Image
                    src={Array.isArray(lesson.SponsorImage.url) ? lesson.SponsorImage.url[0] : lesson.SponsorImage.url}
                    alt={lesson.Subtitle}
                    width={80}
                    height={80}
                    style={{ width: "100%", height: 'auto', objectFit: 'contain' }}
                  />
                </div>
              )}

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
              isAvailLocsMoreThan1={(availLocs.length > 1)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const paths = lessons.map(lesson => ({
    params: { id: `${lesson.id}`, loc: `${lesson.locale}` },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params: { id, loc } }) => {
  const res = await fetch('https://gp-catalog.vercel.app/index.json')
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