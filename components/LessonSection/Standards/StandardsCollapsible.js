import { useRef } from 'react';
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';
import LearningChart from '../LearningChart';
import Standards from '.';

const StandardsCollapsible = ({
  index,
  SectionTitle,
  _sectionDots,
  Badge,
  Data,
  Description,
  Title,
  Footnote = ""
}) => {
  const ref = useRef();

  useLessonElementInView(_sectionDots, SectionTitle, ref);
  
  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
      _sectionDots={_sectionDots}
      className='lessonsStandardsSec text-left bg-primary-light mb-4'
    >
      <div ref={ref}>
        <LearningChart
          Badge={Badge}
          Footnote={Footnote}
          Description={Description}
          Title={Title}
        />
        <Standards Data={Data} />
      </div>
    </CollapsibleLessonSection>
  );
};

export default StandardsCollapsible;