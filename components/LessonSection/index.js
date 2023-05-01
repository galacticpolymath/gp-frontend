/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import PropTypes from 'prop-types';
import { InView } from 'react-intersection-observer';
import Overview from './Overview';
// import TextBlock from "./TextBlock";
import Heading from './Heading.js';
import TeachIt from './TeachIt';
import LearningChart from './LearningChart';
import Standards from './Standards';
import Acknowledgments from './Acknowledgments';
import Versions from './Versions';
import CollapsibleRichTextSection from './CollapsibleRichTextSection';
import Preview from './Preview';
import { useEffect } from 'react';

export const SECTIONS = {
  OVERVIEW: 'lesson-plan.overview',
  HEADING: 'lesson-plan.section-heading',
  TEXT_BLOCK: 'lesson-plan.text-block',

  // deprecated
  PROCEDURE: 'lesson-plan.procedure',

  TEACH_IT: 'teaching-resources.teaching-resources',
  LEARNING_CHART: 'lesson-plan.learning-chart',
  STANDARDS: 'lesson-plan.standards',
  ACKNOWLEDGMENTS: 'lesson-plan.acknowledgments',
  VERSIONS: 'lesson-plan.versions',
  COLLAPSIBLE_TEXT: 'lesson-plan.collapsible-text-section',
  PREVIEW: 'lesson-plan.lesson-preview',
};

export const NUMBERED_SECTIONS = [
  SECTIONS.OVERVIEW,
  SECTIONS.HEADING,
  SECTIONS.TEACH_IT,

  // deprecated
  SECTIONS.PROCEDURE,

  SECTIONS.ACKNOWLEDGMENTS,
  SECTIONS.VERSIONS,
  SECTIONS.COLLAPSIBLE_TEXT,
  SECTIONS.PREVIEW,
];

export const sectionTypeMap = {
  [SECTIONS.OVERVIEW]: Overview,
  [SECTIONS.HEADING]: Heading,
  // [SECTIONS.TEXT_BLOCK]: TextBlock,

  // deprecated
  [SECTIONS.PROCEDURE]: () => <></>,

  [SECTIONS.TEACH_IT]: TeachIt,
  [SECTIONS.LEARNING_CHART]: LearningChart,
  [SECTIONS.STANDARDS]: Standards,
  [SECTIONS.ACKNOWLEDGMENTS]: Acknowledgments,
  [SECTIONS.VERSIONS]: Versions,
  [SECTIONS.COLLAPSIBLE_TEXT]: CollapsibleRichTextSection,
  [SECTIONS.PREVIEW]: Preview,
};

const getPercentageSeen = element => {
  // Get the relevant measurements and positions
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY;
  const elementOffsetTop = element.offsetTop;
  const elementHeight = element.offsetHeight;

  // Calculate percentage of the element that's been seen
  const distance = scrollTop + (viewportHeight - elementOffsetTop);
  const percentage = (100 - Math.round(distance / ((viewportHeight + elementHeight) / 100)));

  // Restrict the range to between 0 and 100
  return Math.min(100, Math.max(0, percentage));
};


const LessonSection = ({ index, section, _sectionDots, _isScrollListenerOn, _wasDotClicked }) => {
  const Component = sectionTypeMap[section.__component];
  const [wasDotClicked, setWasDotClicked] = _wasDotClicked
  const [isScrollListenerOn, setIsScrollListenerOn] = _isScrollListenerOn
  // const _section = (isAvailLocsMoreThan1 && isOnLastTwoSections) ? { ...section, _sectionDots, isAvailLocsMoreThan1: isAvailLocsMoreThan1 } : { ...section, _sectionDots };
  const _section = { ...section, _sectionDots };
  const parentId = `${section.SectionTitle}-parent-${index}`;
  
  // GOAL: if on scroll is disabled, and if the ref is view, then enable the scroll after one second (to give time for the scroll to finish)
  // enable the scroll
  // the element is within the viewport 
  // if the element is within the viewport, then enable scrolling  
  // get the position of the element within the viewport
  // if the state of isAutoScroll is set false, then get the position of the element within the viewport after one second 
  // the state of isScrollListenerOn set false  
  // the state of isScrollListenerOn has changed 
  
  // let timer;
  // useEffect(() => {
  //   console.log('isScrollListenerOn: ', isScrollListenerOn)
  //   if(!isScrollListenerOn){
  //     timer = setTimeout(() => {
  //       const element = document.getElementById(parentId);
  //       const percentageSeen = getPercentageSeen(element);
  //       console.log('percentageSeen: ', percentageSeen)
  //       if(percentageSeen > 0){
  //         setIsScrollListenerOn(true)
  //       }
  //     }, 1000)
  //   }
  // }, [isScrollListenerOn])

  

  return Component ? (
    <div id={parentId}  className={`SectionHeading ${section.SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()}`}>
      <Component index={index} {..._section} />
    </div>
  ) : (
    <div>Invalid section {section.__component}</div>
  );
};

LessonSection.propTypes = {
  index: PropTypes.number,
  section: PropTypes.object,
};

export default LessonSection;
