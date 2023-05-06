/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable quotes */
import PropTypes from 'prop-types';
import Overview from './Overview';
import Heading from './Heading.js';
import TeachIt from './TeachIt';
import LearningChart from './LearningChart';
import Standards from './Standards';
import Acknowledgments from './Acknowledgments';
import Versions from './Versions';
import CollapsibleRichTextSection from './CollapsibleRichTextSection';
import Preview from './Preview';

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

const SECTIONS_WITH_PICS = [
  { name: 'Overview', targetFields: ['SteamEpaulette', 'SteamEpaulette_vert'], sectionCompName: 'Overview' },
  { name: 'LearningChart', targetFields: ['Badge'], sectionCompName: 'learning-chart' },
];
const NAMES_OF_SECS_WITH_PICS = SECTIONS_WITH_PICS.map(section => section.name);

const LessonSection = ({ index, section, _sectionDots, oldLesson }) => {
  const Component = sectionTypeMap[section.__component];
  const compProps = { ...section, _sectionDots };

  if (oldLesson && NAMES_OF_SECS_WITH_PICS.includes(Component.name)) {
    const compName = SECTIONS_WITH_PICS.find(sectionWithPics => sectionWithPics.name === Component.name).sectionCompName;
    const targetSection = oldLesson.Section[compName.toLowerCase()];
    let oldLessonImgUrlsObj = null;
    const { targetFields } = SECTIONS_WITH_PICS.find(sectionWithPics => sectionWithPics.name === Component.name);

    targetFields.forEach(targetField => {
      if (!targetSection[targetField]) {
        console.error('No field with back-up image.');
        return;
      }

      if (!oldLessonImgUrlsObj) {
        oldLessonImgUrlsObj = {};
      }

      oldLessonImgUrlsObj[targetField] = targetSection[targetField]?.url;
    });

    if (oldLessonImgUrlsObj) {
      compProps.oldLessonImgUrlsObj = oldLessonImgUrlsObj;
    }
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
