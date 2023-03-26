/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const CollapsibleRichTextSection = ({
  Content,
  InitiallyExpanded,
  ...props
}) => {
  const { _sectionDots, SectionTitle } = props;
  const { ref, h2Id } = useLessonElementInView(_sectionDots, SectionTitle);

  useEffect(() => {
    console.log('SectionTitle: ', SectionTitle);
    console.log('h2Id: ', h2Id);
  });
  
  return (
    <CollapsibleLessonSection initiallyExpanded={InitiallyExpanded} {...props}>
      <div ref={ref} className='container mx-auto mb-4'>
        <RichText className='mt-4' content={Content} />
      </div>
    </CollapsibleLessonSection>
  );
};

CollapsibleRichTextSection.propTypes = {
  Content: PropTypes.string,
};

export default CollapsibleRichTextSection;