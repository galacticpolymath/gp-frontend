import { useRef } from 'react';
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';

const StandardsCollapsible = ({
  index,
  SectionTitle,
  _sectionDots,
}) => {
  const ref = useRef();

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  // For the LearningChart, must have the following props: 
    
  // Known props for LearningChart:
  // _sectionDots 
  // SectionTitle

  // Not known props for LearningCharts: 
  // Title
  // Description
  // Footnote
  // Badge

  return (
  // must have the following: 
  // the lesson section heading (achieved via the arguments for the CollaspibleLessonSection)
  // the learning chart (will be the child for CollaspibleLessonSection)
  // the learning standards (will be the child for CollaspibleLessonSection)
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
    </CollapsibleLessonSection>
  );
};

export default StandardsCollapsible;