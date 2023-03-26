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

import Layout from '../../../components/Layout';
import RichText from '../../../components/RichText';
import LessonSection, { NUMBERED_SECTIONS } from '../../../components/LessonSection';
import LocDropdown from '../../../components/LocDropdown';
import { useEffect, useState } from 'react';
import ParentLessonSection from '../../../components/LessonSection/ParentLessonSection';
import { useInView } from 'react-intersection-observer';
import LessonsSecsNavDots from '../../../components/LessonSection/LessonSecsNavDots';

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  if (!versionSection) {
    return null;
  }

  const lastRelease = versionSection.Data[versionSection.Data.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease.length - 1];
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
        willShowSecOnMobile: false,
      }
    })
  }
  const [sectionDots, setSectionDots] = useState(getSectionDotsDefaultVal())

  const handleDotClick = sectionId => {
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  useEffect(() => {
    if (inView) {
      setSectionDots(sectionDots => sectionDots.map(sectionDot => {
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
      }));
    }
  }, [inView])

  return (
    <Layout>
      {/* selectedLessonPg */}
      <LessonsSecsNavDots _sectionDots={[sectionDots, setSectionDots]} />
      <div className="container d-flex justify-content-center pt-4 pb-4">
        <div className="col-11 col-sm-12 col-md-10 col-lg-8">
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
            <img
              src={lesson.CoverImage.url}
              alt={lesson.Subtitle}
            />
          )}
          <div className='row mt-4'>
            <div className="col col-md-6 col-lg-9">
              <h5>Sponsored by:</h5>
              <RichText content={lesson.SponsoredBy} />
            </div>
            <div className="col col-md-6 col-lg-3 position-relative">
              {lesson.SponsorImage && lesson.SponsorImage.url && (
                <img
                  src={Array.isArray(lesson.SponsorImage.url) ? lesson.SponsorImage.url[0] : lesson.SponsorImage.url}
                  alt={lesson.Subtitle}
                />
              )}
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
  const lesson = lessons.find((lesson) => `${lesson.id}` === `${id}` && `${lesson.locale}` === loc);
  const availLocs = lessons.filter((lesson) => `${lesson.id}` === `${id}`).map((lesson) => lesson.locale);

  lesson.Section['teaching-materials'].Data = {
    ...lesson.Section.procedure.Data,
    ...lesson.Section['teaching-materials'].Data,
  };

  return { props: { lesson, availLocs } };
};

export default LessonDetails;