import PropTypes from 'prop-types';

import Overview from './Overview';
// import TextBlock from "./TextBlock";
// import Heading from "./Heading";
// import Procedure from "./Procedure/index";
// import TeachingResources from "./TeachingResources/index";
// import LearningChart from "./LearningChart";
// import Standards from "./Standards/index";
// import Acknowledgments from "./Acknowledgments";
// import Versions from "./Versions";
// import CollapsibleTextSection from "./CollapsibleTextSection";
import Preview from './Preview';

export const SECTIONS = {
  OVERVIEW: 'lesson-plan.overview',
  HEADING: 'lesson-plan.section-heading',
  TEXT_BLOCK: 'lesson-plan.text-block',
  PROCEDURE: 'lesson-plan.procedure',
  TEACHING_RESOURCES: 'teaching-resources.teaching-resources',
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
  SECTIONS.TEACHING_RESOURCES,
  SECTIONS.PROCEDURE,
  SECTIONS.ACKNOWLEDGMENTS,
  SECTIONS.VERSIONS,
  SECTIONS.COLLAPSIBLE_TEXT,
  SECTIONS.PREVIEW,
];

export const sectionTypeMap = {
  [SECTIONS.OVERVIEW]: Overview,
  // [SECTIONS.HEADING]: Heading,
  // [SECTIONS.TEXT_BLOCK]: TextBlock,
  // [SECTIONS.PROCEDURE]: Procedure,
  // [SECTIONS.TEACHING_RESOURCES]: TeachingResources,
  // [SECTIONS.LEARNING_CHART]: LearningChart,
  // [SECTIONS.STANDARDS]: Standards,
  // [SECTIONS.ACKNOWLEDGMENTS]: Acknowledgments,
  // [SECTIONS.VERSIONS]: Versions,
  // [SECTIONS.COLLAPSIBLE_TEXT]: CollapsibleTextSection,
  [SECTIONS.PREVIEW]: Preview,
};

const LessonSection = ({ index, section }) => {
  const Component = sectionTypeMap[section.__component];

  return Component ? (
    <Component index={index} {...section} />
  ) : (
    <div>Invalid section {section.__component}</div>
  );
};

LessonSection.propTypes = {
  index: PropTypes.number,
  section: PropTypes.object,
};

export default LessonSection;
