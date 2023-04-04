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
import { useEffect, useState } from 'react';
import ParentLessonSection from '../../../components/LessonSection/ParentLessonSection';
import { useInView } from 'react-intersection-observer';
import LessonsSecsNavDots from '../../../components/LessonSection/LessonSecsNavDots';
import ShareWidget from '../../../components/AboutPgComps/ShareWidget';

const isOnProduction = process.env.NODE_ENV === 'production';

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  if (!versionSection) {
    return null;
  }

  const lastRelease = versionSection.Data[versionSection?.Data?.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease?.length - 1];
  return lastSubRelease;
};

const LessonDetails = ({ lesson, availLocs }) => {
  const lastSubRelease = getLatestSubRelease(lesson.Section);
  const { ref, inView } = useInView({ threshold: 0.2 });
  const _sections = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
  const getSectionDotsDefaultVal = () => {
    let startingSectionVals = [{ sectionId: 'title', isInView: true, SectionTitle: 'Title' }, ..._sections]
    startingSectionVals = startingSectionVals.filter(section => {
      if (((section?.__component === 'lesson-plan.overview') && !section?.SectionTitle)) {
        return true
      }

      return !!section?.SectionTitle
    })
    const LAST_2_SECTIONS = [{ name: 'acknowledgments', txtIdToAdd: "11." }, { name: 'version_notes', txtIdToAdd: "12." }]

    return startingSectionVals.map((section, index) => {
      const { SectionTitle, __component } = section
      const _sectionTitle = (__component === 'lesson-plan.overview') ? 'Overview' : SectionTitle;
      let sectionId = _sectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
      const targetLast2Section = LAST_2_SECTIONS.find(({ name }) => name === sectionId)

      if (targetLast2Section) {
        sectionId = `${targetLast2Section.txtIdToAdd}_${sectionId}`
      }

      return {
        isInView: index === 0,
        SectionTitle: _sectionTitle,
        sectionId: (index === 0) ? 'lessonTitleId' : sectionId,
        willShowTitle: false,
      }
    })
  }

  const [sectionDots, setSectionDots] = useState(getSectionDotsDefaultVal())

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
      {/* selectedLessonPg */}
      <LessonsSecsNavDots _sectionDots={[sectionDots, setSectionDots]} />
      <ShareWidget {...shareWidgetFixedProps} />
      <div className="container d-flex justify-content-center pt-4 pb-4">
        <div className="col-11 col-sm-12 col-md-10">
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
          <h1 ref={ref} id="lessonTitleId" className="mt-4">{lesson.Title}</h1>
          <h4 className='fw-light'>{lesson.Subtitle}</h4>
          {lesson.CoverImage && lesson.CoverImage.url && (
            <div className='position-relative mt-2 mb-2' style={{ height: 233, width: "100%" }}>
              <Image
                src={lesson.CoverImage.url}
                alt={lesson.Subtitle}
                fill
                className='d-md-block d-none'
                style={{ objectFit: 'fill' }}
              />
              <Image
                src={lesson.CoverImage.url}
                alt={lesson.Subtitle}
                fill
                className='d-md-none d-block'
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <div className='d-flex d-md-none'>
            <label className='d-flex justify-content-center align-items-center'>Share: </label>
            {isOnProduction ? <ShareWidget pinterestMedia={lesson.CoverImage.url} /> : <ShareWidget developmentUrl={`${lesson.URL}/`} pinterestMedia={lesson.CoverImage.url} />}
          </div>
          <div className='row mt-4 d-flex flex-column flex-sm-row'>
            <div className="col col-md-6 col-lg-9">
              <h5>Sponsored by:</h5>
              <RichText content={lesson.SponsoredBy} />
            </div>
            <div className="col col-md-6 col-lg-3 mt-3 mt-sm-0">
              <div style={{ height: '270.039px' }} className="position-relative">
                {lesson.SponsorImage && lesson.SponsorImage.url && (
                  <Image
                    src={Array.isArray(lesson.SponsorImage.url) ? lesson.SponsorImage.url[0] : lesson.SponsorImage.url}
                    alt={lesson.Subtitle}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
        <div className="col-12 col-sm-12 col-md-10 col-lg-8 p-0">
          {_sections.map((section, index) => (
            <ParentLessonSection
              key={index}
              section={section}
              index={index}
              _sectionDots={[sectionDots, setSectionDots]}
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
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  console.log('lessons: ', lessons)
  const lesson = lessons.find((lesson) => `${lesson.id}` === `${id}` && `${lesson.locale}` === loc);
  const availLocs = lessons.filter((lesson) => `${lesson.id}` === `${id}`).map((lesson) => lesson.locale);

  lesson.Section['teaching-materials'].Data = {
    ...lesson.Section.procedure.Data,
    ...lesson.Section['teaching-materials'].Data,
  };

  return { props: { lesson, availLocs } };
};

export default LessonDetails;