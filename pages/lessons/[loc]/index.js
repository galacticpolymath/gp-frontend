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

const LessonDetails = () => {
  // const lastSubRelease = getLatestSubRelease(lesson.Section);
  // const { ref, inView } = useInView({ threshold: 0.2 });
  // const _sections = Object.values(lesson.Section).filter(({ SectionTitle }) => SectionTitle !== 'Procedure');
  // const getSectionDotsDefaultVal = () => {
  //   let startingSectionVals = [{ sectionId: 'title', isInView: true, SectionTitle: 'Title' }, ..._sections]
  //   startingSectionVals = startingSectionVals.filter(section => {
  //     if (((section?.__component === 'lesson-plan.overview') && !section?.SectionTitle)) {
  //       return true
  //     }

  //     return !!section?.SectionTitle
  //   })
  //   const LAST_2_SECTIONS = [{ name: 'acknowledgments', txtIdToAdd: "11." }, { name: 'version_notes', txtIdToAdd: "12." }]

  //   return startingSectionVals.map((section, index) => {
  //     const { SectionTitle, __component } = section
  //     const _sectionTitle = (__component === 'lesson-plan.overview') ? 'Overview' : SectionTitle;
  //     let sectionId = _sectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
  //     const targetLast2Section = LAST_2_SECTIONS.find(({ name }) => name === sectionId)

  //     if (targetLast2Section) {
  //       sectionId = `${targetLast2Section.txtIdToAdd}_${sectionId}`
  //     }

  //     return {
  //       isInView: index === 0,
  //       SectionTitle: _sectionTitle,
  //       sectionId: (index === 0) ? 'lessonTitleId' : sectionId,
  //       willShowTitle: false,
  //     }
  //   })
  // }

  // const [sectionDots, setSectionDots] = useState(getSectionDotsDefaultVal())

  // const handleDocumentClick = event => {
  //   const wasANavDotElementClicked = NAV_CLASSNAMES.some(className => event.target.classList.contains(className))

  //   !wasANavDotElementClicked && setSectionDots(sectionDots => {
  //     if (sectionDots?.length) {
  //       return sectionDots.map(sectionDot => {
  //         return {
  //           ...sectionDot,
  //           willShowTitle: false,
  //         };
  //       })
  //     }

  //     return sectionDots;
  //   })
  // }

  // useEffect(() => {
  //   document.body.addEventListener('click', handleDocumentClick);

  //   return () => document.body.removeEventListener('click', handleDocumentClick);
  // }, [])

  // useEffect(() => {
  //   if (inView) {
  //     setSectionDots(sectionDots => {
  //       if (sectionDots?.length) {
  //         return sectionDots.map(sectionDot => {
  //           if ((sectionDot.sectionId === 'lessonTitleId') && inView) {
  //             return {
  //               ...sectionDot,
  //               isInView: true,
  //             };
  //           }

  //           return {
  //             ...sectionDot,
  //             isInView: false,
  //           };
  //         })
  //       }

  //       return sectionDots;
  //     })
  //   }
  // }, [inView])

  // const shareWidgetFixedProps = isOnProduction ? { isOnSide: true, pinterestMedia: lesson.CoverImage.url } : { isOnSide: true, pinterestMedia: lesson.CoverImage.url, developmentUrl: `${lesson.URL}/` }

  return (
    <Layout>
      <div className="lessonDetailsContainer min-vh-100 pt-3 ps-3">
        <span>404 page not found</span>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async (context) => {
  const REGEX = /\d+$/;

  if (REGEX.test(context.resolvedUrl)) {
    const lessonId = context.resolvedUrl.match(REGEX)[0];
    const res = await fetch('https://gp-catalog.vercel.app/index.json');
    const lessons = await res.json();
    const targetLesson = lessons.find(lesson => lesson.id === parseInt(lessonId));
    const _destination = `/lessons/${targetLesson.DefaultLocale}/${targetLesson.id}`;

    return {
      redirect: {
        destination: `/lessons/${targetLesson.DefaultLocale}/${targetLesson.id}`,
        permanent: true,
      },
    }
  }

  return { props: {} }
};

export default LessonDetails;