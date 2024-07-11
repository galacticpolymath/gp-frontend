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
  GradesOrYears,
  Title,
  Footnote = '',
}) => {
  const ref = useRef();

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
      _sectionDots={_sectionDots}
      className='text-left'
      accordionId='standards_sec'
    >
      <div ref={ref}>
        {Badge && (
          <LearningChart
            Badge={Badge}
            Footnote={Footnote}
            Description={Description}
            Title={Title}
          />
        )}
        <div className={Badge ? '' : 'pt-3'}>
          <Standards Data={Data} GradesOrYears={GradesOrYears} />
        </div>
      </div>
    </CollapsibleLessonSection>
  );
};

export default StandardsCollapsible;