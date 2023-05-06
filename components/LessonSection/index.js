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

// the array below will have the following format: the name of the section, fields that contain the url

const SECTIONs_WITH_PICS = [ {  name: 'Overview', targetFields: ['SteamEpaulette', 'SteamEpaulette_vert'] } ]
const NAMES_OF_SECS_WITH_PICS = SECTIONs_WITH_PICS.map( section => section.name )

const LessonSection = ({ index, section, _sectionDots, oldLesson }) => {
  const Component = sectionTypeMap[section.__component];
  const compProps = { ...section, _sectionDots };
  
  if(NAMES_OF_SECS_WITH_PICS.includes(Component.name)){
    const targetSection = oldLesson.Section[Component.name.toLowerCase()]
    // GOAL: get the image urls of the target section using the target fields and pass them to the component
    // an object is creatd placed into the prop of oldLessonImgUrls via their names (i.e.: the object will have SteamEpaulette as its field, and its image url as its value)
    // loop through targetFields, and for each iteration do the following: create a key value pair for the oldLessonImgUrls. The key will be the value of the iteration
    // and the value will be the targetSection['value of the iteration']
    // loop through the targetFields array
    // get the targetFields array 
    // the target section is attained 
    // get the targetSection from  the SECTION_WITH_PICS array
    // create an object called oldLessonImgUrls
    let oldLessonImgUrls = {}
    const { targetFields } = SECTIONs_WITH_PICS.find( sectionWithPics => sectionWithPics.name === Component.name)

    targetFields.forEach(targetField => {
      oldLessonImgUrls[targetField] = targetSection[targetField]?.url
    })
    compProps.oldLessonImgUrls = oldLessonImgUrls
  }


  const parentId = `${section.SectionTitle}-parent-${index}`;
  
  return Component ? (
    <div id={parentId} className={`SectionHeading ${section.SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()}`}>
      <Component index={index} {...compProps} />
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
