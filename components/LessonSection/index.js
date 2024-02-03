/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import PropTypes from 'prop-types';
import Overview from './Overview';
import Heading from './Heading.js';
import TeachIt from './TeachIt';
import LearningChart from './LearningChart';
import Acknowledgments from './Acknowledgments';
import Versions from './Versions';
import CollapsibleRichTextSection from './CollapsibleRichTextSection';
import Preview from './Preview';
import StandardsCollapsible from './Standards/StandardsCollapsible.js';

export const SECTIONS = {
  OVERVIEW: 'lesson-plan.overview',
  TEXT_BLOCK: 'lesson-plan.text-block',

  // deprecated components:
  PROCEDURE: 'lesson-plan.procedure',

  // No longer sections: 
  LEARNING_CHART: 'lesson-plan.learning-chart',
  HEADING: 'lesson-plan.section-heading',

  TEACH_IT: 'teaching-resources.teaching-resources',
  STANDARDS: 'lesson-plan.standards',
  ACKNOWLEDGMENTS: 'lesson-plan.acknowledgments',
  VERSIONS: 'lesson-plan.versions',
  COLLAPSIBLE_TEXT: 'lesson-plan.collapsible-text-section',
  PREVIEW: 'lesson-plan.unit-preview',
  LESSON_PREVIEW_FORMER: 'lesson-plan.lesson-preview',
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
  [SECTIONS.STANDARDS]: StandardsCollapsible,
  [SECTIONS.ACKNOWLEDGMENTS]: Acknowledgments,
  [SECTIONS.VERSIONS]: Versions,
  [SECTIONS.COLLAPSIBLE_TEXT]: CollapsibleRichTextSection,
  [SECTIONS.PREVIEW]: Preview,
  [SECTIONS.LESSON_PREVIEW_FORMER]: Preview,
};

const LessonSection = ({ index, section, _sectionDots, ForGrades }) => {
  const Component = sectionTypeMap[section.__component];
  let compProps = { ...section, _sectionDots };
  const parentId = `${section.SectionTitle}-parent-${index}`;

  if((typeof compProps.SectionTitle === "string") && compProps.SectionTitle.includes("Teaching Materials")){
    compProps = {
      ...compProps,
      ForGrades: ForGrades,
    };
  }

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
